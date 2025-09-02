import React, { useState, useRef, useEffect, useContext } from "react"
import toast from 'react-hot-toast'
import { AuthContext } from '../Context/ContextProvider';
import "../css/CSVModal.css"

export default function CSVModal({ onClose, refreshProducts }) {
  const { token } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const backendUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000'

  const handleCloseModal = () => {
    setIsOpen(false);
    if (typeof onClose === 'function') onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal-overlay-csv-modal')) {
        handleCloseModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleFileSelect = (files) => {
    if (files) {
      const fileArray = Array.from(files)
      
      // Validate file types
      const invalidFiles = fileArray.filter(
        (file) => file.type !== "text/csv" && !file.name.endsWith(".csv")
      )
      
      if (invalidFiles.length > 0) {
        toast.error(`Only CSV files are allowed! ${invalidFiles.length} invalid file(s) rejected.`)
        return
      }
      
      // Check file size (10MB limit)
      const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast.error(`File(s) too large! Maximum size is 10MB.`)
        return
      }
      
      const validFiles = fileArray.filter(
        (file) => (file.type === "text/csv" || file.name.endsWith(".csv")) && file.size <= 10 * 1024 * 1024
      )
      
      if (validFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...validFiles])
        toast.success(`${validFiles.length} CSV file(s) selected successfully!`)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '')
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row')
    }
    
    // Parse header
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase())
    
    // Required columns
    const requiredColumns = ['product name', 'product id', 'category', 'price', 'quantity', 'unit', 'expiry date', 'threshold value']
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
    }
    
    // Parse data rows
    const products = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(val => val.trim())
      
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`)
      }
      
      const product = {}
      headers.forEach((header, index) => {
        switch (header) {
          case 'product name':
            product.name = values[index]
            break
          case 'product id':
            product.productId = values[index]
            break
          case 'category':
            product.category = values[index]
            break
          case 'price':
            product.price = values[index]
            break
          case 'quantity':
            product.quantity = values[index]
            break
          case 'unit':
            product.unit = values[index]
            break
          case 'expiry date':
            // Handle different date formats but prioritize DD-MM-YYYY format
            let dateValue = values[index].trim();
            if (!dateValue) {
              throw new Error(`Row ${i + 1}: Expiry date is required`)
            }
            
            if (dateValue.includes('-')) {
              // Handle DD-MM-YYYY or YYYY-MM-DD
              const parts = dateValue.split('-');
              if (parts.length !== 3) {
                throw new Error(`Row ${i + 1}: Invalid date format. Use DD-MM-YYYY format`)
              }
              
              if (parts[0].length === 4) {
                // Format: YYYY-MM-DD (convert to YYYY-MM-DD for backend)
                dateValue = dateValue;
              } else {
                // Format: DD-MM-YYYY (preferred), convert to YYYY-MM-DD
                if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                  dateValue = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                } else {
                  throw new Error(`Row ${i + 1}: Invalid date format. Use DD-MM-YYYY format`)
                }
              }
            } else if (dateValue.includes('/')) {
              // Handle DD/MM/YYYY (also supported but not preferred)
              const parts = dateValue.split('/');
              if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
                throw new Error(`Row ${i + 1}: Invalid date format. Use DD-MM-YYYY format`)
              }
              dateValue = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else {
              throw new Error(`Row ${i + 1}: Invalid date format. Use DD-MM-YYYY format`)
            }
            product.expiry = dateValue;
            break
          case 'threshold value':
            product.threshold = values[index]
            break
        }
      })
      
      // Basic validation
      if (!product.name || !product.productId || !product.category) {
        throw new Error(`Row ${i + 1}: Missing required fields (name, productId, or category)`)
      }
      
      // Validate date format
      if (product.expiry) {
        const testDate = new Date(product.expiry);
        if (isNaN(testDate.getTime())) {
          throw new Error(`Row ${i + 1}: Invalid date format for expiry date. Use DD-MM-YYYY format`)
        }
      }
      
      products.push(product)
    }
    
    return products
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select at least one CSV file to upload')
      return
    }
    
    setIsUploading(true)
    
    try {
      for (const file of uploadedFiles) {
        const fileContent = await file.text()
        
        try {
          const products = parseCSV(fileContent)
          
          if (products.length === 0) {
            toast.error(`${file.name}: No valid products found`)
            continue
          }
          
          // Upload products to backend
          const response = await fetch(`${backendUrl}/api/products/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ products }),
          })
          
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to upload products')
          }
          
          // Show success/failure summary
          const { successful, failed } = data.results
          
          if (successful.length > 0) {
            toast.success(`${file.name}: ${successful.length} products uploaded successfully!`)
          }
          
          if (failed.length > 0) {
            toast.error(`${file.name}: ${failed.length} products failed to upload. See details below.`);
            console.group(`❌ Failed products from ${file.name}:`);
            failed.forEach(failure => {
              console.log(`Row ${failure.row}:`, failure.error);
              console.log('Data:', failure.productData);
            });
            console.groupEnd();
            
            // Show a summary of common errors
            const errorTypes = failed.reduce((acc, failure) => {
              const errorType = failure.error.includes('date') ? 'Date Format' :
                             failure.error.includes('exists') ? 'Duplicate ID' :
                             failure.error.includes('required') ? 'Missing Fields' : 'Other';
              acc[errorType] = (acc[errorType] || 0) + 1;
              return acc;
            }, {});
            
            const errorSummary = Object.entries(errorTypes)
              .map(([type, count]) => `${type}: ${count}`)
              .join(', ');
            
            toast.error(`Common issues: ${errorSummary}`, { duration: 6000 });
          }
          
        } catch (parseError) {
          console.error(`Error parsing ${file.name}:`, parseError)
          toast.error(`${file.name}: ${parseError.message}`)
        }
      }
      
      // Refresh the products list and close modal
      if (typeof refreshProducts === 'function') {
        await refreshProducts(true)
      }
      
      toast.success('CSV upload process completed!')
      
      setTimeout(() => {
        handleCloseModal();
      }, 2000)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay-csv-modal">
      <div className="modal-container-csv-modal">
        <button onClick={handleCloseModal} className="close-btn">
          <img src="/right.svg" size={24} />
        </button>

        <div className="modal-header">
          <h1>CSV Upload</h1>
          <p>Add your documents here</p>
        </div>

        <div
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="upload-icon">
            <img src="/upload.svg" width={42} height={42} />
          </div>

          <p className="upload-text">Drag your file(s) to start uploading</p>
          <p className="divider">OR</p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="browse-btn"
          >
            Browse files
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden-input"
          />
        </div>

        {uploadedFiles.length > 0 && (
          <div className="file-list">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-icon">
                  <img src="/csv-image.svg" height={30} width={30} style={{ color: "white" }} />
                </div>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="remove-btn"
                >
                  <img src="/right.svg" height={14} width={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          <button 
            onClick={handleCloseModal} 
            className="cancel-btn"
            disabled={isUploading}
            style={{
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button 
            className="upload-btn"
            onClick={uploadedFiles.length > 0 ? handleUpload : undefined}
            disabled={isUploading || uploadedFiles.length === 0}
            style={{
              cursor: isUploading || uploadedFiles.length === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: isUploading ? '#666' : '#00181b',
              opacity: isUploading || uploadedFiles.length === 0 ? 0.6 : 1
            }}
          >
            {isUploading ? 'Uploading...' : uploadedFiles.length > 0 ? "Upload" : "Next"}
            {!isUploading && uploadedFiles.length === 0 && <img src="/chevron.svg" />}
          </button>
        </div>
      </div>
    </div>
  )
}
