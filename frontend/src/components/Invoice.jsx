import React, { useState, useEffect, useContext, useCallback } from "react"
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/ContextProvider';
import toast from 'react-hot-toast';
import "../css/Invoice.css"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import InvoiceTemplate from "./InvoiceTemplate"
import MobileHeader from "./MobileHeader"

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function Invoice() {
  const { token, isInitialized } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [invoices, setInvoices] = useState([]);
  const [overallStats, setOverallStats] = useState({
    recentTransactions: 0,
    totalInvoices: { last7Days: 0, processed: 0 },
    paidAmount: { last7Days: 0, customers: 0 },
    unpaidAmount: { ordered: 0, pendingPayments: 0 }
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalInvoices: 0,
    hasNext: false,
    hasPrev: false
  });
  const [search, setSearch] = useState("")
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [showOptions, setShowOptions] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogInvoiceId, setDeleteDialogInvoiceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchInvoices = useCallback(async (page = 1) => {
    if (!token) {
      console.log('No token available, skipping invoice fetch');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchOverallStats = useCallback(async () => {
    if (!token) {
      console.log('No token available, skipping stats fetch');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOverallStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token && isInitialized) {
      fetchInvoices();
      fetchOverallStats();
    }
  }, [isMobile, token, isInitialized, fetchInvoices, fetchOverallStats]);

  useEffect(() => {
    if (isInitialized && !token) {
      navigate('/login');
    }
  }, [token, isInitialized, navigate]);

  useEffect(() => {
    const filtered = invoices.filter((invoice) => {
      if (!search.trim()) return true;

      const searchLower = search.toLowerCase();

      return (
        invoice.invoiceId.toLowerCase().includes(searchLower) ||
        invoice.referenceNumber.toLowerCase().includes(searchLower) ||
        invoice.amount.toString().includes(searchLower) ||
        invoice.status.toLowerCase().includes(searchLower) ||
        new Date(invoice.dueDate).toLocaleDateString('en-GB').includes(searchLower)
      );
    });

    setFilteredInvoices(filtered);
  }, [search, invoices]);

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setLoading(true);
      await fetchInvoices(newPage);
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Invoice paid successfully!');
        await fetchInvoices(pagination.page); // Refresh current page
        await fetchOverallStats(); // Refresh stats
        setShowOptions(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to pay invoice');
      }
    } catch (error) {
      console.error('Error paying invoice:', error);
      toast.error('Network error occurred');
    }
  };

  const handleViewInvoice = async (invoice) => {
    try {

      await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/track-view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await fetch(`${API_BASE_URL}/api/invoices/${invoice._id}/view`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSelectedInvoice(invoice);
      setIsModalOpen(true);
      setShowOptions(null);

      await fetchOverallStats();
    } catch (error) {
      console.error('Error viewing invoice:', error);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Invoice deleted successfully!');
        await fetchInvoices(pagination.page);
        await fetchOverallStats();
        setIsDeleteDialogOpen(false);
        setShowOptions(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Network error occurred');
    }
  };

  const handleColonClick = (invoiceId) => {
    setShowOptions(invoiceId);
  };

  const closeOptions = () => {
    setShowOptions(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const openModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (invoiceId) => {
    setDeleteDialogInvoiceId(invoiceId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogInvoiceId(null);
    setIsDeleteDialogOpen(false);
  };

  const confirmDelete = () => {
    if (deleteDialogInvoiceId) {
      handleDeleteInvoice(deleteDialogInvoiceId);
      setIsDeleteDialogOpen(false);
      setDeleteDialogInvoiceId(null);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.options-dropdown') && !event.target.closest('img[src="/colon.svg"]')) {
        closeOptions();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideDialog = (event) => {
      if (
        isDeleteDialogOpen &&
        !event.target.closest('.options-dropdown') &&
        !event.target.closest('.btn-confirm-cancel') &&
        !event.target.closest('.btn-confirm-delete') &&
        !event.target.closest('.mobile-delete-btn') &&
        !event.target.closest('.mobile-delete-overlay')
      ) {
        closeDeleteDialog();
      }
    };

    document.addEventListener('click', handleClickOutsideDialog);

    return () => {
      document.removeEventListener('click', handleClickOutsideDialog);
    };
  }, [isDeleteDialogOpen]);

  if (!isInitialized || !token) {
    return null;
  }

  return (
    <div className="dashboard-invoice">
      {!isMobile && <Sidebar />}

      <div className={`main-invoice ${isModalOpen || (isMobile && isDeleteDialogOpen) ? "blurred" : ""}`}>
        {}
        {!isMobile && (
          <header className="invoice-header">
            <h1>Invoice</h1>
            <div className="search-box-invoice">
              <img src="/search-icon.svg" className="search-icon-invoice" />
              <input
                className="search-box-input-invoice"
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                title="Search across all fields: ID, reference, amount, status, date"
              />
            </div>
          </header>
        )}

  {isMobile && <MobileHeader />}

        <main className="invoice-content">
          {isMobile ? (

            <section className="mobile-invoice-overview">
              <h2>Overall Invoice</h2>
              <div className="mobile-invoice-overview-grid">
                <div className="mobile-invoice-card">
                  <p>Recent Transactions</p>
                  <div className="mobile-invoice-card-main-value">
                    <span className="large-number">{overallStats.recentTransactions || 0}</span>
                  </div>
                  <div className="mobile-invoice-card-meta">
                    <span>Last 7 days</span>
                  </div>
                </div>
                <div className="mobile-invoice-card">
                  <p>Total Invoices</p>
                  <div className="mobile-invoice-card-main-value horizontal">
                    <span className="large-number">{filteredInvoices.length || 0}</span>
                    <span className="secondary-number">{filteredInvoices.filter(inv => inv.status === 'paid').length || 0}</span>
                  </div>
                  <div className="mobile-invoice-card-meta horizontal-labels">
                    <span>Total</span>
                    <span>Processed</span>
                  </div>
                </div>
                <div className="mobile-invoice-card">
                  <p>Paid Amount</p>
                  <div className="mobile-invoice-card-main-value horizontal">
                    <span className="large-number">{formatCurrency(
                      filteredInvoices
                        .filter(inv => inv.status === 'paid')
                        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                    )}</span>
                    <span className="secondary-number">{filteredInvoices.filter(inv => inv.status === 'paid').length}</span>
                  </div>
                  <div className="mobile-invoice-card-meta horizontal-labels">
                    <span>Total Paid</span>
                    <span>Customers</span>
                  </div>
                </div>
                <div className="mobile-invoice-card">
                  <p>Unpaid Amount</p>
                  <div className="mobile-invoice-card-main-value horizontal">
                    <span className="large-number">{formatCurrency(
                      filteredInvoices
                        .filter(inv => inv.status === 'unpaid')
                        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                    )}</span>
                    <span className="secondary-number">{filteredInvoices.filter(inv => inv.status === 'unpaid').length}</span>
                  </div>
                  <div className="mobile-invoice-card-meta horizontal-labels">
                    <span>Total Unpaid</span>
                    <span>Pending Payment</span>
                  </div>
                </div>
              </div>
            </section>
          ) : (

            <section className="invoice-card-summary">
              <h2>Overall Invoice</h2>
              <div className="invoice-grid">
                <div className="invoice-grid-item">
                  <p className="invoice-label">Recent Transactions</p>
                  <p className="invoice-value">{overallStats.recentTransactions}</p>
                  <p className="invoice-note">Last 7 days</p>
                </div>
                <div className="invoice-grid-item">
                  <p className="invoice-label">Total Invoices</p>
                  <div className="invoice-value-split">
                    <span>{overallStats.totalInvoices.last7Days}</span>
                    <span>{overallStats.totalInvoices.processed}</span>
                  </div>
                  <div className="invoice-note-split">
                    <span>Last 7 days</span>
                    <span>Processed</span>
                  </div>
                </div>
                <div className="invoice-grid-item">
                  <p className="invoice-label">Paid Amount</p>
                  <div className="invoice-value-split">
                    <span>{formatCurrency(overallStats.paidAmount.last7Days)}</span>
                    <span>{overallStats.paidAmount.customers}</span>
                  </div>
                  <div className="invoice-note-split">
                    <span>Last 7 days</span>
                    <span>customers</span>
                  </div>
                </div>
                <div className="invoice-grid-item">
                  <p className="invoice-label">Unpaid Amount</p>
                  <div className="invoice-value-split">
                    <span>{formatCurrency(overallStats.unpaidAmount.ordered)}</span>
                    <span>{overallStats.unpaidAmount.pendingPayments}</span>
                  </div>
                  <div className="invoice-note-split">
                    <span>Ordered</span>
                    <span>Pending Payment</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="invoice-card-table">
            <h2>Invoices List</h2>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                Loading invoices...
              </div>
            ) : (
              <>
                {isMobile ? (

                  <div className="mobile-invoice-table">
                    <div className="mobile-table-header">
                      <div className="mobile-header-cell">Invoice ID</div>
                      <div className="mobile-header-cell"></div>
                    </div>
                    <div className="mobile-table-body">
                      {filteredInvoices.length === 0 ? (
                        <div className="mobile-no-invoices" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '40px 20px',
                          textAlign: 'center',
                          color: '#6B7280',
                          minHeight: '200px'
                        }}>
                          <img
                            src="/invoice.svg"
                            alt="No Invoices"
                            style={{
                              width: '64px',
                              height: '64px',
                              marginBottom: '16px',
                              opacity: 0.5
                            }}
                          />
                          <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '18px' }}>No invoices available</h3>
                        </div>
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <div key={invoice._id} className="mobile-table-row">
                            <div className="mobile-invoice-id-cell">
                              {invoice.invoiceId}
                            </div>
                            <div className="mobile-invoice-actions">
                              <button
                                className="mobile-view-btn"
                                onClick={() => openModal(invoice)}
                                title="View Invoice"
                              >
                                <img src="/invoice_view.svg" alt="View" width={20} height={20} />
                              </button>
                              <button
                                className="mobile-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(invoice._id);
                                }}
                                title="Delete Invoice"
                              >
                                <img src="/Delete.svg" alt="Delete" width={20} height={20} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (

                  <>
                    <table className="invoice-table">
                      <thead>
                        <tr>
                          <th>Invoice ID</th>
                          <th>Reference Number</th>
                          <th>Amount (₹)</th>
                          <th>Status</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px' }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6B7280'
                          }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Invoices Found</h3>
                          </div>
                        </td>
                      </tr>
                    ) : (
                    filteredInvoices.map((invoice, index) => (
                      <tr key={invoice._id} className={index % 2 === 1 ? "alt-row" : ""}>
                        <td>{invoice.invoiceId}</td>
                        <td>{invoice.referenceNumber}</td>
                        <td>₹ {invoice.amount.toLocaleString()}</td>
                        <td className={invoice.status.toLowerCase() === "paid" ? "paid" : "unpaid"}>
                          {invoice.status}
                        </td>
                        <td style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', position: 'relative' }}>
                          <span style={{ flexGrow: 1 }}>{formatDate(invoice.dueDate)}</span>
                          <img
                            src="/colon.svg"
                            style={{ width: '16px', height: '16px', cursor: 'pointer', marginLeft: '-50px', marginRight: '40px' }}
                            onClick={() => handleColonClick(invoice._id)}
                          />
                          {!isDeleteDialogOpen && showOptions === invoice._id && (
                            <div
                              className="options-dropdown"
                              style={{
                                position: 'absolute',
                                top: index >= filteredInvoices.length - 4 ? '-300%' : '100%',
                                left: '0',
                                background: 'white',
                                border: '1px solid rgb(0,0,0,0.2)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                padding: '8px',
                                zIndex: 10,
                              }}
                            >
                              <div
                                style={{ display: 'flex', alignItems: 'center', padding: '8px 8px', cursor: 'pointer' }}
                                onClick={() => invoice.status === 'Unpaid' ? handlePayInvoice(invoice._id) : handleViewInvoice(invoice)}
                              >
                                <img
                                  src="/invoice_view.svg"
                                  style={{ width: '16px', height: '16px', marginRight: '8px' }}
                                />
                                {invoice.status === 'Unpaid' ? 'Pay' : 'View Invoice'}
                              </div>
                              <div
                                style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', cursor: 'pointer' }}
                                onClick={() => handleDeleteClick(invoice._id)}
                              >
                                <img
                                  src="/Delete.svg"
                                  style={{ width: '16px', height: '16px', marginRight: '8px' }}
                                />
                                Delete
                              </div>
                            </div>
                          )}
                          {isDeleteDialogOpen && deleteDialogInvoiceId === invoice._id && (
                            <div style={{ position: 'absolute', width: '400px',
                              top: index >= filteredInvoices.length - 4 ? '-300%' : '100%', right: '20px', background: 'white', border: '1px solid rgb(0,0,0,0.2)', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '15px 20px', zIndex: 10 }}>
                              <p style={{ display: 'flex'}}>This invoice will be deleted.</p>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10%', marginTop: '40px' }}>
                                <button className="btn-confirm-cancel" onClick={closeDeleteDialog}>Cancel</button>
                                <button className="btn-confirm-delete" onClick={confirmDelete}>Confirm</button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}

            {!isMobile && (
              <div className="pagination-invoice">
                      <button
                        className="invoice-btn-outline"
                        disabled={!pagination.hasPrev}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        style={{
                          cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                          backgroundColor: pagination.hasPrev ? 'transparent' : '#f5f5f5',
                          opacity: pagination.hasPrev ? 1 : 0.6
                        }}
                      >
                        Previous
                      </button>
                      <span>Page {pagination.page} of {pagination.totalPages}</span>
                      <button
                        className="invoice-btn-outline"
                        disabled={!pagination.hasNext}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        style={{
                          cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                          backgroundColor: pagination.hasNext ? 'transparent' : '#f5f5f5',
                          opacity: pagination.hasNext ? 1 : 0.6
                        }}
                      >
                        Next
                      </button>
                    </div>
                )}
          </section>
        </main>
      </div>

      <InvoiceTemplate isOpen={isModalOpen} onClose={closeModal} invoice={selectedInvoice} />

      {}
      {isMobile && isDeleteDialogOpen && (
        <div className="mobile-delete-overlay" onClick={closeDeleteDialog}>
          <div className="mobile-delete-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="mobile-delete-message">This invoice will be deleted.</p>
            <div className="mobile-delete-actions">
              <button className="mobile-cancel-btn" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button className="mobile-confirm-btn" onClick={confirmDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {isMobile && <BottomNav />}
    </div>
  )
}
