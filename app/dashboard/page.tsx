"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function HelloBeemaUserFriendly() {
  // Input States
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [expiryDateBS, setExpiryDateBS] = useState(""); // Format: YYYY-MM-DD
  const [buysInsurance, setBuysInsurance] = useState(true);
  
  // UI States
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Today's Date in BS (Placeholder logic - you can use a library like ad-bs-converter)
  const todayBS = "2082-11-01"; 

  // 1. Fetch Brands based on Type
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

  // 2. Fetch Models based on Brand
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
    // Note: p_payment_date_bs is now automated to 'todayBS'
    const { data, error } = await supabase.rpc("calculate_hello_beema_final_v37", {
      p_brand: selectedBrand,
      p_model_name: selectedModel,
      p_expiry_date_bs: expiryDateBS,
      p_payment_date_bs: todayBS, 
      p_manufacture_year_ad: 2022, 
      p_buys_insurance: buysInsurance,
      p_is_commercial: vehicleType.includes("commercial")
    });

    if (data) setResult(data[0]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-black text-blue-900 italic tracking-tighter text-center">HELLO BEEMA</h1>
          <p className="text-center text-slate-500 font-medium text-sm">Nepal's 1st Digital Bluebook Solution</p>
        </header>

        <main className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
          <div className="space-y-6">
            {/* 1. Vehicle Type Selector */}
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
                  className={`p-2 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                    vehicleType === type.id ? "bg-blue-900 text-white border-blue-900" : "bg-white text-slate-400 border-slate-100"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* 2. Brand & Model Selection */}
            <div className="space-y-4">
              <select 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none focus:ring-2 focus:ring-blue-500"
                value={selectedBrand}
              >
                <option value="">Choose Brand (e.g. Bajaj)</option>
                {brands.map(b => <option key={b}>{b}</option>)}
              </select>

              <select 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedBrand}
                value={selectedModel}
              >
                <option value="">Choose Model (e.g. Pulsar 150)</option>
                {models.map(m => <option key={m.model_name}>{m.model_name}</option>)}
              </select>
            </div>

            {/* 3. Nepali Date Expiry */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Bluebook Expiry Date (Nepali)</label>
              <input 
                type="text" 
                placeholder="YYYY-MM-DD (e.g. 2081-10-25)" 
                className="w-full bg-slate-50 rounded-2xl p-4 text-sm font-mono font-bold border-none"
                value={expiryDateBS}
                onChange={(e) => setExpiryDateBS(e.target.value)}
              />
            </div>

            {/* 4. Options */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
              <span className="text-sm font-bold text-green-900">Include Insurance?</span>
              <input 
                type="checkbox" 
                checked={buysInsurance} 
                onChange={(e) => setBuysInsurance(e.target.checked)}
                className="w-6 h-6 accent-green-600"
              />
            </div>

            <button 
              onClick={handleCalculate}
              disabled={loading || !selectedModel || !expiryDateBS}
              className="w-full py-5 bg-blue-900 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:opacity-30"
            >
              {loading ? "Calculating..." : "Calculate Final Bill"}
            </button>
          </div>

          {/* Result Breakdown */}
          {result && (
            <div className="mt-8 bg-slate-900 rounded-3xl p-6 text-white animate-in zoom-in-95 duration-300">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center mb-1">Total to Pay via eSewa</p>
              <h2 className="text-4xl font-black text-center mb-6">Rs. {result.grand_total}</h2>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2"><span>Govt Tax Principal</span><span className="font-bold">Rs. {result.breakdown.tax_principal}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span>Arrears & Fines</span><span className="font-bold text-red-400">Rs. {result.breakdown.renewal_charge}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-2"><span>3rd Party Insurance</span><span className="font-bold text-green-400">Rs. {result.breakdown.insurance_tp}</span></div>
                <div className="flex justify-between font-bold text-orange-400"><span>Hello Beema Service Fee</span><span>Rs. {result.breakdown.service_fee}</span></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
