'use client';

import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface Expense {
  id: number;
  vendor: string;
  amount: number;
  cycle: string;
  category: string;
  description: string;
}

interface Revenue {
  id: number;
  source: string;
  amount: number;
  cycle: string;
  category: string;
  description: string;
}

interface ExpenseForm {
  vendor: string;
  amount: string | number;
  cycle: string;
  category: string;
  description: string;
}

interface RevenueForm {
  source: string;
  amount: string | number;
  cycle: string;
  category: string;
  description: string;
}

export default function ExpenseTracker() {
  const initialExpenses = [
    { id: 1, vendor: 'Claude (Claude Max)', amount: 100.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'AI tool for writing and code' },
    { id: 2, vendor: 'OpenAI (ChatGPT Plus)', amount: 20.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'ChatGPT Plus plan' },
    { id: 3, vendor: 'Synthesia Creator', amount: 94.56, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'AI video generation tool' },
    { id: 4, vendor: 'Google Workspace', amount: 108.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: '7 accounts' },
    { id: 5, vendor: 'HiHello', amount: 8.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'Digital business card app (cancel soon)' },
    { id: 6, vendor: 'CodeGuide.dev', amount: 249.00, cycle: 'Annual', category: 'Software / Subscriptions', description: 'Annual dev guide plan (unused / sunk cost)' },
    { id: 7, vendor: 'Every.to', amount: 200.00, cycle: 'Annual', category: 'Software / Subscriptions', description: 'AI/business newsletter subscription' },
    { id: 8, vendor: 'Manus AI', amount: 39.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'AI writing & productivity tool' },
    { id: 9, vendor: 'Vapi', amount: 10.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'AI voice agent platform' },
    { id: 10, vendor: 'ElevenLabs', amount: 5.31, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'AI voice generation API' },
    { id: 11, vendor: 'Canva Pro', amount: 15.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'Design and content creation tool' },
    { id: 12, vendor: 'n8n Cloud', amount: 63.75, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'Automation platform (upgraded tier)' },
    { id: 13, vendor: 'Supabase', amount: 80.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'Database and backend hosting' },
    { id: 14, vendor: 'Figma', amount: 15.00, cycle: 'Monthly', category: 'Software / Subscriptions', description: 'Design collaboration platform' },
    { id: 15, vendor: 'Supabase Select Tickets', amount: 512.00, cycle: 'One-time', category: 'Events / Conferences', description: 'Event tickets' },
    { id: 16, vendor: 'Google Ads', amount: 155.00, cycle: 'One-time', category: 'Marketing / Advertising', description: 'Ad spend' }
  ];

  const initialRevenue = [
    { id: 1, source: 'MVP Residential Services', amount: 250.00, cycle: 'Monthly', category: 'Google Ads', description: 'Ad Campaign Management' },
    { id: 2, source: 'O\'Connell & Co. Realty', amount: 250.00, cycle: 'Monthly', category: 'Google Ads', description: 'Ad Campaign Management' },
    { id: 3, source: 'Trash King, LLC.', amount: 325.00, cycle: 'Monthly', category: 'Google Ads', description: 'Ad Campaign Management' },
    { id: 4, source: 'RJL Electric', amount: 650.00, cycle: 'Annual', category: 'Website Hosting', description: 'Website Management & Hosting' },
    { id: 5, source: 'RJL Electric', amount: 2200.00, cycle: 'One-time', category: 'Website Development', description: 'Website build' },
    { id: 6, source: 'Scott PHS', amount: 1500.00, cycle: 'One-time', category: 'Website Development', description: 'Website build' }
  ];

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('elev8-expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [revenue, setRevenue] = useState(() => {
    const saved = localStorage.getItem('elev8-revenue');
    return saved ? JSON.parse(saved) : initialRevenue;
  });

  useEffect(() => {
    localStorage.setItem('elev8-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('elev8-revenue', JSON.stringify(revenue));
  }, [revenue]);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editingRevenueId, setEditingRevenueId] = useState<number | null>(null);

  const [newExpense, setNewExpense] = useState<ExpenseForm>({
    vendor: '',
    amount: '',
    cycle: 'Monthly',
    category: 'Software / Subscriptions',
    description: ''
  });

  const [newRevenue, setNewRevenue] = useState<RevenueForm>({
    source: '',
    amount: '',
    cycle: 'Monthly',
    category: 'Services',
    description: ''
  });

  const [editExpense, setEditExpense] = useState<ExpenseForm>({
    vendor: '',
    amount: '',
    cycle: '',
    category: '',
    description: ''
  });

  const [editRevenue, setEditRevenue] = useState<RevenueForm>({
    source: '',
    amount: '',
    cycle: '',
    category: '',
    description: ''
  });

  const monthlyExpenses = expenses
    .filter((e: Expense) => e.cycle === 'Monthly')
    .reduce((sum: number, e: Expense) => sum + e.amount, 0);

  const annualExpenses = expenses
    .filter((e: Expense) => e.cycle === 'Annual')
    .reduce((sum: number, e: Expense) => sum + e.amount, 0);

  const oneTimeExpenses = expenses
    .filter((e: Expense) => e.cycle === 'One-time')
    .reduce((sum: number, e: Expense) => sum + e.amount, 0);

  const totalMonthlyBurn = monthlyExpenses + (annualExpenses / 12);

  const monthlyRevenue = revenue
    .filter((r: Revenue) => r.cycle === 'Monthly')
    .reduce((sum: number, r: Revenue) => sum + r.amount, 0);

  const annualRevenue = revenue
    .filter((r: Revenue) => r.cycle === 'Annual')
    .reduce((sum: number, r: Revenue) => sum + r.amount, 0);

  const oneTimeRevenue = revenue
    .filter((r: Revenue) => r.cycle === 'One-time')
    .reduce((sum: number, r: Revenue) => sum + r.amount, 0);

  const totalMonthlyRevenue = monthlyRevenue + (annualRevenue / 12);

  const netIncome = totalMonthlyRevenue - totalMonthlyBurn;

  const addExpense = () => {
    if (newExpense.vendor && newExpense.amount) {
      const maxId = expenses.length > 0 ? Math.max(...expenses.map((e: Expense) => e.id)) : 0;
      setExpenses([...expenses, {
        id: maxId + 1,
        vendor: newExpense.vendor,
        amount: typeof newExpense.amount === 'string' ? parseFloat(newExpense.amount) : newExpense.amount,
        cycle: newExpense.cycle,
        category: newExpense.category,
        description: newExpense.description
      }]);
      setNewExpense({
        vendor: '',
        amount: '',
        cycle: 'Monthly',
        category: 'Software / Subscriptions',
        description: ''
      });
      setShowExpenseForm(false);
    }
  };

  const addRevenue = () => {
    if (newRevenue.source && newRevenue.amount) {
      const maxId = revenue.length > 0 ? Math.max(...revenue.map((r: Revenue) => r.id)) : 0;
      setRevenue([...revenue, {
        id: maxId + 1,
        source: newRevenue.source,
        amount: typeof newRevenue.amount === 'string' ? parseFloat(newRevenue.amount) : newRevenue.amount,
        cycle: newRevenue.cycle,
        category: newRevenue.category,
        description: newRevenue.description
      }]);
      setNewRevenue({
        source: '',
        amount: '',
        cycle: 'Monthly',
        category: 'Services',
        description: ''
      });
      setShowRevenueForm(false);
    }
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter((e: Expense) => e.id !== id));
  };

  const deleteRevenue = (id: number) => {
    setRevenue(revenue.filter((r: Revenue) => r.id !== id));
  };

  const startEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditExpense({
      vendor: expense.vendor,
      amount: expense.amount.toString(),
      cycle: expense.cycle,
      category: expense.category,
      description: expense.description
    });
  };

  const startEditRevenue = (rev: Revenue) => {
    setEditingRevenueId(rev.id);
    setEditRevenue({
      source: rev.source,
      amount: rev.amount.toString(),
      cycle: rev.cycle,
      category: rev.category,
      description: rev.description
    });
  };

  const saveExpenseEdit = () => {
    setExpenses(expenses.map((e: Expense) =>
      e.id === editingExpenseId
        ? { ...e, ...editExpense, amount: typeof editExpense.amount === 'string' ? parseFloat(editExpense.amount) : editExpense.amount }
        : e
    ));
    setEditingExpenseId(null);
  };

  const saveRevenueEdit = () => {
    setRevenue(revenue.map((r: Revenue) =>
      r.id === editingRevenueId
        ? { ...r, ...editRevenue, amount: typeof editRevenue.amount === 'string' ? parseFloat(editRevenue.amount) : editRevenue.amount }
        : r
    ));
    setEditingRevenueId(null);
  };

  const cancelExpenseEdit = () => {
    setEditingExpenseId(null);
  };

  const cancelRevenueEdit = () => {
    setEditingRevenueId(null);
  };

  const resetToDefaults = () => {
    if (confirm('This will reset all data to the default values. Any custom entries will be lost. Continue?')) {
      localStorage.removeItem('elev8-expenses');
      localStorage.removeItem('elev8-revenue');
      setExpenses(initialExpenses);
      setRevenue(initialRevenue);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Elev8 Growth Solutions</h1>
            <p className="text-gray-600">Expense Tracker</p>
          </div>
          <button
            onClick={resetToDefaults}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalMonthlyRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">One-time: ${oneTimeRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">${totalMonthlyBurn.toFixed(2)}</p>
              <p className="text-xs text-gray-500">(annuals prorated)</p>
            </div>
            <TrendingDown className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netIncome.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">monthly</p>
            </div>
            <Activity className={netIncome >= 0 ? 'text-green-500' : 'text-red-500'} size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Other Expenses</p>
              <p className="text-sm text-gray-800">Annual: ${annualExpenses.toFixed(2)}</p>
              <p className="text-sm text-gray-800">One-time: ${oneTimeExpenses.toFixed(2)}</p>
            </div>
            <DollarSign className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Monthly Recurring</span>
              <span className="text-lg font-semibold text-green-600">${monthlyRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Annual (Prorated Monthly)</span>
              <span className="text-lg font-semibold text-green-600">${(annualRevenue / 12).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-sm text-gray-500 italic">Annual Total: ${annualRevenue.toFixed(2)}</span>
              <span className="text-xs text-gray-400">÷ 12 months</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-semibold text-gray-800">Total Monthly Revenue</span>
              <span className="text-xl font-bold text-green-600">${totalMonthlyRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-300">
              <span className="text-sm text-gray-600">One-time Revenue</span>
              <span className="text-base font-semibold text-green-500">${oneTimeRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Monthly Recurring</span>
              <span className="text-lg font-semibold text-red-600">${monthlyExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Annual (Prorated Monthly)</span>
              <span className="text-lg font-semibold text-red-600">${(annualExpenses / 12).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-sm text-gray-500 italic">Annual Total: ${annualExpenses.toFixed(2)}</span>
              <span className="text-xs text-gray-400">÷ 12 months</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-semibold text-gray-800">Total Monthly Expenses</span>
              <span className="text-xl font-bold text-red-600">${totalMonthlyBurn.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-300">
              <span className="text-sm text-gray-600">One-time Expenses</span>
              <span className="text-base font-semibold text-red-500">${oneTimeExpenses.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Revenue Streams</h2>
          <button
            onClick={() => setShowRevenueForm(!showRevenueForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Add Revenue
          </button>
        </div>

        {showRevenueForm && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Revenue Source"
                value={newRevenue.source}
                onChange={(e) => setNewRevenue({ ...newRevenue, source: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newRevenue.amount}
                onChange={(e) => setNewRevenue({ ...newRevenue, amount: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <select
                value={newRevenue.cycle}
                onChange={(e) => setNewRevenue({ ...newRevenue, cycle: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option>Monthly</option>
                <option>Annual</option>
                <option>One-time</option>
              </select>
              <input
                type="text"
                placeholder="Category"
                value={newRevenue.category}
                onChange={(e) => setNewRevenue({ ...newRevenue, category: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Description"
                value={newRevenue.description}
                onChange={(e) => setNewRevenue({ ...newRevenue, description: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 md:col-span-2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addRevenue}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowRevenueForm(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No revenue streams added yet. Click "Add Revenue" to get started.
                  </td>
                </tr>
              ) : (
                revenue.map((rev: Revenue) => (
                  <tr key={rev.id} className="hover:bg-gray-50">
                    {editingRevenueId === rev.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editRevenue.source}
                            onChange={(e) => setEditRevenue({ ...editRevenue, source: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editRevenue.amount}
                            onChange={(e) => setEditRevenue({ ...editRevenue, amount: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editRevenue.cycle}
                            onChange={(e) => setEditRevenue({ ...editRevenue, cycle: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                          >
                            <option>Monthly</option>
                            <option>Annual</option>
                            <option>One-time</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editRevenue.category}
                            onChange={(e) => setEditRevenue({ ...editRevenue, category: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editRevenue.description}
                            onChange={(e) => setEditRevenue({ ...editRevenue, description: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={saveRevenueEdit}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelRevenueEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rev.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">${rev.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            rev.cycle === 'Monthly' ? 'bg-green-100 text-green-800' :
                            rev.cycle === 'Annual' ? 'bg-teal-100 text-teal-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rev.cycle}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rev.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{rev.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => startEditRevenue(rev)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteRevenue(rev.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Expenses</h2>
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>

        {showExpenseForm && (
          <div className="p-6 bg-blue-50 border-b border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Vendor"
                value={newExpense.vendor}
                onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <select
                value={newExpense.cycle}
                onChange={(e) => setNewExpense({ ...newExpense, cycle: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option>Monthly</option>
                <option>Annual</option>
                <option>One-time</option>
              </select>
              <input
                type="text"
                placeholder="Category"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 md:col-span-2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addExpense}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowExpenseForm(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense: Expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  {editingExpenseId === expense.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editExpense.vendor}
                          onChange={(e) => setEditExpense({ ...editExpense, vendor: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={editExpense.amount}
                          onChange={(e) => setEditExpense({ ...editExpense, amount: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={editExpense.cycle}
                          onChange={(e) => setEditExpense({ ...editExpense, cycle: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        >
                          <option>Monthly</option>
                          <option>Annual</option>
                          <option>One-time</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editExpense.category}
                          onChange={(e) => setEditExpense({ ...editExpense, category: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editExpense.description}
                          onChange={(e) => setEditExpense({ ...editExpense, description: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={saveExpenseEdit}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelExpenseEdit}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.vendor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${expense.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          expense.cycle === 'Monthly' ? 'bg-blue-100 text-blue-800' :
                          expense.cycle === 'Annual' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {expense.cycle}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{expense.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => startEditExpense(expense)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
