'use client'

import React, { useState } from 'react';
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
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterText, setFilterText] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
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
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
              color: #333;
              min-height: 100vh;
              padding: 15px;
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.15);
              overflow: hidden;
              position: relative;
              min-height: 100vh;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px 25px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: float 6s ease-in-out infinite;
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-15px) rotate(180deg); }
            }
            
            .company-logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .company-details {
              font-size: 11px;
              opacity: 0.95;
              position: relative;
              z-index: 1;
              line-height: 1.4;
            }
            
            .invoice-details {
              padding: 20px 25px;
              border-bottom: 2px solid #f0f0f0;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            }
            
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 15px;
            }
            
            .invoice-info h2 {
              color: #667eea;
              margin: 0 0 10px 0;
              font-size: 20px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .invoice-info p {
              margin: 4px 0;
              color: #555;
              font-size: 12px;
            }
            
            .client-info h3 {
              color: #333;
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
            }
            
            .client-info p {
              margin: 3px 0;
              color: #555;
              font-size: 11px;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 15px;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 6px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .status-paid {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
            }
            
            .items-section {
              padding: 15px 25px;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              font-size: 11px;
            }
            
            .items-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 10px 8px;
              text-align: left;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .items-table td {
              padding: 8px;
              border-bottom: 1px solid #e9ecef;
              font-size: 11px;
              vertical-align: top;
            }
            
            .items-table tr:nth-child(even) {
              background: #f8f9fa;
            }
            
            .items-table tr:hover {
              background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
              transform: scale(1.005);
              transition: all 0.2s ease;
            }
            
            .item-description {
              font-weight: 600;
              color: #333;
              margin-bottom: 2px;
              font-size: 11px;
            }
            
            .item-details {
              color: #666;
              font-size: 9px;
              font-style: italic;
              line-height: 1.2;
            }
            
            .total-section {
              padding: 15px 25px;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border-top: 2px solid #e9ecef;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 6px 0;
              font-size: 13px;
              padding: 4px 0;
            }
            
            .total-row.final {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              border-top: 2px solid #667eea;
              padding-top: 8px;
              margin-top: 10px;
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
              border-radius: 8px;
              padding: 10px 15px;
            }
            
            .footer {
              padding: 15px 25px;
              background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
              color: white;
              text-align: center;
              font-size: 11px;
            }
            
            .footer p {
              margin: 4px 0;
              opacity: 0.9;
              line-height: 1.3;
            }
            
            .footer strong {
              color: #3498db;
            }
            
            .print-btn {
              position: fixed;
              top: 15px;
              right: 15px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 20px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
              transition: all 0.3s ease;
              z-index: 1000;
            }
            
            .print-btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              color: rgba(102, 126, 234, 0.03);
              font-weight: bold;
              pointer-events: none;
              z-index: 0;
            }
            
            @media print {
              .print-btn {
                display: none;
              }
              body {
                background: white;
                padding: 0;
                margin: 0;
              }
              .invoice-container {
                box-shadow: none;
                border-radius: 0;
                min-height: auto;
                max-height: none;
              }
              .watermark {
                display: none;
              }
              .header::before {
                display: none;
              }
              .items-table tr:hover {
                transform: none;
              }
              @page {
                size: A4;
                margin: 1cm;
              }
            }
            
            .highlight {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: bold;
            }
            
            .compact-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 10px;
            }
            
            .compact-info {
              background: rgba(255,255,255,0.1);
              padding: 8px 12px;
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.2);
            }
            
            .compact-info h4 {
              font-size: 10px;
              margin-bottom: 4px;
              opacity: 0.8;
            }
            
            .compact-info p {
              font-size: 11px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
          <div class="invoice-container">
            <div class="watermark">TRADESETU</div>
            
            <div class="header">
              <div class="company-logo">TradeSetu Technologies</div>
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
                             <div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(255,165,0,0.1) 100%); border-radius: 10px; border: 2px solid rgba(255,0,0,0.3); box-shadow: 0 4px 15px rgba(255,0,0,0.2);">
                 <p style="font-size: 11px; line-height: 1.4; margin: 0; text-align: center; font-weight: 600; color: #ff6b6b; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                   <strong style="font-size: 12px; color: #ff4757; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Important Disclaimer:</strong><br/>
                   <span style="font-weight: 700;">Securities and derivatives trading involves significant risk of loss. Past performance is not indicative of future results. We do not guarantee profits or returns. All trades are executed at the client's sole discretion and responsibility.</span>
                 </p>
               </div>
            </div>
          </div>
        </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl shadow-2xl shadow-purple-500/25">
          <CreditCard size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Billing & Invoices
          </h1>
          <p className="text-blue-200">Manage your subscription and payment history</p>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-purple-500/10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg">
            <Crown size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Current Subscription</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
            <div className="flex items-center space-x-3 mb-3">
              <Crown size={24} className="text-purple-400" />
              <p className="text-purple-200 text-sm font-semibold">Plan</p>
            </div>
            <p className="text-3xl font-bold text-purple-400">PREMIUM</p>
            <p className="text-sm text-purple-200">Monthly billing</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30">
            <div className="flex items-center space-x-3 mb-3">
              <Calendar size={24} className="text-blue-400" />
              <p className="text-blue-200 text-sm font-semibold">Next Billing</p>
            </div>
            <p className="text-2xl font-bold text-white">March 31, 2024</p>
            <p className="text-sm text-blue-200">₹10,999/month</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle size={24} className="text-green-400" />
              <p className="text-green-200 text-sm font-semibold">Status</p>
            </div>
            <p className="text-2xl font-bold text-green-400">Active</p>
            <p className="text-sm text-green-200">Auto-renewal enabled</p>
          </div>
        </div>
        
        {/* Upgrade Button */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
            onClick={() => setShowUpgradeDialog(true)}
          >
            <Crown size={20} />
            <span>Upgrade Subscription</span>
          </button>
        </div>

        {/* Upgrade Dialog */}
        {showUpgradeDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Crown size={24} className="text-purple-400" />
                <span>Upgrade Subscription</span>
              </h2>
              <p className="text-blue-200 mb-6">Are you sure you want to upgrade your subscription?</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 rounded-lg bg-white/10 text-blue-200 hover:bg-white/20"
                  onClick={() => setShowUpgradeDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:from-purple-600 hover:to-pink-700"
                  onClick={handleUpgrade}
                >
                  Confirm Upgrade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-blue-500/10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-2xl shadow-lg">
            <CreditCard size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                  <CreditCard size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">HDFC Credit Card</h3>
                  <p className="text-blue-200 text-sm">**** **** **** 1234</p>
                  <p className="text-green-200 text-sm">Expires: 12/25</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Default</span>
                <button className="p-2 rounded-lg bg-white/10 text-blue-400 hover:bg-white/20">Edit</button>
              </div>
            </div>
          </div>
          <button 
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center space-x-3" 
            onClick={() => setShowAddCard(true)}
          >
            <CreditCard size={20} />
            <span>Add New Payment Method</span>
          </button>
        </div>

        {/* Add Card Dialog */}
        {showAddCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <CreditCard size={24} className="text-blue-400" />
                <span>Add Payment Method</span>
              </h2>
              <input className="w-full mb-4 p-2 rounded bg-white/10 text-white border border-white/20" placeholder="Card Number" />
              <input className="w-full mb-4 p-2 rounded bg-white/10 text-white border border-white/20" placeholder="Expiry (MM/YY)" />
              <input className="w-full mb-4 p-2 rounded bg-white/10 text-white border border-white/20" placeholder="CVV" />
              <div className="flex justify-end space-x-4">
                <button className="px-4 py-2 rounded-lg bg-white/10 text-blue-200 hover:bg-white/20" onClick={() => setShowAddCard(false)}>Cancel</button>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-600 hover:to-cyan-700" onClick={() => {alert('Card added!'); setShowAddCard(false);}}>Add Card</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice History */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-green-500/10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
            <Receipt size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Invoice History</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 gap-2">
          <select className="p-2 rounded bg-white/10 text-white border border-white/20" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <input className="p-2 rounded bg-white/10 text-white border border-white/20" placeholder="Search by amount or bill no..." value={filterText} onChange={e => setFilterText(e.target.value)} />
        </div>

        {/* Download/Email Buttons */}
        <div className="flex items-center space-x-4 mb-6">
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-600 hover:to-cyan-700 flex items-center space-x-2" onClick={openInvoicePreview}>
            <Download size={18} />
            <span>View Invoice Preview</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 flex items-center space-x-2" onClick={() => setShowEmailDialog(true)}>
            <Mail size={18} />
            <span>Email Latest Invoice</span>
          </button>
        </div>

        {/* Email Dialog */}
        {showEmailDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Mail size={24} className="text-green-400" />
                <span>Email Invoice</span>
              </h2>
              <p className="text-blue-200 mb-6">Send the latest invoice to your registered email address?</p>
              <div className="flex justify-end space-x-4">
                <button className="px-4 py-2 rounded-lg bg-white/10 text-blue-200 hover:bg-white/20" onClick={() => setShowEmailDialog(false)}>Cancel</button>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700" onClick={handleEmailInvoice}>Send Email</button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice List */}
        <div className="space-y-6">
          {/* The mockBills data was removed, so this section will be empty or require a new data source */}
          {/* For now, we'll just show a placeholder message */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/20 text-center text-blue-200">
            No invoice history available.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;