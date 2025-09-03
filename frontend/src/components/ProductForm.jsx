import React, { useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import { AuthContext } from '../Context/ContextProvider';
import "../css/ProductForm.css";

function Field({ label, name, value, onChange, placeholder, type = "text", options, required = false }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {options ? (
        <select
          className="input-field-product-form"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          className="input-field-product-form"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          required={required}
        />
      )}
    </div>
  );
}

export default function ProductForm({ setRenderComponent, refreshProducts }) {
  const { token } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({
    name: "",
    productId: "",
    category: "",
    price: "",
    quantity: "",
    unit: "",
    expiry: "",
    threshold: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [productDetails, setProductDetails] = useState(null); // Store product details
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions

  const backendUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function onImageChange(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setForm((s) => ({ ...s, image: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please select a valid image file.");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true);

    try {

      const checkResponse = await fetch(`${backendUrl}/api/products/check-id/${encodeURIComponent(form.productId)}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.exists) {
          toast.error(`Product ID "${form.productId}" already exists! Please use a different ID.`);
          setIsSubmitting(false);
          return;
        } else {
          toast.success(`Product ID "${form.productId}" is available!`);
        }
      }

      const { image, ...productData } = form;
      const formData = new FormData();

      Object.keys(productData).forEach((key) => {
        formData.append(key, productData[key]);
      });

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`${backendUrl}/api/products`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {

          toast.error(errorData.message || "Product ID already exists!");
        } else {
          throw new Error(errorData.message || "Failed to add product");
        }
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      toast.success("Product added successfully!");
      setProductDetails({
        ...data,
        expiry: new Date(data.expiry).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        createdAt: new Date(data.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      });
      setForm({
        name: "",
        productId: "",
        category: "",
        price: "",
        quantity: "",
        unit: "",
        expiry: "",
        threshold: "",
        image: null,
      });
      setImagePreview(null);
      setRenderComponent(null); // Close the component after successful addition
      refreshProducts(true); // Trigger product table refresh with isNewProduct flag
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product: " + error.message);
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  }

  return (
    <form className="product-form" onSubmit={onSubmit}>
      {isMobile && (
        <div className="mobile-form-header">
          <h3 className="mobile-form-title">New Product</h3>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setRenderComponent(null)}
          >
            <img src="/template_close.svg" alt="Close" width={20} height={20} />
          </button>
        </div>
      )}

      {!isMobile && <h3 className="pf-title">New Product</h3>}

      <div className="pf-row upload-row">
        <div className="upload-box" aria-hidden>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="image-preview" height="100%" width="100%" />
          ) : (
            null
          )}
        </div>

        <div className="upload-actions">
          <p className="muted">Drag image here</p>
          <p className="muted-or">or</p>
          <label className="link-btn">
            Browse image
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      <div className="pf-grid" style={{ flexDirection: 'column' }}>
        <Field label="Product Name" name="name" value={form.name} onChange={onChange} placeholder="Enter product name" required />
        <Field label="Product ID" name="productId" value={form.productId} onChange={onChange} placeholder="Enter product ID" required />
        <Field
          label="Category"
          name="category"
          value={form.category}
          onChange={onChange}
          options={["electronics", "clothing", "food", "beverages", "furniture", "toys", "books", "stationery", "sports", "health", "beauty", "automotive", "gardening", "kitchen"]}
          required
        />
        <Field label="Price" name="price" value={form.price} onChange={onChange} placeholder="Enter price" required />
        <Field label="Quantity" name="quantity" value={form.quantity} onChange={onChange} placeholder="Enter product quantity" required />
        <Field label="Unit" name="unit" value={form.unit} onChange={onChange} placeholder="Enter product unit" required />
        <Field label="Expiry Date" name="expiry" value={form.expiry} onChange={onChange} placeholder="Enter expiry date" type="date" required />
        <Field label="Threshold Value" name="threshold" value={form.threshold} onChange={onChange} placeholder="Enter threshold value" required />
      </div>

      <div className="pf-actions">
        <button type="button" className="btn-outline" onClick={() => setRenderComponent(null)}>Discard</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
