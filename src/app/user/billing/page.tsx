'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Layout/Sidebar';
import { getUserToken, getUserData } from '@/lib/cookies';
import {
  Download,
  CreditCard,
  Calendar,
  FileText,
  Crown,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Receipt,
  Mail
} from 'lucide-react';

const BillingPage: React.FC = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterText, setFilterText] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  useEffect(() => {
    const token = getUserToken();
    const userData = getUserData();
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    setUser(userData);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white text-xl">Loading...</div>;
  }
  if (!user) return null;

  const handleUpgrade = () => {
    alert('Subscription upgraded!');
    setShowUpgradeDialog(false);
  };

  const handleEmailInvoice = () => {
    alert('Invoice sent to your email!');
    setShowEmailDialog(false);
  };

  const generateInvoice = (billId: string) => {
    console.log('Generating invoice for bill:', billId);
  };

  const openInvoicePreview = () => {
    const invoiceWindow = window.open('', '_blank', 'width=900,height=1200,scrollbars=yes');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - TradeSetu Technologies</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); color: #333; min-height: 100vh; padding: 15px; }
            .invoice-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden; position: relative; min-height: 100vh; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 25px; text-align: center; position: relative; overflow: hidden; }
            .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
            .header p { font-size: 14px; opacity: 0.9; font-weight: 500; }
            .company-details { font-size: 12px; margin-top: 15px; line-height: 1.6; opacity: 0.95; }
            .invoice-details { padding: 25px; background: #f8f9fa; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
            .invoice-info h2 { color: #2c3e50; font-size: 24px; font-weight: 700; margin-bottom: 15px; }
            .invoice-info p { margin: 8px 0; color: #555; font-size: 14px; }
            .highlight { color: #e74c3c; font-weight: 700; }
            .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-paid { background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; }
            .client-info { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .client-info h3 { color: #2c3e50; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
            .client-info p { margin: 6px 0; color: #555; font-size: 14px; }
            .items-section { padding: 25px; }
            .items-table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .items-table th { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px; text-align: left; font-weight: 600; font-size: 14px; }
            .items-table td { padding: 15px; border-bottom: 1px solid #eee; }
            .item-description { font-weight: 600; color: #2c3e50; margin-bottom: 5px; }
            .item-details { font-size: 12px; color: #7f8c8d; }
            .total-section { padding: 25px; background: #f8f9fa; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; }
            .total-row.final { border-top: 2px solid #667eea; margin-top: 10px; padding-top: 15px; font-weight: 700; font-size: 18px; color: #2c3e50; }
            .footer { padding: 25px; background: #2c3e50; color: white; }
            .compact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
            .compact-info h4 { color: #ecf0f1; font-size: 16px; font-weight: 600; margin-bottom: 8px; }
            .compact-info p { font-size: 13px; color: #bdc3c7; margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>TradeSetu Technologies</h1>
              <p>Advanced Trading Solutions & Financial Technology</p>
              <div class="company-details">
                <strong>GST:</strong> 27ABCDE1234F1Z5 | <strong>PAN:</strong> ABCDE1234F<br>
                123 Tech Park, Electronic City, Bangalore, Karnataka - 560001<br>
                <strong>Email:</strong> billing@tradesetu.com | <strong>Phone:</strong> +91 80 1234 5678
              </div>
            </div>
            
            <div class="invoice-details">
              <div class="invoice-header">
                <div class="invoice-info">
                  <h2>Tax Invoice</h2>
                  <p><strong>Invoice No:</strong> <span class="highlight">TS-2024-001</span></p>
                  <p><strong>Date:</strong> March 1, 2024 | <strong>Due:</strong> March 31, 2024</p>
                  <p><strong>Payment Terms:</strong> Net 30 Days</p>
                  <span class="status-badge status-paid">✓ PAID</span>
                </div>
                <div class="client-info">
                  <h3>Bill To:</h3>
                  <p><strong>PRAVEEN KUMAR</strong></p>
                  <p>📧 pkyadav941189@gmail.com</p>
                  <p>📍 Noida, UP - 204211</p>
                  <p>📞 +91 9411828907 | 🆔 PAN: ABCDE1234F</p>
                </div>
              </div>
            </div>
            
            <div class="items-section">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="item-description">Premium Trading Platform Subscription</div>
                      <div class="item-details">Advanced trading strategies, real-time market data, portfolio management</div>
                    </td>
                    <td>1</td>
                    <td>₹10,999.00</td>
                    <td>₹10,999.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="total-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹10,999.00</span>
              </div>
              <div class="total-row">
                <span>GST (18%):</span>
                <span>₹1,979.82</span>
              </div>
              <div class="total-row final">
                <span>Total Amount:</span>
                <span>₹12,978.82</span>
              </div>
            </div>
            
            <div class="footer">
              <div class="compact-grid">
                <div class="compact-info">
                  <h4>Bank Details</h4>
                  <p>HDFC Bank | A/C: 1234567890</p>
                  <p>IFSC: HDFC0001234 | Branch: Electronic City</p>
                </div>
                <div class="compact-info">
                  <h4>Payment Methods</h4>
                  <p>UPI ID: tradesetu@hdfc</p>
                  <p>GST: 27ABCDE1234F1Z5</p>
                </div>
              </div>
              <p style="margin-top: 10px; font-size: 10px; opacity: 0.7; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
                This is a computer generated invoice. No signature required. | Generated: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  // Mock billing data
  const billingData = [
    {
      id: '1',
      date: '2024-03-01',
      description: 'Premium Trading Platform Subscription',
      amount: 12978.82,
      status: 'PAID',
      invoice: 'TS-2024-001'
    },
    {
      id: '2',
      date: '2024-02-01',
      description: 'Premium Trading Platform Subscription',
      amount: 12978.82,
      status: 'PAID',
      invoice: 'TS-2024-002'
    },
    {
      id: '3',
      date: '2024-01-01',
      description: 'Premium Trading Platform Subscription',
      amount: 12978.82,
      status: 'PAID',
      invoice: 'TS-2024-003'
    }
  ];

  const filteredBills = billingData.filter(bill => {
    const matchesStatus = filterStatus === 'ALL' || bill.status === filterStatus;
    const matchesText = bill.description.toLowerCase().includes(filterText.toLowerCase()) ||
                       bill.invoice.toLowerCase().includes(filterText.toLowerCase());
    return matchesStatus && matchesText;
  });

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="hidden md:block fixed left-0 top-0 h-full z-10">
        <Sidebar activeTab="billing" onTabChange={() => {}} />
      </div>
      <div className="flex-1 flex min-w-0 md:ml-64">
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 space-y-6 md:ml-0 overflow-x-hidden">
            <div className="p-6 space-y-8">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl shadow-2xl shadow-purple-500/25">
                  <CreditCard size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Billing & Invoices</h1>
                  <p className="text-blue-200 mt-1">Manage your subscription and view billing history</p>
                </div>
              </div>

              {/* Current Plan Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-xl">
                      <Crown size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Premium Plan</h2>
                      <p className="text-blue-200">Active until March 31, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹12,978.82</p>
                    <p className="text-blue-200 text-sm">per month</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <button
                    onClick={() => setShowUpgradeDialog(true)}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="bg-white/10 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200"
                  >
                    Add Payment Method
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              {/* Billing History */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-xl font-semibold text-white">Billing History</h2>
                </div>
                <div className="divide-y divide-white/10">
                  {filteredBills.map((bill) => (
                    <div key={bill.id} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                            <Receipt size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{bill.description}</h3>
                            <div className="flex items-center space-x-4 text-sm text-blue-200">
                              <span className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{new Date(bill.date).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FileText size={14} />
                                <span>{bill.invoice}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-white">₹{bill.amount.toLocaleString()}</p>
                            <div className="flex items-center space-x-1">
                              {bill.status === 'PAID' ? (
                                <CheckCircle size={16} className="text-green-400" />
                              ) : bill.status === 'PENDING' ? (
                                <Clock size={16} className="text-yellow-400" />
                              ) : (
                                <AlertCircle size={16} className="text-red-400" />
                              )}
                              <span className={`text-sm font-medium ${
                                bill.status === 'PAID' ? 'text-green-400' :
                                bill.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {bill.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openInvoicePreview()}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
                              title="Download Invoice"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => setShowEmailDialog(true)}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200"
                              title="Email Invoice"
                            >
                              <Mail size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;