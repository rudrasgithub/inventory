import Product from '../models/Product.js';
import TotalCounter from '../models/TotalCounter.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const checkProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product with this ID already exists for this user
    const existingProduct = await Product.findOne({ 
      productId: productId, 
      userId: req.user._id 
    });

    res.status(200).json({ 
      exists: !!existingProduct,
      productId: productId
    });
  } catch (error) {
    console.error('Error checking product ID:', error);
    res.status(500).json({ message: 'Error checking product ID', error: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, productId, category, price, quantity, unit, expiry, threshold } = req.body;

    if (!name || !productId || !category || !price || !quantity || !unit || !expiry || !threshold) {
      return res.status(400).json({ message: 'All fields are required except the image.' });
    }

    // Convert to numbers for proper comparison
    const quantityNum = parseInt(quantity);
    const thresholdNum = parseInt(threshold);

    if (isNaN(quantityNum) || quantityNum < 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    if (isNaN(thresholdNum) || thresholdNum < 0) {
      return res.status(400).json({ message: 'Threshold must be a positive number' });
    }

    // Check if product ID already exists for this user
    const existingProduct = await Product.findOne({ 
      productId: productId, 
      userId: req.user._id 
    });

    if (existingProduct) {
      return res.status(409).json({ 
        message: `Product ID "${productId}" already exists. Please use a different ID.` 
      });
    }

    let status;
    if (quantityNum > thresholdNum) {
      status = "In-stock";
    } else if (quantityNum == 0) {
      status = "Out of stock";
    } else {
      status = "Low stock";
    }

    // Keep expiry as Date object for proper storage
    const expiryDate = new Date(expiry);

    // Handle image upload - convert to base64 if present
    let imageData = null;
    if (req.file) {
      imageData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const newProduct = new Product({
      name,
      productId,
      category,
      price: parseFloat(price),
      quantity: quantityNum,
      unit,
      expiry: expiryDate,
      threshold: thresholdNum,
      status, // This will be updated by the pre-save middleware anyway
      image: imageData,
      userId: req.user._id, // Add userId to associate product with current user
    });
    
    await newProduct.save();

    const counter = await TotalCounter.getCounter();
    counter.totalProducts += quantityNum;
    await counter.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ message: 'Error adding product', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body, 
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

export const getPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { productId: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
          { unit: { $regex: search, $options: 'i' } },
          // Convert numeric fields to strings for partial matching
          { $expr: { $regexMatch: { input: { $toString: "$price" }, regex: search, options: "i" } } },
          { $expr: { $regexMatch: { input: { $toString: "$quantity" }, regex: search, options: "i" } } },
          { $expr: { $regexMatch: { input: { $toString: "$threshold" }, regex: search, options: "i" } } },
          // Add date search - format expiry date as DD/MM/YYYY for searching
          { $expr: { 
            $regexMatch: { 
              input: { 
                $dateToString: { 
                  format: "%d/%m/%Y", 
                  date: "$expiry" 
                } 
              }, 
              regex: search, 
              options: "i" 
            } 
          } }
        ]
      };
    }

    const products = await Product.find({ ...searchQuery, userId: req.user._id }).skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments({ ...searchQuery, userId: req.user._id });

    res.status(200).json({
      products,
      totalProducts,
      totalPages: Math.max(1, Math.ceil(totalProducts / limit)), // Always show at least 1 page
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching paginated products', error });
  }
};

export const addBulkProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required and must not be empty.' });
    }

    const results = {
      successful: [],
      failed: []
    };

    let totalQuantityAdded = 0;

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      
      try {
        const { name, productId, category, price, quantity, unit, expiry, threshold } = productData;

        // Validate required fields
        if (!name || !productId || !category || !price || !quantity || !unit || !expiry || !threshold) {
          results.failed.push({
            row: i + 1,
            productData,
            error: 'All fields are required (name, productId, category, price, quantity, unit, expiry, threshold)'
          });
          continue;
        }

        // Convert to numbers for proper validation
        const quantityNum = parseInt(quantity);
        const thresholdNum = parseInt(threshold);
        const priceNum = parseFloat(price);

        if (isNaN(quantityNum) || quantityNum < 0) {
          results.failed.push({
            row: i + 1,
            productData,
            error: 'Quantity must be a positive number'
          });
          continue;
        }

        if (isNaN(thresholdNum) || thresholdNum < 0) {
          results.failed.push({
            row: i + 1,
            productData,
            error: 'Threshold must be a positive number'
          });
          continue;
        }

        if (isNaN(priceNum) || priceNum <= 0) {
          results.failed.push({
            row: i + 1,
            productData,
            error: 'Price must be a positive number'
          });
          continue;
        }

        // Check if product ID already exists for this user
        const existingProduct = await Product.findOne({ 
          productId, 
          userId: req.user._id 
        });
        if (existingProduct) {
          results.failed.push({
            row: i + 1,
            productData,
            error: `Product with ID '${productId}' already exists for your account`
          });
          continue;
        }

        // Determine status based on quantity and threshold
        let status;
        if (quantityNum > thresholdNum) {
          status = "In-stock";
        } else if (quantityNum === 0) {
          status = "Out of stock";
        } else {
          status = "Low stock";
        }

        // Parse expiry date
        const expiryDate = new Date(expiry);
        if (isNaN(expiryDate.getTime())) {
          results.failed.push({
            row: i + 1,
            productData,
            error: 'Invalid expiry date format'
          });
          continue;
        }

        // Create new product
        const newProduct = new Product({
          name,
          productId,
          category,
          price: priceNum,
          quantity: quantityNum,
          unit,
          expiry: expiryDate,
          threshold: thresholdNum,
          status,
          image: null, // CSV uploads don't include images
          userId: req.user._id // Add userId for bulk uploads
        });
        
        await newProduct.save();
        totalQuantityAdded += quantityNum;

        results.successful.push({
          row: i + 1,
          product: newProduct
        });

      } catch (error) {
        results.failed.push({
          row: i + 1,
          productData,
          error: error.message
        });
      }
    }

    // Update the totalProducts counter
    if (totalQuantityAdded > 0) {
      const counter = await TotalCounter.getCounter();
      counter.totalProducts += totalQuantityAdded;
      await counter.save();
    }

    res.status(201).json({
      message: `Bulk upload completed. ${results.successful.length} products added, ${results.failed.length} failed.`,
      results
    });

  } catch (error) {
    console.error('Error in bulk product upload:', error);
    res.status(500).json({ message: 'Error processing bulk upload', error: error.message });
  }
};

export const checkExpiredProducts = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Find products that have expired for current user
    const expiredProducts = await Product.find({
      userId: req.user._id,
      expiry: { $lt: today },
      status: { $ne: 'Expired' }
    });

    if (expiredProducts.length > 0) {
      await Product.updateMany(
        { userId: req.user._id, expiry: { $lt: today }, status: { $ne: 'Expired' } },
        { status: 'Expired', quantity: 0 }
      );
    }

    res.status(200).json({
      message: `Checked for expired products. ${expiredProducts.length} products expired.`,
      expiredCount: expiredProducts.length
    });

  } catch (error) {
    console.error('Error checking expired products:', error);
    res.status(500).json({ message: 'Error checking expired products', error: error.message });
  }
};
