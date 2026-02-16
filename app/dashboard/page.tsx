"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function HelloBeemaDashboard() {
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [expiryDateBS, setExpiryDateBS] = useState(""); 
  const [mfgYear, setMfgYear] = useState(""); // NEW: Manufacturing Year state
  const [buysInsurance, setBuysInsurance] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Brands based on Vehicle Type
  useEffect(() => {
    async function getBrands() {
      const { data } = await supabase
        .from("vehicle_models")
        .select("brand")
        .eq("category", vehicleType);
      if (data) {
        setBrands(Array.from(new Set(data.map((i: any) => i.brand))).sort());
      }
      setSelectedBrand("");
      setSelectedModel("");
    }
    getBrands();
  }, [vehicleType]);

  // 2. Fetch Models based on Brand
  useEffect(() => {
    if (selectedBrand) {
      async function getModels() {
        const { data } = await supabase
          .from("vehicle_models")
          .select("model_name")
          .eq("brand", selectedBrand)
          .eq("category", vehicleType);
        if (data) {
          setModels(data.sort((a: any, b: any) => a.model_name.localeCompare(b.model_name)));
        }
      }
      getModels();
    }
  }, [selectedBrand, vehicleType]);

  // 3. Calculation Handler
  const handleCalculate = async () => {
    if (!mfgYear || parseInt(mfgYear) < 1950) {
      alert("Please enter a valid Manufacturing Year.");
      return;
    }

    setLoading(true);
    setResult(null);

    const { data, error } = await supabase.rpc("calculate_hello_beema_final_v37", {
      p_brand: selectedBrand,
      p_model_name: selectedModel,
      p_expiry_date_bs: expiryDateBS,
      p_payment_date_bs: null, 
      p_manufacture_year_ad: parseInt(mfgYear), // FIXED: Passing user input
      p_buys_insurance: buysInsurance,
      p_is_commercial: vehicleType.includes("commercial") || vehicleType === "truck"
    });

    if (error) {
      alert(`SQL Error: ${error.message}`);
    } else if (data && data[0]) {
      setResult(data[0]);
    } else {
      alert("No data returned. Check your model and date.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-900">
      <div className="max-w-md mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-black text-blue-900 italic tracking-tighter">HELLO BEEMA</h1>
          <div className="h-1 w-20 bg-orange-500 mx-auto mt-1 rounded-full"></div>
        </header>

        <main className="bg-white rounded-[2.5rem] shadow-2xl p-6 border border-slate-100">
          <div className="space-y-6">
            {/* VEHICLE TYPE SELECTOR */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "motorcycle", label: "2W Petrol" },
                { id: "car", label: "4W Petrol" },
                { id: "electric_bike", label: "2W EV" },
                { id: "electric_car", label: "4W EV" },
                { id: "truck", label: "Heavy" },
                { id: "micro_bus", label: "Comm" }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setVehicleType(type.id)}
                  className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                    vehicleType === type.id 
                      ? "bg-blue-900 text-white border-blue-900 shadow-lg" 
                      : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* BRAND & MODEL */}
            <div className="space-y-3">
              <select 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none"
                value={selectedBrand}
              >
                <option value="">Choose Brand</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <select 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none disabled:opacity-50"
                disabled={!selectedBrand}
                value={selectedModel}
              >
                <option value="">Choose Model</option>
                {models.map(m => <option key={m.model_name} value={m.model_name}>{m.model_name}</option>)}
              </select>
            </div>

            {/* DATE & MANUFACTURING YEAR */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Expiry (BS)</label>
                <input 
                  type="text" 
                  placeholder="YYYY-MM-DD" 
                  className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-mono font-bold border-none"
                  value={expiryDateBS}
                  onChange={(e) => setExpiryDateBS(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mfg Year (AD)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2010" 
                  className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-mono font-bold border-none"
                  value={mfgYear}
                  onChange={(e) => setMfgYear(e.target.value)}
                />
              </div>
            </div>

            {/* INSURANCE TOGGLE */}
            <label className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl cursor-pointer">
              <span className="text-sm font-bold text-blue-900">Include Insurance</span>
              <input 
                type="checkbox" 
                checked={buysInsurance} 
                onChange={(e) => setBuysInsurance(e.target.checked)}
                className="w-6 h-6 accent-blue-600 rounded-lg"
              />
            </label>

            <button 
              onClick={handleCalculate}
              disabled={loading || !selectedModel || !expiryDateBS || !mfgYear}
              className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-800 disabled:opacity-20 transition-all"
            >
              {loading ? "Calculating..." : "See Final Bill"}
            </button>
          </div>

          {/* SEGREGATED RESULTS AREA */}
          {result && (
            <div className="mt-8 bg-blue-950 rounded-[2rem] p-6 text-white shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Payable</p>
                <h2 className="text-4xl font-black text-blue-50">Rs. {result.grand_total}</h2>
              </div>
              
              <div className="space-y-4 text-[11px] font-medium opacity-90">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Vehicle Tax Principal</span>
                  <span className="text-sm font-bold">Rs. {result.breakdown.tax_principal}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Late Fines & Arrears</span>
                  <span className="text-sm font-bold text-orange-400">
                    Rs. {Number(result.breakdown.renewal_charge) + 
                        Number(result.breakdown.current_fine) + 
                        Number(result.breakdown.arrears_32) - 300} 
                    {/* -300 here to separate the base renewal fee from fines */}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Renewal Fee (Official)</span>
                  <span className="text-sm font-bold">Rs. 300</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>3rd Party Insurance</span>
                  <span className="text-sm font-bold text-green-400">Rs. {result.breakdown.insurance_premium}</span>
                </div>

                <div className="flex justify-between items-center pt-2 text-blue-200">
                  <span className="font-bold uppercase tracking-widest text-[9px]">Hello Beema Fee</span>
                  <span className="text-sm font-black">Rs. {result.breakdown.service_charge}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
