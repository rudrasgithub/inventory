import React, { useState, useEffect } from "react";
import "../css/InvoiceTemplate.css";
import BottomNav from "./BottomNav";

export default function InvoiceTemplate({ isOpen, onClose, invoice }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 414);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 414);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

    const handleDownload = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 0.5in;
              size: A4;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: white;
              color: #1a1c21;
              line-height: 1.4;
            }
            .invoice-card {
              width: 100%;
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
            }
            .invoice-header {
              padding: 24px 32px 20px 32px;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: 600;
              color: #1a1c21;
              margin: 0 0 20px 0;
              letter-spacing: 1.5px;
            }
            .invoice-addresses {
              display: flex;
              justify-content: space-between;
              gap: 32px;
            }
            .invoice-billed-to,
            .invoice-business-address {
              flex: 1;
            }
            .invoice-business-address {
              text-align: right;
            }
            .invoice-address-label {
              font-size: 12px;
              font-weight: 600;
              color: #1a1c21;
              margin: 0 0 8px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .invoice-address-details {
              margin-top: 8px;
            }
            .invoice-company-name {
              font-size: 14px;
              font-weight: 500;
              color: #1a1c21;
              margin: 0 0 4px 0;
            }
            .invoice-address-line {
              font-size: 12px;
              color: rgba(26, 28, 33, 0.7);
              margin: 2px 0;
              line-height: 1.5;
            }
            .invoice-divider {
              height: 1px;
              background-color: #d7dae0;
              margin: 0;
            }
            .invoice-body {
              padding: 24px 32px;
            }
            .invoice-content {
              display: grid;
              grid-template-columns: 180px 1fr;
              gap: 32px;
            }
            .invoice-meta {
              display: flex;
              flex-direction: column;
              gap: 24px;
            }
            .invoice-meta-item {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .invoice-meta-label {
              font-size: 12px;
              color: rgba(26, 28, 33, 0.6);
              margin: 0;
              font-weight: 400;
            }
            .invoice-meta-value {
              font-size: 12px;
              font-weight: 500;
              color: #1a1c21;
              margin: 0;
            }
            .invoice-table-container {
              overflow: hidden;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              text-align: left;
            }
            .invoice-table-header {
              background-color: #f9fafb;
            }
            .invoice-header-row {
              border-bottom: 1px solid #e5e7eb;
            }
            .invoice-header-cell {
              padding: 10px 12px;
              font-size: 11px;
              font-weight: 600;
              color: #374151;
              text-align: left;
            }
            .invoice-header-cell:last-child {
              text-align: right;
            }
            .invoice-table-body {
              background-color: white;
            }
            .invoice-table-row {
              border-bottom: 1px solid #f3f4f6;
            }
            .invoice-table-row:last-of-type {
              border-bottom: none;
            }
            .invoice-table-cell {
              padding: 10px 12px;
              font-size: 11px;
              color: #1f2937;
              vertical-align: top;
            }
            .invoice-quantity,
            .invoice-price {
              text-align: right;
            }
            .invoice-subtotal-row,
            .invoice-tax-row {
              border-top: 1px solid #d7dae0;
            }
            .invoice-subtotal-label,
            .invoice-tax-label {
              color: rgba(26, 28, 33, 0.7) !important;
              font-weight: 400;
            }
            .invoice-subtotal-value,
            .invoice-tax-value {
              text-align: right;
              font-weight: 500;
            }
            .invoice-total-row {
              background-color: rgba(0, 135, 153, 0.1);
            }
            .invoice-total-label {
              color: #008799 !important;
              font-weight: 600;
            }
            .invoice-total-value {
              text-align: right;
              color: #008799;
              font-weight: 600;
            }
            .invoice-payment-terms {
              margin-top: 24px;
              display: flex;
              align-items: flex-start;
              gap: 8px;
            }
            .invoice-terms-checkbox {
              margin-top: 2px;
              width: 14px;
              height: 14px;
              border-radius: 2px;
              border: 1px solid #d7dae0;
            }
            .invoice-terms-text {
              font-size: 12px;
              color: rgba(26, 28, 33, 0.7);
              line-height: 1.5;
            }
            .invoice-footer {
              margin-top: 20px;
              border-top: 1px solid #d7dae0;
              padding: 20px 32px;
            }
            .invoice-footer-content {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              text-align: center;
            }
            .invoice-footer-item {
              font-size: 12px;
              color: rgba(26, 28, 33, 0.8);
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="invoice-header">
              <h1 class="invoice-title">INVOICE</h1>
              <div class="invoice-addresses">
                <div class="invoice-billed-to">
                  <p class="invoice-address-label">Billed to</p>
                  <div class="invoice-address-details">
                    <p class="invoice-company-name">${invoiceData.billedTo.companyName}</p>
                    <p class="invoice-address-line">${invoiceData.billedTo.address}</p>
                    <p class="invoice-address-line">${invoiceData.billedTo.location}</p>
                  </div>
                </div>
                <div class="invoice-business-address">
                  <p class="invoice-address-label">Business address</p>
                  <div class="invoice-address-details">
                    <p class="invoice-address-line">${invoiceData.businessAddress.address}</p>
                    <p class="invoice-address-line">${invoiceData.businessAddress.location}</p>
                    <p class="invoice-address-line">${invoiceData.businessAddress.taxId}</p>
                  </div>
                </div>
              </div>
            </div>
            <hr class="invoice-divider" />
            <div class="invoice-body">
              <div class="invoice-content">
                <div class="invoice-meta">
                  <div class="invoice-meta-item">
                    <p class="invoice-meta-label">Invoice #</p>
                    <p class="invoice-meta-value">${invoiceData.invoiceNumber}</p>
                  </div>
                  <div class="invoice-meta-item">
                    <p class="invoice-meta-label">Invoice date</p>
                    <p class="invoice-meta-value">${invoiceData.invoiceDate}</p>
                  </div>
                  <div class="invoice-meta-item">
                    <p class="invoice-meta-label">Reference</p>
                    <p class="invoice-meta-value">${invoiceData.reference}</p>
                  </div>
                  <div class="invoice-meta-item">
                    <p class="invoice-meta-label">Due date</p>
                    <p class="invoice-meta-value">${invoiceData.dueDate}</p>
                  </div>
                </div>
                <div class="invoice-table-container">
                  <table class="invoice-table">
                    <thead class="invoice-table-header">
                      <tr class="invoice-header-row">
                        <th class="invoice-header-cell">Products</th>
                        <th class="invoice-header-cell">Qty</th>
                        <th class="invoice-header-cell">Price</th>
                      </tr>
                    </thead>
                    <tbody class="invoice-table-body">
                      ${invoiceData.items.map(item => `
                        <tr class="invoice-table-row">
                          <td class="invoice-table-cell">${item.productName || item.product}</td>
                          <td class="invoice-table-cell invoice-quantity">${item.quantity || item.qty}</td>
                          <td class="invoice-table-cell invoice-price">₹${item.price}</td>
                        </tr>
                      `).join('')}
                      <tr class="invoice-table-row invoice-subtotal-row">
                        <td colspan="2" class="invoice-table-cell invoice-subtotal-label">Subtotal</td>
                        <td class="invoice-table-cell invoice-subtotal-value">₹${invoiceData.subtotal.toLocaleString()}</td>
                      </tr>
                      <tr class="invoice-table-row invoice-tax-row">
                        <td colspan="2" class="invoice-table-cell invoice-tax-label">Tax (10%)</td>
                        <td class="invoice-table-cell invoice-tax-value">₹${invoiceData.tax}</td>
                      </tr>
                      <tr class="invoice-table-row invoice-total-row">
                        <td colspan="2" class="invoice-table-cell invoice-total-label">Total due</td>
                        <td class="invoice-table-cell invoice-total-value">₹${invoiceData.total.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="invoice-payment-terms">
                <input type="checkbox" class="invoice-terms-checkbox" checked />
                <span class="invoice-terms-text">Please pay within 15 days of receiving this invoice.</span>
              </div>
            </div>
            <div class="invoice-footer">
              <div class="invoice-footer-content">
                <p class="invoice-footer-item">www.receipthq.inc</p>
                <p class="invoice-footer-item">+91 00000 00000</p>
                <p class="invoice-footer-item">hello@email.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  };

  const handlePrint = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 0.5in;
              size: A4;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
            @media (max-width: 414px) {
              .invoice-addresses {
                flex-direction: column;
                gap: 20px;
              }
              .invoice-business-address {
                text-align: left;
              }
            }
            @media (max-width: 414px) {
              .invoice-addresses {
                flex-direction: column;
                gap: 20px;
              }
              .invoice-business-address {
                text-align: left;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: white;
              color: #1a1c21;
              line-height: 1.4;
            }
            .invoice-card {
              width: 100%;
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
            }
            .invoice-header {
              padding: 24px 32px 20px 32px;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: 600;
              color: #1a1c21;
              margin: 0 0 20px 0;
              letter-spacing: 1.5px;
            }
            .invoice-addresses {
              display: flex;
              justify-content: space-between;
              gap: 32px;
            }
            .invoice-billed-to,
            .invoice-business-address {
              flex: 1;
            }
            .invoice-business-address {
              text-align: right;
            }
            .invoice-address-label {
              font-size: 12px;
              font-weight: 600;
              color: #1a1c21;
              margin: 0 0 8px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .invoice-address-details {
              margin-top: 8px;
            }
            .invoice-company-name {
              font-size: 14px;
              font-weight: 500;
              color: #1a1c21;
              margin: 0 0 4px 0;
            }
            .invoice-address-line {
              font-size: 12px;
              color: rgba(26, 28, 33, 0.7);
              margin: 2px 0;
              line-height: 1.5;
            }
            .invoice-divider {
              height: 1px;
              background-color: #d7dae0;
              margin: 0;
            }
            .invoice-body {
              padding: 24px 32px;
            }
            .invoice-content {
              display: grid;
              grid-template-columns: 180px 1fr;
              gap: 32px;
            }
            .invoice-meta {
              display: flex;
              flex-direction: column;
              gap: 24px;
            }
            .invoice-meta-item {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .invoice-meta-label {
              font-size: 12px;
              color: rgba(26, 28, 33, 0.6);
              margin: 0;
              font-weight: 400;
            }
            .invoice-meta-value {
              font-size: 12px;
              font-weight: 500;
              color: #1a1c21;
              margin: 0;
            }
            .invoice-table-container {
              overflow: hidden;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              text-align: left;
            }
            .invoice-table-header {
              background-color: #f9fafb;
            }
            .invoice-header-row {
              border-bottom: 1px solid #e5e7eb;
            }
            .invoice-header-cell {
              padding: 10px 12px;
              font-size: 11px;
              font-weight: 600;
              color: #374151;
              text-align: left;
            }
            .invoice-header-cell:last-child {
              text-align: right;
            }
            .invoice-table-body {
              background-color: white;
            }
            .invoice-table-row {
              border-bottom: 1px solid #f3f4f6;
            }
            .invoice-table-row:last-of-type {
              border-bottom: none;
            }
            .invoice-table-cell {
              padding: 10px 12px;
              font-size: 11px;
              color: #1f2937;
              vertical-align: top;
            }
            .invoice-quantity,
            .invoice-price {
              text-align: right;
            }
            .invoice-subtotal-row,
            .invoice-tax-row {
              border-top: 1px solid #d7dae0;
            }
            .invoice-subtotal-label,
            .invoice-tax-label {
              color: rgba(26, 28, 33, 0.7) !important;
              font-weight: 400;
            }
            .invoice-subtotal-value,
            .invoice-tax-value {
              text-align: right;
              font-weight: 500;
            }
            .invoice-total-row {
              background-color: rgba(0, 135, 153, 0.1) !important;
            }
            .invoice-total-label {
              color: #008799 !important;
              font-weight: 600;
            }
            .invoice-total-value {
              text-align: right;
              color: #008799 !important;
              font-weight: 600;
            }
            .invoice-payment-terms {
              margin-top: 24px;
              display: flex;
              align-items: flex-start;
              gap: 8px;
            }
            .invoice-terms-checkbox {
              margin-top: 2px;
              width: 14px;
              height: 14px;
              border-radius: 2px;
              border: 1px solid #d7dae0;
            }
            .invoice-terms-text {
              font-size: 12px;
              color: rgba(26, 28, 33, 0.7);
              line-height: 1.5;
            }
            .invoice-footer {
              margin-top: 20px;
              border-top: 1px solid #d7dae0;
              padding: 20px 32px;
            }
            .invoice-footer-content {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              text-align: center;
            }
            .invoice-footer-item {
              font-size: 12px;
              color: rgba(26, 28, 33, 0.8);
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="invoice-header">
              <h1 class="invoice-title">INVOICE</h1>
              <div class="invoice-addresses">
                <div class="invoice-billed-to">
                  <p class="invoice-address-label">Billed to</p>
                  <div class="invoice-address-details">
                    <p class="invoice-company-name">${invoiceData.billedTo.companyName}</p>
                    <p class="invoice-address-line">${invoiceData.billedTo.address}</p>
                    <p class="invoice-address-line">${invoiceData.billedTo.location}</p>
                  </div>
                </div>
                <div class="invoice-business-address">
                  <p class="invoice-address-label">Business address</p>
                  <div class="invoice-address-details">
                    <p class="invoice-address-line">${invoiceData.businessAddress.address}</p>
                    <p class="invoice-address-line">${invoiceData.businessAddress.location}</p>
                    <p class="invoice-address-line">${invoiceData.businessAddress.taxId}</p>
                  </div>
                </div>
              </div>
            </div>
            <hr class="invoice-divider" />
            <div class="invoice-body">
              <div class="invoice-content">
                <div class="invoice-meta">
                  <div class="invoice-meta-item">
                    <p class="invoice-meta-label">Invoice #</p>
                    <p class="invoice-meta-value">${invoiceData.invoiceNumber}</p>
                  </div>
                  <div class="invoice-meta-item">
                    <p class="invoice-meta-label">Invoice date</p>
                    <p class="invoice-meta-value">${invoiceData.invoiceDate}</p>
                  </div>
                  <div class="invoice-meta-item">
                    <p class="invoice-meta-label">Reference</p>
                    <p class="invoice-meta-value">${invoiceData.reference}</p>
                  </div>
                  <div class="invoice-meta-item">
                    <p class="invoice-meta-label">Due date</p>
                    <p class="invoice-meta-value">${invoiceData.dueDate}</p>
                  </div>
                </div>
                <div class="invoice-table-container">
                  <table class="invoice-table">
                    <thead class="invoice-table-header">
                      <tr class="invoice-header-row">
                        <th class="invoice-header-cell">Products</th>
                        <th class="invoice-header-cell">Qty</th>
                        <th class="invoice-header-cell">Price</th>
                      </tr>
                    </thead>
                    <tbody class="invoice-table-body">
                      ${invoiceData.items.map(item => `
                        <tr class="invoice-table-row">
                          <td class="invoice-table-cell">${item.productName || item.product}</td>
                          <td class="invoice-table-cell invoice-quantity">${item.quantity || item.qty}</td>
                          <td class="invoice-table-cell invoice-price">₹${item.price}</td>
                        </tr>
                      `).join('')}
                      <tr class="invoice-table-row invoice-subtotal-row">
                        <td colspan="2" class="invoice-table-cell invoice-subtotal-label">Subtotal</td>
                        <td class="invoice-table-cell invoice-subtotal-value">₹${invoiceData.subtotal.toLocaleString()}</td>
                      </tr>
                      <tr class="invoice-table-row invoice-tax-row">
                        <td colspan="2" class="invoice-table-cell invoice-tax-label">Tax (10%)</td>
                        <td class="invoice-table-cell invoice-tax-value">₹${invoiceData.tax}</td>
                      </tr>
                      <tr class="invoice-table-row invoice-total-row">
                        <td colspan="2" class="invoice-table-cell invoice-total-label">Total due</td>
                        <td class="invoice-table-cell invoice-total-value">₹${invoiceData.total.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="invoice-payment-terms">
                <input type="checkbox" class="invoice-terms-checkbox" checked />
                <span class="invoice-terms-text">Please pay within 15 days of receiving this invoice.</span>
              </div>
            </div>
            <div class="invoice-footer">
              <div class="invoice-footer-content">
                <p class="invoice-footer-item">www.receipthq.inc</p>
                <p class="invoice-footer-item">+91 00000 00000</p>
                <p class="invoice-footer-item">hello@email.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  };
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
      location: "Tirupati, Andhra Pradesh, IN - 111 111",
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
    <div className="invoice-template-modal-overlay" onClick={onClose}>
      <div className="invoice-template-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-template-modal-container">
          <div className="invoice-template-card" id="invoice-content">
            <div className="invoice-template-header">
              <h1 id="invoice-title" className="invoice-template-title">INVOICE</h1>
              <div className="invoice-template-addresses">
                <div className="invoice-template-billed-to">
                  <p className="invoice-template-address-label">Billed to</p>
                  <div className="invoice-template-address-details">
                    <p className="invoice-template-company-name">{invoiceData.billedTo.companyName}</p>
                    <p className="invoice-template-address-line">{invoiceData.billedTo.address}</p>
                    <p className="invoice-template-address-line">{invoiceData.billedTo.location}</p>
                  </div>
                </div>
                <div className="invoice-template-business-address">
                  <p className="invoice-template-address-label">Business address</p>
                  <div className="invoice-template-address-details">
                    <p className="invoice-template-address-line">{invoiceData.businessAddress.address}</p>
                    <p className="invoice-template-address-line">{invoiceData.businessAddress.location}</p>
                    <p className="invoice-template-address-line">{invoiceData.businessAddress.taxId}</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="invoice-template-divider" />

            <div className="invoice-template-body">
              <div className="invoice-template-content">
                <div className="invoice-template-meta">
                  <div className="invoice-template-meta-item">
                    <p className="invoice-template-meta-label">Invoice #</p>
                    <p className="invoice-template-meta-value">{invoiceData.invoiceNumber}</p>
                  </div>
                  <div className="invoice-template-meta-item">
                    <p className="invoice-template-meta-label">Invoice date</p>
                    <p className="invoice-template-meta-value">{invoiceData.invoiceDate}</p>
                  </div>
                  <div className="invoice-template-meta-item">
                    <p className="invoice-template-meta-label">Reference</p>
                    <p className="invoice-template-meta-value">{invoiceData.reference}</p>
                  </div>
                  <div className="invoice-template-meta-item">
                    <p className="invoice-template-meta-label">Due date</p>
                    <p className="invoice-template-meta-value">{invoiceData.dueDate}</p>
                  </div>
                </div>

                <div className="invoice-template-table-container">
                  <table className="invoice-template-table">
                    <thead className="invoice-template-table-header">
                      <tr className="invoice-template-header-row">
                        <th className="invoice-template-header-cell">Products</th>
                        <th className="invoice-template-header-cell">Qty</th>
                        <th className="invoice-template-header-cell">Price</th>
                      </tr>
                    </thead>
                    <tbody className="invoice-template-table-body">
                      {invoiceData.items.map((item, index) => (
                        <tr className="invoice-template-table-row" key={index}>
                          <td className="invoice-template-table-cell">{item.productName || item.product}</td>
                          <td className="invoice-template-table-cell invoice-template-quantity">{item.quantity || item.qty}</td>
                          <td className="invoice-template-table-cell invoice-template-price">₹{item.price}</td>
                        </tr>
                      ))}
                      <tr className="invoice-template-table-row invoice-template-subtotal-row">
                        <td colSpan="2" className="invoice-template-table-cell invoice-template-subtotal-label">Subtotal</td>
                        <td className="invoice-template-table-cell invoice-template-subtotal-value">₹{invoiceData.subtotal.toLocaleString()}</td>
                      </tr>
                      <tr className="invoice-template-table-row invoice-template-tax-row">
                        <td colSpan="2" className="invoice-template-table-cell invoice-template-tax-label">Tax (10%)</td>
                        <td className="invoice-template-table-cell invoice-template-tax-value">₹{invoiceData.tax}</td>
                      </tr>
                      <tr className="invoice-template-table-row invoice-template-total-row">
                        <td colSpan="2" className="invoice-template-table-cell invoice-template-total-label">Total due</td>
                        <td className="invoice-template-table-cell invoice-template-total-value">₹{invoiceData.total.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="invoice-template-payment-terms">
                <img src="/peek.svg" />
                <span className="invoice-template-terms-text">Please pay within 15 days of receiving this invoice.</span>
              </div>
            </div>

            <div className="invoice-template-footer">
              <div className="invoice-template-footer-content">
                <p className="invoice-template-footer-item">www.inventory.com</p>
                <p className="invoice-template-footer-item">+91 00000 00000</p>
                <p className="invoice-template-footer-item">inventory@email.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="invoice-template-action-buttons">
          <button className="invoice-template-close-btn" onClick={onClose}>
            <img src="/template_close.svg" alt="Close" />
          </button>
          <button className="invoice-template-download-btn" onClick={handleDownload} title="Download PDF">
            <img src="/download.svg" />
          </button>
          <button className="invoice-template-print-btn" onClick={handlePrint} title="Print Invoice">
            <img src="/print.svg" />
          </button>
        </div>
        {isMobile && <BottomNav />}
      </div>
    </div>
  );
}
