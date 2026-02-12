"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function HelloBeemaCalculator() {
  // Selection States
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  
  // Input States
  const [expiryDate, setExpiryDate] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [manufactureYear, setManufactureYear] = useState(2022);
  const [buysInsurance, setBuysInsurance] = useState(true);
  const [isCommercial, setIsCommercial] = useState(false);
  
  // UI States
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Brands on Mount
  useEffect(() => {
    async function getBrands() {
      const { data } = await supabase.from("vehicle_models").select("brand");
      if (data) {
        const uniqueBrands = Array.from(new Set(data.map((item) => item.brand)));
        setBrands(uniqueBrands.sort());
      }
    }
    getBrands();
  }, []);

  // 2. Fetch Models when Brand changes
  useEffect(() => {
    if (selectedBrand) {
      async function getModels() {
        const { data } = await supabase
          .from("vehicle_models")
          .select("model_name")
          .eq("brand", selectedBrand);
        if (data) setModels(data.sort((a, b) => a.model_name.localeCompare(b.model_name)));
      }
      getModels();
    } else {
      setModels([]);
      setSelectedModel("");
    }
  }, [selectedBrand]);

  const handleCalculate = async () => {
    // FIXED: Correctly closed condition and added expiryDate check
    if (!selectedBrand || !selectedModel || !expiryDate) {
      alert("Please select Brand, Model, and Expiry Date.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("calculate_hello_beema_final_v37", {
      p_brand: selectedBrand,
      p_model_name: selectedModel,
      p_expiry_date_bs: expiryDate,
      p_payment_date_bs: paymentDate,
      p_manufacture_year_ad: manufactureYear,
      p_buys_insurance: buysInsurance,
      p_is_commercial: isCommercial
    });

    if (error) {
      console.error(error);
      alert("Calculation Error: " + error.message);
    } else {
      setResult(data[0]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-2xl my-10 border border-gray-100">
      <h1 className="text-3xl font-black text-blue-900 mb-2 italic tracking-tighter">HELLO BEEMA</h1>
      <p className="text-gray-500 mb-8 font-medium">Official Tax & Insurance Estimator</p>

      <div className="space-y-6">
        {/* Brand & Model Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Brand</label>
            <select 
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">-- Choose Brand --</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Model</label>
            <select 
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-colors disabled:bg-gray-50"
              disabled={!selectedBrand}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="">-- Choose Model --</option>
              {models.map(m => <option key={m.model_name} value={m.model_name}>{m.model_name}</option>)}
            </select>
          </div>
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Bluebook Expiry (BS)</label>
            <input 
              type="date" 
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Payment Date (BS)</label>
            <input 
              type="date" 
              className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded-xl">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={buysInsurance} onChange={e => setBuysInsurance(e.target.checked)} className="w-5 h-5 accent-blue-600" />
            <span className="text-sm font-bold text-gray-700">Include Insurance</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isCommercial} onChange={e => setIsCommercial(e.target.checked)} className="w-5 h-5 accent-orange-600" />
            <span className="text-sm font-bold text-gray-700">Commercial</span>
          </label>
        </div>

        <button 
          onClick={handleCalculate}
          disabled={loading}
          className="w-full py-4 bg-blue-900 text-white font-black rounded-xl hover:bg-blue-800 transition-all uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Calculate Total"}
        </button>

        {/* Result Section */}
        {result && (
          <div className="mt-8 border-2 border-blue-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-blue-900 p-4 text-white flex justify-between items-center">
              <span className="font-bold uppercase tracking-tight text-sm">{result.breakdown.vehicle}</span>
              <span className="text-2xl font-black">Rs. {result.grand_total}</span>
            </div>
            
            <div className="p-6 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between"><span>Annual Tax:</span><span className="font-bold text-gray-900">Rs. {result.breakdown.tax_principal}</span></div>
                <div className="flex justify-between"><span>Renewal & Fines:</span><span className="font-bold text-red-600">Rs. {result.breakdown.renewal_charge}</span></div>
                <div className="flex justify-between"><span>Arrears (32%):</span><span className="font-bold text-gray-900">Rs. {result.breakdown.arrears_32}</span></div>
                <hr className="border-dashed" />
                <div className="flex justify-between text-green-700 font-bold"><span>Insurance (TP):</span><span>Rs. {result.breakdown.insurance_tp}</span></div>
                <div className="flex justify-between text-orange-700 font-bold"><span>Service Fee:</span><span>Rs. {result.breakdown.service_fee}</span></div>
                {isCommercial && result.breakdown.ait_amount > 0 && (
                  <div className="flex justify-between text-purple-700 font-bold"><span>AIT (Income Tax):</span><span>Rs. {result.breakdown.ait_amount}</span></div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
