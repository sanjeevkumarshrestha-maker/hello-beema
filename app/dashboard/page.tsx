"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function HelloBeemaDashboard() {
  const [calcMode, setCalcMode] = useState("model"); // 'model' or 'cc'
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [inputCC, setInputCC] = useState("");
  const [expiryDateBS, setExpiryDateBS] = useState(""); 
  const [mfgYear, setMfgYear] = useState("");
  const [buysInsurance, setBuysInsurance] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Brands based on Type
  useEffect(() => {
    async function getBrands() {
      const { data } = await supabase.from("vehicle_models").select("brand").eq("category", vehicleType);
      if (data) setBrands(Array.from(new Set(data.map((i: any) => i.brand))).sort());
      setSelectedBrand(""); setSelectedModel("");
    }
    getBrands();
  }, [vehicleType]);

  // Fetch Models based on Brand
  useEffect(() => {
    if (selectedBrand) {
      async function getModels() {
        const { data } = await supabase.from("vehicle_models").select("model_name").eq("brand", selectedBrand).eq("category", vehicleType);
        if (data) setModels(data.sort((a: any, b: any) => a.model_name.localeCompare(b.model_name)));
      }
      getModels();
    }
  }, [selectedBrand]);

  const handleCalculate = async () => {
    if (!mfgYear || !expiryDateBS) {
      alert("Please fill in Manufacturing Year and Expiry Date.");
      return;
    }
    setLoading(true);
    setResult(null);

    const { data, error } = await supabase.rpc("calculate_hello_beema_final_v37", {
      p_brand: calcMode === "model" ? selectedBrand : "Custom",
      p_model_name: calcMode === "model" ? selectedModel : inputCC,
      p_expiry_date_bs: expiryDateBS,
      p_payment_date_bs: null, 
      p_manufacture_year_ad: parseInt(mfgYear),
      p_buys_insurance: buysInsurance,
      p_is_commercial: vehicleType.includes("commercial")
    });

    if (error) alert(`Error: ${error.message}`);
    else if (data && data[0]) setResult(data[0]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-md mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-black text-blue-900 italic tracking-tighter">HELLO BEEMA</h1>
          <div className="h-1 w-16 bg-orange-500 mx-auto mt-1 rounded-full"></div>
        </header>

        <main className="bg-white rounded-[2rem] shadow-xl p-6 border border-slate-100">
          <div className="space-y-5">
            
            {/* 1. CALCULATION MODE TOGGLE */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setCalcMode("model")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${calcMode === "model" ? "bg-white shadow text-blue-900" : "text-slate-400"}`}
              >By Model</button>
              <button 
                onClick={() => setCalcMode("cc")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${calcMode === "cc" ? "bg-white shadow text-blue-900" : "text-slate-400"}`}
              >By CC</button>
            </div>

            {/* 2. VEHICLE TYPE */}
            <div className="grid grid-cols-3 gap-2">
              {[{ id: "motorcycle", label: "2W Petrol" }, { id: "car", label: "4W Petrol" }, { id: "electric_bike", label: "2W EV" }].map((type) => (
                <button key={type.id} onClick={() => setVehicleType(type.id)} className={`py-3 rounded-xl text-[10px] font-black border-2 transition-all ${vehicleType === type.id ? "bg-blue-900 text-white border-blue-900" : "bg-slate-50 text-slate-400 border-transparent"}`}>
                  {type.label}
                </button>
              ))}
            </div>

            {/* 3. DYNAMIC INPUTS (MODEL OR CC) */}
            <div className="space-y-3">
              {calcMode === "model" ? (
                <>
                  <select onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" value={selectedBrand}>
                    <option value="">Brand</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" disabled={!selectedBrand} value={selectedModel}>
                    <option value="">Model</option>
                    {models.map(m => <option key={m.model_name} value={m.model_name}>{m.model_name}</option>)}
                  </select>
                </>
              ) : (
                <input type="number" placeholder="Enter Engine CC (e.g. 150)" className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" value={inputCC} onChange={(e) => setInputCC(e.target.value)} />
              )}
            </div>

            {/* 4. DATES & MFG YEAR */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Expiry (BS)</label>
                <input type="text" placeholder="YYYY-MM-DD" className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" value={expiryDateBS} onChange={(e) => setExpiryDateBS(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Mfg Year (AD)</label>
                <input type="number" placeholder="e.g. 2012" className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" value={mfgYear} onChange={(e) => setMfgYear(e.target.value)} />
              </div>
            </div>

            <button onClick={handleCalculate} disabled={loading} className="w-full py-4 bg-blue-900 text-white rounded-xl font-black text-lg shadow-lg hover:bg-blue-800 transition-all">
              {loading ? "Calculating..." : "Generate Bill"}
            </button>
          </div>

          {/* 5. SEGREGATED RESULTS */}
          {result && (
            <div className="mt-8 bg-slate-900 rounded-[1.5rem] p-6 text-white animate-in fade-in slide-in-from-bottom-2">
              <div className="text-center mb-6">
                <p className="text-blue-400 text-[10px] font-black uppercase mb-1 tracking-widest">Grand Total</p>
                <h2 className="text-4xl font-black">Rs. {result.grand_total}</h2>
              </div>
              
              <div className="space-y-4 text-[11px] border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span className="opacity-70">Vehicle Tax Principal</span>
                  <span className="font-bold">Rs. {result.breakdown.tax_principal}</span>
                </div>
                
                <div className="flex justify-between text-orange-400">
                  <span className="font-bold">Total Fines & Arrears</span>
                  <span className="font-bold">Rs. {Number(result.breakdown.current_fine) + Number(result.breakdown.arrears_32)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="opacity-70">Renewal Fee (Inc. 100% Fine)</span>
                  <span className="font-bold">Rs. {result.breakdown.renewal_charge}</span>
                </div>

                <div className="flex justify-between text-green-400">
                  <span className="font-bold">Insurance Premium</span>
                  <span className="font-bold">Rs. {result.breakdown.insurance_premium}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-white/10 text-blue-200">
                  <span className="font-black uppercase tracking-tighter">Hello Beema Service Fee</span>
                  <span className="font-black">Rs. {result.breakdown.service_charge}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
