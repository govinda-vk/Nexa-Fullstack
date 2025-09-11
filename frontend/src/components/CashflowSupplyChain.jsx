import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "flowbite-react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  Receipt,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck, 
  Package, 
  AlertTriangle,
  Zap,
  Upload,
  FileSpreadsheet,
  Download,
  BarChart3,
  Target,
  Shield,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const CashflowSupplyChain = ({ websiteUrl, onBack }) => {
  const [currentPhase, setCurrentPhase] = useState('import'); // 'import', 'dashboard'
  const [selectedFeature, setSelectedFeature] = useState('cashflow'); // 'cashflow', 'supply-chain'
  
  // Sample data for dashboards
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Office Supplies', category: 'Office', amount: 450, date: '2024-01-15' },
    { id: 2, name: 'Software License', category: 'Technology', amount: 299, date: '2024-01-12' },
    { id: 3, name: 'Marketing Campaign', category: 'Marketing', amount: 1200, date: '2024-01-10' },
    { id: 4, name: 'Utilities', category: 'Office', amount: 320, date: '2024-01-08' },
  ]);

  const [invoices, setInvoices] = useState([
    { id: 1, clientName: 'ABC Corporation', amount: 5500, dueDate: '2024-01-25', status: 'Paid' },
    { id: 2, clientName: 'XYZ Industries', amount: 3200, dueDate: '2024-01-30', status: 'Unpaid' },
    { id: 3, clientName: 'Tech Solutions Ltd', amount: 7800, dueDate: '2024-02-05', status: 'Unpaid' },
    { id: 4, clientName: 'Global Enterprises', amount: 4100, dueDate: '2024-02-10', status: 'Paid' },
  ]);

  const [supplies, setSupplies] = useState([
    { id: 1, supplierName: 'TechComponents Inc', product: 'Laptop Computers', quantity: 25, deliveryDate: '2024-01-20', status: 'On-Time' },
    { id: 2, supplierName: 'Office Supplies Co', product: 'Office Furniture', quantity: 15, deliveryDate: '2024-01-25', status: 'Pending' },
    { id: 3, supplierName: 'Global Materials', product: 'Raw Materials', quantity: 100, deliveryDate: '2024-01-15', status: 'Delayed' },
    { id: 4, supplierName: 'Express Logistics', product: 'Packaging Materials', quantity: 500, deliveryDate: '2024-01-30', status: 'On-Time' },
    { id: 5, supplierName: 'Industrial Parts Ltd', product: 'Machine Components', quantity: 50, deliveryDate: '2024-02-05', status: 'Pending' },
  ]);

  const { register: registerExpense, handleSubmit: handleExpenseSubmit, reset: resetExpense } = useForm();
  const { register: registerInvoice, handleSubmit: handleInvoiceSubmit, reset: resetInvoice } = useForm();
  const { register: registerSupply, handleSubmit: handleSupplySubmit, reset: resetSupply } = useForm();

  const handleDataImport = () => {
    // Simulate data processing
    setCurrentPhase('dashboard');
  };

  const renderImportInterface = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl font-bold mb-4">AI-Powered Business Intelligence</h1>
          <p className="text-xl text-white/80 mb-2">Transform your business data into actionable insights</p>
          <div className="flex items-center justify-center space-x-2 text-white/60">
            <span>🌐</span>
            <span>{websiteUrl}</span>
          </div>
        </div>

        {/* Feature Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div 
            onClick={() => setSelectedFeature('cashflow')}
            className={`cursor-pointer transform transition-all duration-300 hover:scale-105 ${
              selectedFeature === 'cashflow' ? 'ring-4 ring-blue-400' : ''
            }`}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full">
              <div className="text-center">
                <DollarSign size={48} className="mx-auto mb-4 text-green-400" />
                <h3 className="text-2xl font-bold text-white mb-4">Cashflow Management</h3>
                <p className="text-white/80 mb-6">
                  Track income, expenses, and financial health with AI-powered insights and automated reporting.
                </p>
                <div className="text-sm text-white/60 space-y-2">
                  <div>✓ Automated expense tracking</div>
                  <div>✓ Invoice management</div>
                  <div>✓ Financial health scoring</div>
                  <div>✓ Predictive cash flow</div>
                </div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedFeature('supply-chain')}
            className={`cursor-pointer transform transition-all duration-300 hover:scale-105 ${
              selectedFeature === 'supply-chain' ? 'ring-4 ring-blue-400' : ''
            }`}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full">
              <div className="text-center">
                <Truck size={48} className="mx-auto mb-4 text-orange-400" />
                <h3 className="text-2xl font-bold text-white mb-4">Supply Chain Optimization</h3>
                <p className="text-white/80 mb-6">
                  Monitor suppliers, track deliveries, and optimize your supply chain with intelligent automation.
                </p>
                <div className="text-sm text-white/60 space-y-2">
                  <div>✓ Supplier performance tracking</div>
                  <div>✓ Delivery optimization</div>
                  <div>✓ Risk assessment</div>
                  <div>✓ Cost analysis</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Import Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Import Your Data for Instant Analysis</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Upload size={32} className="text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Upload Data</h3>
              <p className="text-white/70 text-sm">Upload your CSV or Excel files with existing business data</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">2. AI Processing</h3>
              <p className="text-white/70 text-sm">Our AI analyzes patterns and generates insights automatically</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={32} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Get Insights</h3>
              <p className="text-white/70 text-sm">View interactive dashboards with actionable recommendations</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center mb-6">
            <FileSpreadsheet size={48} className="mx-auto mb-4 text-white/60" />
            <h3 className="text-xl font-semibold text-white mb-2">Drop your files here</h3>
            <p className="text-white/70 mb-4">Supports CSV, Excel, and other spreadsheet formats</p>
            <div className="flex justify-center space-x-4">
              <Button color="blue" size="lg">
                Choose Files
              </Button>
              <Button 
                color="green" 
                size="lg"
                onClick={handleDataImport}
              >
                Use Sample Data
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm mb-4">
              Don't have data ready? Download our template to get started quickly
            </p>
            <button className="border border-white/50 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center">
              <Download size={16} className="mr-2" />
              Download Template
            </button>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <Target size={32} className="mx-auto mb-3 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white mb-2">95% Accuracy</h3>
            <p className="text-white/70 text-sm">AI-powered analysis with industry-leading precision</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <Clock size={32} className="mx-auto mb-3 text-blue-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Save 20+ Hours</h3>
            <p className="text-white/70 text-sm">Automate manual data analysis and reporting tasks</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <Shield size={32} className="mx-auto mb-3 text-green-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Bank-Level Security</h3>
            <p className="text-white/70 text-sm">Your data is encrypted and never stored permanently</p>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Trusted by 500+ Companies Worldwide</h3>
          <p className="text-white/80 mb-6">
            Join leading businesses that have transformed their operations with our AI-powered platform
          </p>
          <div className="flex justify-center space-x-8 text-white/60">
            <div>🏢 Fortune 500 Companies</div>
            <div>🚀 Fast-growing Startups</div>
            <div>🏭 Manufacturing Leaders</div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button 
            onClick={onBack}
            outline={true}
            color="light"
          >
            ← Back to Options
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCashflowDashboard = () => {
    const totalIncome = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netCash = totalIncome - totalExpenses;
    const cashHealthScore = Math.max(0, Math.min(100, ((netCash / totalIncome) * 100) || 0));

    const chartData = [
      { month: 'Dec', income: 18500, expenses: 12200 },
      { month: 'Jan', income: totalIncome, expenses: totalExpenses },
      { month: 'Feb', income: 22000, expenses: 15800 },
      { month: 'Mar', income: 25600, expenses: 17200 },
    ];

    const onExpenseSubmit = (data) => {
      const newExpense = {
        id: expenses.length + 1,
        name: data.expenseName,
        category: data.category,
        amount: parseFloat(data.amount),
        date: data.date,
      };
      setExpenses([newExpense, ...expenses]);
      resetExpense();
    };

    const onInvoiceSubmit = (data) => {
      const newInvoice = {
        id: invoices.length + 1,
        clientName: data.clientName,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate,
        status: data.status,
      };
      setInvoices([newInvoice, ...invoices]);
      resetInvoice();
    };

    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Cash Flow Assistant</h2>
              <p className="text-gray-600 mt-1">Track expenses, manage invoices, and monitor your financial health</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>

          {/* Cash Flow Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
              <p className="text-xs text-gray-500 mt-2">From paid invoices</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
                </div>
                <TrendingDown className="text-red-500" size={24} />
              </div>
              <p className="text-xs text-gray-500 mt-2">This month</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${netCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netCash.toLocaleString()}
                  </p>
                </div>
                <DollarSign className={netCash >= 0 ? 'text-green-500' : 'text-red-500'} size={24} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Current balance</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(cashHealthScore)}%</p>
                </div>
                <AlertCircle className="text-blue-500" size={24} />
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${cashHealthScore >= 70 ? 'bg-green-500' : cashHealthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${cashHealthScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expense Tracking */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Expense Tracking</h3>
                <Receipt className="text-gray-400" size={20} />
              </div>
              
              <form onSubmit={handleExpenseSubmit(onExpenseSubmit)} className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    {...registerExpense('expenseName', { required: true })}
                    placeholder="Expense Name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    {...registerExpense('category', { required: true })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Category</option>
                    <option value="Office">Office</option>
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Travel">Travel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    {...registerExpense('amount', { required: true })}
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    {...registerExpense('date', { required: true })}
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  color="blue"
                  className="w-full flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add Expense
                </Button>
              </form>

              <div className="space-y-3">
                {expenses.slice(0, 4).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{expense.name}</p>
                      <p className="text-sm text-gray-500">{expense.category} • {expense.date}</p>
                    </div>
                    <span className="font-semibold text-red-600">${expense.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
                <Users className="text-gray-400" size={20} />
              </div>

              <form onSubmit={handleInvoiceSubmit(onInvoiceSubmit)} className="space-y-4 mb-6">
                <input
                  {...registerInvoice('clientName', { required: true })}
                  placeholder="Client Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    {...registerInvoice('amount', { required: true })}
                    type="number"
                    step="0.01"
                    placeholder="Invoice Amount"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    {...registerInvoice('dueDate', { required: true })}
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  {...registerInvoice('status', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
                <Button
                  type="submit"
                  color="green"
                  className="w-full flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add Invoice
                </Button>
              </form>

              <div className="space-y-3">
                {invoices.slice(0, 4).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.clientName}</p>
                      <p className="text-sm text-gray-500">Due: {invoice.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${invoice.amount.toLocaleString()}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status === 'Paid' ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => setCurrentPhase('import')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Data Import
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSupplyChainDashboard = () => {
    const statusCounts = supplies.reduce((acc, supply) => {
      acc[supply.status] = (acc[supply.status] || 0) + 1;
      return acc;
    }, {});

    const pieData = [
      { name: 'On-Time', value: statusCounts['On-Time'] || 0, color: '#10b981' },
      { name: 'Delayed', value: statusCounts['Delayed'] || 0, color: '#ef4444' },
      { name: 'Pending', value: statusCounts['Pending'] || 0, color: '#f59e0b' },
    ];

    const supplierData = supplies.reduce((acc, supply) => {
      const existing = acc.find(item => item.supplier === supply.supplierName);
      if (existing) {
        existing.orders += 1;
      } else {
        acc.push({ supplier: supply.supplierName, orders: 1 });
      }
      return acc;
    }, []);

    const getStatusIcon = (status) => {
      switch (status) {
        case 'On-Time':
          return <CheckCircle size={16} className="text-green-600" />;
        case 'Delayed':
          return <AlertTriangle size={16} className="text-red-600" />;
        case 'Pending':
          return <Clock size={16} className="text-yellow-600" />;
        default:
          return <Clock size={16} className="text-gray-600" />;
      }
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'On-Time':
          return 'bg-green-100 text-green-800';
        case 'Delayed':
          return 'bg-red-100 text-red-800';
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const onTimePercentage = ((statusCounts['On-Time'] || 0) / supplies.length) * 100;

    const onSupplySubmit = (data) => {
      const newSupply = {
        id: supplies.length + 1,
        supplierName: data.supplierName,
        product: data.product,
        quantity: parseInt(data.quantity),
        deliveryDate: data.deliveryDate,
        status: data.status,
      };
      setSupplies([newSupply, ...supplies]);
      resetSupply();
    };

    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Supply Chain Automation</h2>
              <p className="text-gray-600 mt-1">Monitor suppliers, track deliveries, and optimize your supply chain</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Truck size={24} className="text-orange-600" />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{supplies.length}</p>
                </div>
                <Package className="text-blue-500" size={24} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Active supply orders</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                  <p className="text-2xl font-bold text-green-600">{Math.round(onTimePercentage)}%</p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Delivery performance</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delayed Orders</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts['Delayed'] || 0}</p>
                </div>
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Need attention</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-purple-600">{supplierData.length}</p>
                </div>
                <Truck className="text-purple-500" size={24} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Partner network</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm text-gray-600">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Supplier</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={supplierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="supplier" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Supply Record Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add Supply Order</h3>
                  <Plus className="text-gray-400" size={20} />
                </div>

                <form onSubmit={handleSupplySubmit(onSupplySubmit)} className="space-y-4">
                  <input
                    {...registerSupply('supplierName', { required: true })}
                    placeholder="Supplier Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    {...registerSupply('product', { required: true })}
                    placeholder="Product"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    {...registerSupply('quantity', { required: true })}
                    type="number"
                    placeholder="Quantity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    {...registerSupply('deliveryDate', { required: true })}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <select
                    {...registerSupply('status', { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Status</option>
                    <option value="On-Time">On-Time</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <Button
                    type="submit"
                    color="warning"
                    className="w-full flex items-center justify-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Supply Order
                  </Button>
                </form>
              </div>

              {/* AI Optimization Tip */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-sm mt-6 text-white">
                <div className="flex items-center mb-3">
                  <Zap size={20} className="mr-2" />
                  <h3 className="font-semibold">AI Optimization Tip</h3>
                </div>
                <p className="text-sm text-blue-100">
                  Based on your data, consider diversifying suppliers for critical components. 
                  Your current dependency on single suppliers for key items poses a delivery risk.
                </p>
              </div>
            </div>

            {/* Supply Records Table */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Supply Chain Records</h3>
                  <Calendar className="text-gray-400" size={20} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Supplier</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Qty</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Delivery</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplies.map((supply) => (
                        <tr key={supply.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{supply.supplierName}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{supply.product}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{supply.quantity}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-600">{supply.deliveryDate}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(supply.status)}`}>
                              {getStatusIcon(supply.status)}
                              <span className="ml-1">{supply.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => setCurrentPhase('import')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Data Import
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (currentPhase === 'import') {
    return renderImportInterface();
  }

  if (currentPhase === 'dashboard') {
    return selectedFeature === 'cashflow' ? renderCashflowDashboard() : renderSupplyChainDashboard();
  }

  return null;
};

export default CashflowSupplyChain;