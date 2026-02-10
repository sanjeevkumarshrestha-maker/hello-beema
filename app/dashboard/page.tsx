'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VehicleTaxCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    vehicle_type: '2w',
    vehicle_category: '126cc - 150cc',
    expiry_date: '2080-03-25',
    mfg_year: 2011,
    buys_insurance: true
  });

  // Common Categories for the Dropdown
  const categories = {
    '2w': ['Up to 125cc', '126cc - 150cc', '151cc - 250cc', '251cc - 400cc', '401cc - 650cc', 'Above 650cc'],
    '4w': ['Up to 1000cc', '1001cc - 1500cc', '1501cc - 2000cc', '2001cc - 2500cc', '2501cc - 2900cc', 'Above 2900cc'],
    'EV': ['Up to 10kW', '11kW - 50kW', '51kW - 100kW', '101kW - 200kW', 'Above 200kW']
  };

  const calculateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // FIX: Send a Nepali BS year (2082) so the SQL subtraction works (2082 - 2080 = 2 years)
    const currentNepaliDate = "2082-10-28"; 

    const { data, error } = await supabase.rpc('calculate_hello_beema_final_v34', {
      p_vehicle_type: formData.vehicle_type,
      p_vehicle_category: formData.vehicle_category,
      p_expiry_date_bs: formData.expiry_date, 
      p_payment_date_bs: currentNepaliDate,   
      p_manufacture_year_ad: Number(formData.mfg_year) as any,
      p_buys_insurance: formData.buys_insurance
    });

    if (error) {
      alert(error.message);
    } else {
      // Fix for Table return: access data[0] if it's an array
      setResult(Array.isArray(data) ? data[0] : data);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Vehicle Tax Estimator</h2>
      
      <form onSubmit={calculateTax} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <select 
              className="mt-1 block w-full border rounded-md p-2"
              value={formData.vehicle_type}
              onChange={(e) => setFormData({...formData, vehicle_type: e.target.value, vehicle_category: categories[e.target.value as keyof typeof categories][0]})}
            >
              <option value="2w">2-Wheeler</option>
              <option value="4w">4-Wheeler</option>
              <option value="EV">Electric (EV)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CC / kW Category</label>
            <select 
              className="mt-1 block w-full border rounded-md p-2"
              value={formData.vehicle_category}
              onChange={(e) => setFormData({...formData, vehicle_category: e.target.value})}
            >
              {categories[formData.vehicle_type as keyof typeof categories].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date (BS) - YYYY-MM-DD</label>
            <input 
              type="text" 
              placeholder="2080-03-25"
              className="mt-1 block w-full border rounded-md p-2"
              value={formData.expiry_date}
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
              onChange={(e) => setFormData({...formData, mfg_year: parseInt(e.target.value)})}
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
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-blue-800">Grand Total:</span>
            <span className="text-4xl font-black text-blue-900">Rs. {result.grand_total}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <p><strong>Years Due:</strong> {result.breakdown?.years_total}</p>
            <p><strong>Current Fine:</strong> {result.breakdown?.current_penalty_pct}</p>
            <p><strong>Arrears Fine (32%):</strong> Rs. {result.breakdown?.arrears_fine_32}</p>
            <p><strong>Renewal Subtotal:</strong> Rs. {result.breakdown?.renewal_subtotal}</p>
          </div>
        </div>
      )}
    </div>
  );
}
