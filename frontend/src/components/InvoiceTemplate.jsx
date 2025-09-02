import React, { useState, useEffect } from "react";
import "../css/InvoiceTemplate.css";
import BottomNav from "./BottomNav";

export default function InvoiceTemplate({ isOpen, onClose, invoice }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 414);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 414);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const defaultInvoiceData = {
    invoiceNumber: "INV-1007",
    invoiceDate: "01-Apr-2025",
    reference: "INV-057",
    dueDate: "15-Apr-2025",
    billedTo: {
      companyName: "Inventory",
      address: "Konaphalam",
      location: "Repalle, India - 522262",
    },
    businessAddress: {
      address: "Business address",
      location: "City, State, IN - 000 000",
      taxId: "TAX ID 000XXXX1234XXXX",
    },
    items: [
      { product: "Basmati Rice (5kg)", qty: 1, price: 1090 },
      { product: "Aashirvaad Atta (10kg)", qty: 1, price: 545 },
      { product: "Fortune Sunflower Oil (5L)", qty: 1, price: 1090 },
      { product: "Amul Toned Milk (1L)", qty: 5, price: 273 },
      { product: "Tata Salt (1kg)", qty: 2, price: 55 },
      { product: "Maggi Noodles (12-pack)", qty: 1, price: 138 },
      { product: "Good Day Biscuits (10 packs)", qty: 1, price: 227 },
      { product: "Red Label Tea (500g)", qty: 1, price: 263 },
      { product: "Sugar (5kg)", qty: 1, price: 272 },
      { product: "Mixed Vegetables", qty: "1", price: 1090 },
    ],
    subtotal: 5090,
    tax: 510,
    total: 5600,
  };

  // Use the provided invoice data or fallback to default
  const invoiceData = invoice ? {
    invoiceNumber: invoice.invoiceId,
    invoiceDate: new Date(invoice.createdAt).toLocaleDateString('en-GB'),
    reference: invoice.referenceNumber,
    dueDate: new Date(invoice.dueDate).toLocaleDateString('en-GB'),
    billedTo: defaultInvoiceData.billedTo,
    businessAddress: defaultInvoiceData.businessAddress,
    items: invoice.products || [],
    subtotal: invoice.amount * 0.9, // Assuming 10% tax
    tax: invoice.amount * 0.1,
    total: invoice.amount,
  } : defaultInvoiceData;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-invoice-template" onClick={onClose}>
      <div className="modal-content-invoice-template" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-template-container">
          <div className="close-button">
            <button className="btn-close" onClick={onClose}>×</button>
          </div>

          <div className="invoice-template-card">
            <div className="invoice-template-header">
              <h1>INVOICE</h1>

              <div className="invoice-template-info">
                <div>
                  <p>Billed to</p>
                  <h5>{invoiceData.billedTo.companyName}</h5>
                  <p>{invoiceData.billedTo.address}</p>
                  <p>{invoiceData.billedTo.location}</p>
                </div>
                <div className="text-right">
                  <p>{invoiceData.businessAddress.address}</p>
                  <p>{invoiceData.businessAddress.location}</p>
                  <p>{invoiceData.businessAddress.taxId}</p>
                </div>
              </div>
            </div>

            <div className="invoice-template-body">
              <div className="invoice-template-details">
                <div>
                  <p className="template-label">Invoice #</p>
                  <p>{invoiceData.invoiceNumber}</p>
                </div>
                <div>
                  <p className="template-label">Invoice date</p>
                  <p>{invoiceData.invoiceDate}</p>
                </div>
                <div>
                  <p className="template-label">Reference</p>
                  <p>{invoiceData.reference}</p>
                </div>
                <div>
                  <p className="template-label">Due date</p>
                  <p>{invoiceData.dueDate}</p>
                </div>
              </div>

              <div className="invoice-template-table">
                <div className="invoice-template-table-header">
                  <p>Products</p>
                  <p>Qty</p>
                  <p>Price</p>
                </div>

                <div className="invoice-template-table-body">
                  {invoiceData.items.map((item, index) => (
                    <div className="table-row" key={index}>
                      <p className="col-6">{item.productName || item.product}</p>
                      <p className="col-2 text-center">{item.quantity || item.qty}</p>
                      <p className="col-4 text-right">₹{item.price}</p>
                    </div>
                  ))}
                </div>

                <div className="invoice-template-table-footer">
                  <div className="footer-row">
                    <span>Subtotal</span>
                    <span>₹{invoiceData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="footer-row">
                    <span>Tax (10%)</span>
                    <span>₹{invoiceData.tax}</span>
                  </div>  
                </div>
                  <div className="footer-row total">
                    <span>Total due</span>
                    <span className="highlight">₹{invoiceData.total.toLocaleString()}</span>
                  </div>
                  
                  <div className="payment-notice">
                    <p>📋 Please pay within 15 days of receiving this invoice.</p>
                  </div>
              </div>
            </div>

            <div className="invoice-template-footer">
              <span>www.receipthq.inc</span>
              <span>+91 00000 00000</span>
              <span>hello@email.com</span>
            </div>
          </div>
        </div>
        
        {/* Add Bottom Navigation for mobile */}
        {isMobile && <BottomNav />}
      </div>
    </div>
  );
}
