"use client";
import { useState, useEffect } from "react";
// Using relative path to fix the Vercel build error
import { supabase } from "../../lib/supabase";

export default function HelloBeemaUserFriendly() {
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [expiryDateBS, setExpiryDateBS] = useState(""); 
  const [buysInsurance, setBuysInsurance] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Brands based on Vehicle Type
  useEffect(() => {
    async function getBrands() {
      const { data } = await supabase
        .from("vehicle_models")
        .select("brand")
        .eq("category", vehicleType);
      if (data) {
        setBrands(Array.from(new Set(data.map(i => i.brand))).sort());
      }
      setSelectedBrand("");
      setSelectedModel("");
    }
    getBrands();
  }, [vehicleType]);

  // Fetch Models based on Brand
  useEffect(() => {
    if (selectedBrand) {
      async function getModels() {
        const { data } = await supabase
          .from("vehicle_models")
          .select("model_name")
          .eq("brand", selectedBrand)
          .eq("category", vehicleType);
        if (data) setModels(data.sort((a, b) => a.model_name.localeCompare(b.model_name)));
      }
      getModels();
    }
  }, [selectedBrand, vehicleType]);

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null); // Clear old data to prevent UI flickering

    const { data, error } = await supabase.rpc("calculate_hello_beema_final_v37", {
      p_brand: selectedBrand,
      p_model_name: selectedModel,
      p_expiry_date_bs: expiryDateBS,
      p_payment_date_bs: null, // Let SQL Brain handle current date auto-detect
      p_manufacture_year_ad: 2022, 
      p_buys_insurance: buysInsurance,
      p_is_commercial: vehicleType.includes("commercial") || vehicleType === "truck"
    });

    if (data && data[0]) {
      setResult(data[0]);
    } else {
      console.error('Calculation Error:', error);
      alert("Calculation Error. Please verify the brand, model, and date (YYYY-MM-DD).");
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
            {/* 1. VEHICLE TYPE TOGGLES */}
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
                      ? "bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-200" 
                      : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* 2. BRAND & MODEL */}
            <div className="space-y-3">
              <select 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none appearance-none"
                value={selectedBrand}
              >
                <option value="">Choose Brand</option>
                {brands.map(b => <option key={b}>{b}</option>)}
              </select>

              <select 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none appearance-none disabled:opacity-50"
                disabled={!selectedBrand}
                value={selectedModel}
              >
                <option value="">Choose Model</option>
                {models.map(m => <option key={m.model_name}>{m.model_name}</option>)}
              </select>
            </div>

            {/* 3. NEPALI DATE PICKER (Manual Input) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bluebook Expiry (BS)</label>
              <input 
                type="text" 
                placeholder="YYYY-MM-DD (e.g. 2081-10-25)" 
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-mono font-bold border-none focus:ring-2 focus:ring-blue-500"
                value={expiryDateBS}
                onChange={(e) => setExpiryDateBS(e.target.value)}
              />
            </div>

            {/* 4. INSURANCE TOGGLE */}
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
              disabled={loading || !selectedModel || !expiryDateBS}
              className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-20"
            >
              {loading ? "Calculating..." : "See Final Bill"}
            </button>
          </div>

          {/* RESULTS AREA - MAPPED TO V37 KEYS */}
          {result && (
            <div className="
