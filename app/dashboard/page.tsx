'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Ensure these are in your Vercel Environment Variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function VehicleTaxCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_type: '2w',
    vehicle_category: '126cc - 150cc',
    expiry_date: '',
    mfg_year: 2011,
    buys_insurance: true
  });

  const calculateTax = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.rpc('calculate_hello_beema_final_v34', {
      p_vehicle_type: formData.vehicle_type,
      p_vehicle_category: formData.vehicle_category,
      p_expiry_date_bs: formData.expiry_date,
      p_payment_date_bs: new Date().toISOString().split('T')[0], // Today's Date
      p_manufacture_year_ad: parseInt(formData.mfg_year),
      p_buys_insurance: formData.buys_insurance
    });

    if (error) {
      alert(error.message);
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Vehicle Tax Estimator</h2>
      
      <form onSubmit={calculateTax} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select 
              className="mt-1 block w-full border rounded-md p-2"
              onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
            >
              <option value="2w">2-Wheeler</option>
              <option value="4w">4-Wheeler</option>
              <option value="EV">Electric (EV)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input 
              type="text" 
              placeholder="e.g. 126cc - 150cc"
              className="mt-1 block w-full border rounded-md p-2"
              value={formData.vehicle_category}
              onChange={(e) => setFormData({...formData, vehicle_category: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date (BS)</label>
            <input 
              type="date" 
              className="mt-1 block w-full border rounded-md p-2"
              onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mfg Year (AD)</label>
            <input 
              type="number" 
              className="mt-1 block w-full border rounded-md p-2"
              value={formData.mfg_year}
              onChange={(e) => setFormData({...formData, mfg_year: e.target.value})}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? 'Calculating...' : 'Calculate Tax'}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-blue-800">Grand Total:</span>
            <span className="text-3xl font-bold text-blue-900">Rs. {result.grand_total}</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Years Due: {result.breakdown.years_total}</p>
            <p>• Late Fine: {result.breakdown.current_penalty_pct}</p>
            <p>• Arrears Fine (32%): Rs. {result.breakdown.arrears_fine_32}</p>
            <p>• Renewal Subtotal: Rs. {result.breakdown.renewal_subtotal}</p>
          </div>
        </div>
      )}
    </div>
  );
}
