'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VehicleTaxCalculator() {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [taxSlabs, setTaxSlabs] = useState<any[]>([]); // All data from DB
  const [types, setTypes] = useState<string[]>([]);    // Unique types: 2w, 4w, ev2w, etc.
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    vehicle_type: '',
    vehicle_category: '',
    expiry_date: '2081-03-25',
    mfg_year: 2015,
    buys_insurance: true
  });

  // 1. FETCH DYNAMIC CATEGORIES FROM DATABASE ON MOUNT
  useEffect(() => {
    async function fetchSlabs() {
      setFetchingData(true);
      const { data, error } = await supabase
        .from('tax_rates')
        .select('vehicle_type, vehicle_category')
        .order('vehicle_type', { ascending: true });

      if (error) {
        console.error("Error fetching tax slabs:", error.message);
      } else if (data) {
        setTaxSlabs(data);
        // Extract unique vehicle types for the first dropdown
        const uniqueTypes = Array.from(new Set(data.map(item => item.vehicle_type)));
        setTypes(uniqueTypes);
        
        // Auto-select the first type and its first category
        if (uniqueTypes.length > 0) {
          const firstType = uniqueTypes[0];
          const firstCategory = data.find(i => i.vehicle_type === firstType)?.vehicle_category;
          setFormData(prev => ({ 
            ...prev, 
            vehicle_type: firstType, 
            vehicle_category: firstCategory || '' 
          }));
        }
      }
      setFetchingData(false);
    }
    fetchSlabs();
  }, []);

  // 2. DERIVE CATEGORIES BASED ON SELECTED TYPE
  const filteredCategories = taxSlabs
    .filter(slab => slab.vehicle_type === formData.vehicle_type)
    .map(slab => slab.vehicle_category);

  // 3. CALCULATION HANDLER
  const calculateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Set current date for penalty logic
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
      alert("Calculation Error: " + error.message);
    } else {
      setResult(Array.isArray(data) ? data[0] : data);
    }
    setLoading(false);
  };

  if (fetchingData) return <div className="p-10 text-center">Loading system data...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Vehicle Tax Estimator</h2>
      
      <form onSubmit={calculateTax} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Vehicle Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <select 
              className="mt-1 block w-full border rounded-md p-2 bg-gray-50"
              value={formData.vehicle_type}
              onChange={(e) => {
                const newType = e.target.value;
                const firstCat = taxSlabs.find(i => i.vehicle_type === newType)?.vehicle_category;
                setFormData({...formData, vehicle_type: newType, vehicle_category: firstCat || ''});
              }}
            >
              {types.map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">CC / kW Category</label>
            <select 
              className="mt-1 block w-full border rounded-md p-2 bg-gray-50"
              value={formData.vehicle_category}
              onChange={(e) => setFormData({...formData, vehicle_category: e.target.value})}
            >
              {filteredCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date (BS)</label>
            <input 
              type="text" 
              placeholder="YYYY-MM-DD"
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Calculate Tax'}
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
            <p><strong>Fine Status:</strong> {result.breakdown?.current_penalty_pct}</p>
            <p><strong>Tax Principal:</strong> Rs. {result.breakdown?.tax_principal}</p>
            <p><strong>Renewal Unit:</strong> Rs. {result.breakdown?.renewal_unit}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-blue-600 font-medium italic">
              Status: {result.status_msg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
