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
  Building,
  User,
  BarChart3,
  Target,
  Activity,
  Users,
  Mail,
  Shield,
  Lock,
  Smartphone,
  QrCode,
  Wallet,
  Building2,
  TrendingUp,
  MessageCircle,
  Video,
  Link,
  Settings,
  Palette,
  Bell,
  Heart
} from 'lucide-react';
import { mockBills } from '../../../data/mockData';

const BillingPage: React.FC = () => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterText, setFilterText] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showTaxReports, setShowTaxReports] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  
  const handleUpgrade = () => {
    alert('Subscription upgraded!');
    setShowUpgradeDialog(false);
  };
  const handleEmailInvoice = () => {
    alert('Invoice sent to your email!');
    setShowEmailDialog(false);
  };
  const handlePayment = (method: string) => {
    alert(`Payment initiated via ${method}!`);
    setShowPaymentGateway(false);
  };

  const generateInvoice = (billId: string) => {
    // Simulate invoice generation
    console.log('Generating invoice for bill:', billId);
  };



  return (
    <div className="p-6 space-y-8">
      {/* Next Renewal Reminder Banner */}
      <div className="mb-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <Clock size={24} className="text-green-400" />
          <span className="text-lg text-white font-semibold">Next Renewal: <span className="text-green-200">March 31, 2024</span> (₹10,999)</span>
        </div>
        <button className="px-4 py-2 rounded-lg bg-white/10 text-blue-200 hover:bg-white/20" onClick={() => alert('Reminder set!')}>Set Reminder</button>
      </div>
      {/* Header with 3D effect */}
      <div className="flex items-center space-x-4 transform hover:scale-105 transition-all duration-300">
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

      {/* Current Subscription with 3D Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-purple-500/10 transform hover:scale-[1.02] transition-all duration-500">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg">
            <Crown size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Current Subscription</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <Crown size={24} className="text-purple-400" />
              <p className="text-purple-200 text-sm font-semibold">Plan</p>
            </div>
            <p className="text-3xl font-bold text-purple-400">PREMIUM</p>
            <p className="text-sm text-purple-200">Monthly billing</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <Calendar size={24} className="text-blue-400" />
              <p className="text-blue-200 text-sm font-semibold">Next Billing</p>
            </div>
            <p className="text-2xl font-bold text-white">March 31, 2024</p>
            <p className="text-sm text-blue-200">₹10,999/month</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle size={24} className="text-green-400" />
              <p className="text-green-200 text-sm font-semibold">Status</p>
            </div>
            <p className="text-2xl font-bold text-green-400">Active</p>
            <p className="text-sm text-green-200">Auto-renewal enabled</p>
          </div>
        </div>
        
        {/* Current Plan Features */}
        <div className="mt-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-400/30">
          <div className="flex items-center space-x-3 mb-4">
            <Crown size={20} className="text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Your Premium Plan Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-purple-200">5 Trading Strategies</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-purple-200">Real-time Data</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-purple-200">Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-purple-200">Priority Support</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-purple-200">Custom Indicators</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-purple-200">Portfolio Management</span>
            </div>
          </div>
        </div>
        {/* Upgrade Subscription Button */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
            onClick={() => setShowUpgradeDialog(true)}
          >
            <Crown size={20} />
            <span>Upgrade Subscription</span>
          </button>
        </div>
        {/* Upgrade Confirmation Dialog */}
        {showUpgradeDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <Crown size={24} className="text-purple-400" />
                <span>Upgrade Subscription</span>
              </h2>
              <p className="text-blue-200 mb-6">Are you sure you want to upgrade your subscription? You will be charged the new plan amount on your next billing cycle.</p>
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

      {/* Payment Method Management */}
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
          <button className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center space-x-3" onClick={() => setShowAddCard(true)}>
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
      {/* Usage Analytics & Limits */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-purple-500/10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Usage Analytics</h2>
        </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Target size={20} className="text-purple-400" />
               <h3 className="text-white font-semibold">Trading Strategies</h3>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between">
                 <span className="text-purple-200">Used</span>
                 <span className="text-white font-bold">3/5</span>
               </div>
               <div className="w-full bg-white/10 rounded-full h-2">
                 <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{width: '60%'}}></div>
               </div>
             </div>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Users size={20} className="text-green-400" />
               <h3 className="text-white font-semibold">Support Tickets</h3>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between">
                 <span className="text-green-200">Used</span>
                 <span className="text-white font-bold">2/Unlimited</span>
               </div>
               <div className="w-full bg-white/10 rounded-full h-2">
                 <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{width: '100%'}}></div>
               </div>
             </div>
           </div>
         </div>
      </div>
      {/* Invoice History with 3D Cards */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-green-500/10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
            <Receipt size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Invoice History</h2>
        </div>
                 {/* Billing History Filters */}
         <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 gap-2">
           <select className="p-2 rounded bg-white/10 text-white border border-white/20" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
             <option value="ALL">All Statuses</option>
             <option value="PAID">Paid</option>
             <option value="EXPIRED">Expired</option>
           </select>
           <input className="p-2 rounded bg-white/10 text-white border border-white/20" placeholder="Search by amount or bill no..." value={filterText} onChange={e => setFilterText(e.target.value)} />
         </div>
        {/* Download/Email Invoice Button */}
        <div className="flex items-center space-x-4 mb-6">
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-600 hover:to-cyan-700 flex items-center space-x-2" onClick={() => alert('Invoice downloaded!')}>
            <Download size={18} />
            <span>Download Latest Invoice</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 flex items-center space-x-2" onClick={() => setShowEmailDialog(true)}>
            <Mail size={18} />
            <span>Email Latest Invoice</span>
          </button>
        </div>
        {/* Email Invoice Dialog */}
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
        {/* Invoice List (filtered) */}
        <div className="space-y-6">
          {mockBills.filter(bill => {
            const statusMatch = filterStatus === 'ALL' || bill.status === filterStatus;
            const textMatch = filterText === '' || bill.bill_number.includes(filterText) || bill.total_amount.toString().includes(filterText);
            return statusMatch && textMatch;
          }).map((bill, index) => (
            <div
              key={bill.id}
              className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
                    <FileText size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Invoice #{bill.bill_number}</h3>
                    <p className="text-blue-200 text-sm">{bill.billing_period}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">₹{bill.total_amount.toLocaleString()}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      bill.status === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-400/30' :
                      bill.status === 'EXPIRED' ? 'bg-gray-500/20 text-gray-300 border border-gray-400/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                    }`}>
                      {bill.status === 'PAID' && <CheckCircle size={14} className="inline mr-1" />}
                      {bill.status === 'EXPIRED' && <AlertCircle size={14} className="inline mr-1" />}
                      {bill.status}
                    </span>
                    <button
                      onClick={() => generateInvoice(bill.id)}
                      className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={16} className="text-green-400" />
                    <p className="text-green-200 font-semibold">Amount</p>
                  </div>
                  <p className="text-white font-bold text-lg">₹{bill.amount.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building size={16} className="text-blue-400" />
                    <p className="text-blue-200 font-semibold">GST (18%)</p>
                  </div>
                  <p className="text-white font-bold text-lg">₹{bill.gst_amount.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar size={16} className="text-purple-400" />
                    <p className="text-purple-200 font-semibold">Due Date</p>
                  </div>
                  <p className="text-white font-bold text-lg">{bill.due_date.toLocaleDateString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <p className="text-green-200 font-semibold">Paid Date</p>
                  </div>
                  <p className="text-white font-bold text-lg">
                    {bill.paid_at ? bill.paid_at.toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* GST Invoice Sample with 3D Design */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-orange-500/10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg">
            <Receipt size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">GST Invoice Preview</h2>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="border-b border-white/20 pb-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl">
                <Building size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">TradeSetu Technologies</h3>
                <p className="text-blue-200">GST: 27ABCDE1234F1Z5</p>
                <p className="text-blue-200">123 Tech Park, Bangalore, Karnataka - 560001</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User size={20} className="text-purple-400" />
                <h4 className="font-semibold text-white text-lg">Bill To:</h4>
              </div>
              <p className="text-blue-200">John Doe</p>
              <p className="text-blue-200">123 Trading Street</p>
              <p className="text-blue-200">Mumbai, Maharashtra - 400001</p>
              <p className="text-blue-200">PAN: ABCDE1234F</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText size={20} className="text-green-400" />
                <h4 className="font-semibold text-white text-lg">Invoice Details:</h4>
              </div>
              <p className="text-blue-200">Invoice No: TS-2024-001</p>
              <p className="text-blue-200">Date: March 1, 2024</p>
              <p className="text-blue-200">Due Date: March 31, 2024</p>
              <p className="text-blue-200">Payment Terms: Net 30</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-3 px-4">Description</th>
                  <th className="text-right text-blue-200 py-3 px-4">Qty</th>
                  <th className="text-right text-blue-200 py-3 px-4">Rate</th>
                  <th className="text-right text-blue-200 py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="text-white py-4 px-4">Premium Subscription</td>
                  <td className="text-right text-white py-4 px-4">1</td>
                  <td className="text-right text-white py-4 px-4">₹10,999</td>
                  <td className="text-right text-white py-4 px-4">₹10,999</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-right">
            <div className="space-y-3 bg-white/5 rounded-2xl p-6">
              <div className="flex justify-between">
                <span className="text-blue-200">Subtotal:</span>
                <span className="text-white font-semibold">₹10,999</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">GST (18%):</span>
                <span className="text-white font-semibold">₹1,979.82</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t border-white/20 pt-3">
                <span className="text-white">Total:</span>
                <span className="text-white">₹12,978.82</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FAQ/Help Section */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mt-8">
        <div className="flex items-center space-x-4 mb-4 cursor-pointer" onClick={() => setShowFAQ(v => !v)}>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-2xl shadow-lg">
            <AlertCircle size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">FAQ & Help</h2>
          <span className="ml-auto text-yellow-300 font-bold">{showFAQ ? 'Hide' : 'Show'}</span>
        </div>
        {showFAQ && (
          <div className="mt-4 space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">How do I change my subscription plan?</h3>
              <p className="text-blue-200">Click the 'Upgrade Subscription' button above and follow the instructions in the dialog.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">How can I download or email my invoice?</h3>
              <p className="text-blue-200">Use the 'Download Latest Invoice' or 'Email Latest Invoice' buttons in the Invoice History section.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">How do I update my payment method?</h3>
              <p className="text-blue-200">Go to the Payment Methods section and click 'Add New Payment Method' or 'Edit' on an existing card.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Who do I contact for billing support?</h3>
              <p className="text-blue-200">Email support@tradesetu.com or raise a support ticket from your dashboard.</p>
            </div>
          </div>
                 )}
       </div>

       {/* Payment Gateway Integration */}
       <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-green-500/10">
         <div className="flex items-center space-x-4 mb-6">
           <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
             <CreditCard size={28} className="text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white">Payment Gateway</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/5 rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer" onClick={() => setShowPaymentGateway(true)}>
             <div className="flex items-center space-x-3 mb-4">
               <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                 <CreditCard size={24} className="text-white" />
               </div>
               <h3 className="text-white font-semibold">Stripe Payment</h3>
             </div>
             <p className="text-blue-200 text-sm">Secure credit/debit card payments</p>
           </div>
           <div className="bg-white/5 rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300 cursor-pointer" onClick={() => setShowPaymentGateway(true)}>
             <div className="flex items-center space-x-3 mb-4">
               <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-xl">
                 <QrCode size={24} className="text-white" />
               </div>
               <h3 className="text-white font-semibold">UPI Payment</h3>
             </div>
             <p className="text-blue-200 text-sm">Instant UPI transfers</p>
           </div>
           <div className="bg-white/5 rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 cursor-pointer" onClick={() => setShowPaymentGateway(true)}>
             <div className="flex items-center space-x-3 mb-4">
               <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl">
                 <Building2 size={24} className="text-white" />
               </div>
               <h3 className="text-white font-semibold">Net Banking</h3>
             </div>
             <p className="text-blue-200 text-sm">Direct bank transfers</p>
           </div>
         </div>
       </div>



       {/* Financial Analytics */}
       <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-orange-500/10">
         <div className="flex items-center space-x-4 mb-6">
           <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg">
             <BarChart3 size={28} className="text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white">Financial Analytics</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <TrendingUp size={20} className="text-green-400" />
               <h3 className="text-white font-semibold">Monthly Spending</h3>
             </div>
             <p className="text-2xl font-bold text-white">₹10,999</p>
             <p className="text-green-200 text-sm">+5% from last month</p>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <DollarSign size={20} className="text-blue-400" />
               <h3 className="text-white font-semibold">Yearly Total</h3>
             </div>
             <p className="text-2xl font-bold text-white">₹131,988</p>
             <p className="text-blue-200 text-sm">This year</p>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Target size={20} className="text-purple-400" />
               <h3 className="text-white font-semibold">ROI</h3>
             </div>
             <p className="text-2xl font-bold text-white">+245%</p>
             <p className="text-purple-200 text-sm">From trading features</p>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <AlertCircle size={20} className="text-yellow-400" />
               <h3 className="text-white font-semibold">Budget Alert</h3>
             </div>
             <p className="text-2xl font-bold text-white">80%</p>
             <p className="text-yellow-200 text-sm">Of monthly budget</p>
           </div>
         </div>
       </div>



       {/* Customer Support */}
       <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-yellow-500/10">
         <div className="flex items-center space-x-4 mb-6">
           <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-2xl shadow-lg">
             <Users size={28} className="text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white">Customer Support</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <MessageCircle size={20} className="text-blue-400" />
               <h3 className="text-white font-semibold">Live Chat</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Chat with support team</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all duration-300">
               Start Chat
             </button>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <FileText size={20} className="text-green-400" />
               <h3 className="text-white font-semibold">Knowledge Base</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Browse help articles</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
               Browse Articles
             </button>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Video size={20} className="text-purple-400" />
               <h3 className="text-white font-semibold">Video Tutorials</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Watch how-to videos</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300">
               Watch Videos
             </button>
           </div>
         </div>
       </div>

       {/* Advanced Security */}
       <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-indigo-500/10">
         <div className="flex items-center space-x-4 mb-6">
           <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
             <Shield size={28} className="text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white">Advanced Security</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Lock size={20} className="text-green-400" />
               <h3 className="text-white font-semibold">2FA Enabled</h3>
             </div>
             <p className="text-green-200 text-sm">Active</p>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Shield size={20} className="text-blue-400" />
               <h3 className="text-white font-semibold">Fraud Detection</h3>
             </div>
             <p className="text-blue-200 text-sm">Monitoring</p>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <AlertCircle size={20} className="text-yellow-400" />
               <h3 className="text-white font-semibold">Payment Alerts</h3>
             </div>
             <p className="text-yellow-200 text-sm">Enabled</p>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Activity size={20} className="text-red-400" />
               <h3 className="text-white font-semibold">Login History</h3>
             </div>
             <p className="text-red-200 text-sm">View Logs</p>
           </div>
         </div>
       </div>

       {/* Integrations */}
       <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-teal-500/10">
         <div className="flex items-center space-x-4 mb-6">
           <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3 rounded-2xl shadow-lg">
             <Link size={28} className="text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white">Integrations</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Building2 size={20} className="text-blue-400" />
               <h3 className="text-white font-semibold">Accounting Software</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Tally, QuickBooks</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all duration-300">
               Connect
             </button>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Building size={20} className="text-green-400" />
               <h3 className="text-white font-semibold">Bank Integration</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Auto reconciliation</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
               Connect Bank
             </button>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <TrendingUp size={20} className="text-purple-400" />
               <h3 className="text-white font-semibold">Trading Platform</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Zerodha, Upstox</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300">
               Connect Platform
             </button>
           </div>
         </div>
       </div>

       {/* Personalization */}
       <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-pink-500/10">
         <div className="flex items-center space-x-4 mb-6">
           <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-3 rounded-2xl shadow-lg">
             <Settings size={28} className="text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white">Personalization</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Palette size={20} className="text-pink-400" />
               <h3 className="text-white font-semibold">Custom Branding</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Customize invoice design</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 transition-all duration-300">
               Customize
             </button>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Bell size={20} className="text-blue-400" />
               <h3 className="text-white font-semibold">Billing Reminders</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Set custom reminders</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all duration-300">
               Set Reminders
             </button>
           </div>
           <div className="bg-white/5 rounded-2xl p-6">
             <div className="flex items-center space-x-3 mb-4">
               <Heart size={20} className="text-red-400" />
               <h3 className="text-white font-semibold">Favorites</h3>
             </div>
             <p className="text-blue-200 text-sm mb-4">Manage favorite payments</p>
             <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transition-all duration-300">
               Manage Favorites
             </button>
           </div>
         </div>
       </div>

       {/* Payment Gateway Modal */}
       {showPaymentGateway && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
           <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
             <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
               <CreditCard size={24} className="text-green-400" />
               <span>Choose Payment Method</span>
             </h2>
             <div className="space-y-4 mb-6">
               <button className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-3" onClick={() => handlePayment('Stripe')}>
                 <CreditCard size={20} />
                 <span>Credit/Debit Card</span>
               </button>
               <button className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-3" onClick={() => handlePayment('UPI')}>
                 <QrCode size={20} />
                 <span>UPI Payment</span>
               </button>
               <button className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-3" onClick={() => handlePayment('Net Banking')}>
                 <Building2 size={20} />
                 <span>Net Banking</span>
               </button>
             </div>
             <div className="flex justify-end space-x-4">
               <button className="px-4 py-2 rounded-lg bg-white/10 text-blue-200 hover:bg-white/20" onClick={() => setShowPaymentGateway(false)}>Cancel</button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default BillingPage;