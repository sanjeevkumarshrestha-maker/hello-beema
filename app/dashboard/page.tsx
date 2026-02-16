"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function HelloBeemaDashboard() {
  const [calcMode, setCalcMode] = useState("model"); // "model" or "cc"
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

  // Fetch Brands/Models for "Model" Mode
  useEffect(() => {
    async function getBrands() {
      const { data } = await supabase.from("vehicle_models").select("brand").eq("category", vehicleType);
      if (data) setBrands(Array.from(new Set(data.map((i: any) => i.brand))).sort());
      setSelectedBrand(""); setSelectedModel("");
    }
    getBrands();
  }, [vehicleType]);

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
    setLoading(true); setResult(null);

    // Handshake: If mode is CC, we send 'Custom' as brand and the CC as the model string
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-900">
      <div className="max-w-md mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-black text-blue-900 italic tracking-tighter">HELLO BEEMA</h1>
          <div className="h-1 w-20 bg-orange-500 mx-auto mt-1 rounded-full"></div>
        </header>

        <main className="bg-white rounded-[2.5rem] shadow-2xl p-6 border border-slate-100">
          <div className="space-y-6">
            
            {/* 1. CALCULATION MODE TOGGLE */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setCalcMode("model")}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${calcMode === "model" ? "bg-white shadow-sm text-blue-900" : "text-slate-400"}`}
              >By Model</button>
              <button 
                onClick={() => setCalcMode("cc")}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${calcMode === "cc" ? "bg-white shadow-sm text-blue-900" : "text-slate-400"}`}
              >By CC</button>
            </div>

            {/* 2. VEHICLE TYPE (Always Needed) */}
            <div className="grid grid-cols-3 gap-2">
              {[{ id: "motorcycle", label: "2W Petrol" }, { id: "car", label: "4W Petrol" }, { id: "electric_bike", label: "2W EV" }].map((type) => (
                <button key={type.id} onClick={() => setVehicleType(type.id)} className={`py-3 px-1 rounded-2xl text-[10px] font-black border-2 ${vehicleType === type.id ? "bg-blue-900 text-white" : "bg-slate-50 text-slate-400 border-transparent"}`}>
                  {type.label}
                </button>
              ))}
            </div>

            {/* 3. DYNAMIC INPUTS BASED ON MODE */}
            <div className="space-y-3">
              {calcMode === "model" ? (
                <>
                  <select onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none" value={selectedBrand}>
                    <option value="">Choose Brand</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none" disabled={!selectedBrand} value={selectedModel}>
                    <option value="">Choose Model</option>
                    {models.map(m => <option key={m.model_name} value={m.model_name}>{m.model_name}</option>)}
                  </select>
                </>
              ) : (
                <input type="number" placeholder="Enter Engine CC (e.g. 150)" className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none" value={inputCC} onChange={(e) => setInputCC(e.target.value)} />
              )}
            </div>

            {/* 4. DATES & MFG YEAR */}
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Expiry BS (YYYY-MM-DD)" className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none" value={expiryDateBS} onChange={(e) => setExpiryDateBS(e.target.value)} />
              <input type="number" placeholder="Mfg Year (AD)" className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none" value={mfgYear} onChange={(e) => setMfgYear(e.target.value)} />
            </div>

            <button onClick={handleCalculate} disabled={loading} className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-800 transition-all">
              {loading ? "Calculating..." : "See Final Bill"}
            </button>
          </div>

          {/* 5. RESULTS BREAKDOWN */}
          {result && (
            <div className="mt-8 bg-blue-950 rounded-[2rem] p-6 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <p className="text-blue-400 text-[10px] font-black uppercase mb-1">Total Payable</p>
                <h2 className="text-4xl font-black">Rs. {result.grand_total}</h2>
              </div>
              <div className="space-y-4 text-[11px] border-t border-white/10 pt-4">
                <div className="flex justify-between"><span>Vehicle Tax Principal</span><span className="font-bold">Rs. {result.breakdown.tax_principal}</span></div>
                <div className="flex justify-between text-orange-400"><span>Late Fines & Arrears</span><span className="font-bold">Rs. {Number(result.breakdown.renewal_charge) + Number(result.breakdown.current_fine) + Number(result.breakdown.arrears_32) - 300}</span></div>
                <div className="flex justify-between"><span>Renewal Fee (Official)</span><span className="font-bold">Rs. 300</span></div>
                <div className="flex justify-between text-green-400"><span>3rd Party Insurance</span><span className="font-bold">Rs. {result.breakdown.insurance_premium}</span></div>
                <div className="flex justify-between pt-2 text-blue-200 border-t border-white/10"><span className="font-black uppercase">Hello Beema Fee</span><span className="font-black">Rs. {result.breakdown.service_charge}</span></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
