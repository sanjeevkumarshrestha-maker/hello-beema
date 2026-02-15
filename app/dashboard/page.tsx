"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

/**
 * HelloBeema Dashboard Component
 * Fixed for TypeScript Module Resolution
 */
export default function HelloBeemaDashboard() {
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [expiryDateBS, setExpiryDateBS] = useState(""); 
  const [buysInsurance, setBuysInsurance] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);

    const { data, error } = await supabase.rpc("calculate_hello_beema_final_v37", {
      p_brand: selectedBrand,
      p_model_name: selectedModel,
      p_expiry_date_bs: expiryDateBS,
      p_payment_date_bs: null, 
      p_manufacture_year_ad: 2022, 
      p_buys_insurance: buysInsurance,
      p_is_commercial: vehicleType.includes("commercial") || vehicleType === "truck"
    });

    if (error) {
      alert(`Error: ${error.message}`);
    } else if (data && data[0]) {
      setResult(data[0]);
    } else {
      alert("No data found for this model.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-black text-blue-900 italic uppercase">Hello Beema</h1>
          <div className="h-1 w-20 bg-orange-500 mx-auto mt-1"></div>
        </header>

        <main className="bg-white rounded-3xl shadow-xl p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
              {["motorcycle", "car", "electric_bike", "electric_car", "truck", "micro_bus"].map((type) => (
                <button
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase border-2 transition-all ${
                    vehicleType === type ? "bg-blue-900 text-white" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>

            <select 
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold"
              value={selectedBrand}
            >
              <option value="">Choose Brand</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold"
              disabled={!selectedBrand}
              value={selectedModel}
            >
              <option value="">Choose Model</option>
              {models.map(m => <option key={m.model_name} value={m.model_name}>{m.model_name}</option>)}
            </select>

            <input 
              type="text" 
              placeholder="Expiry BS (YYYY-MM-DD)" 
              className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold"
              value={expiryDateBS}
              onChange={(e) => setExpiryDateBS(e.target.value)}
            />

            <button 
              onClick={handleCalculate}
              disabled={loading || !selectedModel}
              className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Calculate Bill"}
            </button>
          </div>

          {result && (
            <div className="mt-8 bg-blue-900 rounded-2xl p-6 text-white">
              <h2 className="text-3xl font-black text-center mb-4">Rs. {result.grand_total}</h2>
              <div className="space-y-2 text-xs opacity-90">
                <div className="flex justify-between"><span>Tax Principal:</span><span>Rs. {result.breakdown.tax_principal}</span></div>
                <div className="flex justify-between"><span>Fines:</span><span>Rs. {Number(result.breakdown.renewal_charge) + Number(result.breakdown.current_fine) + Number(result.breakdown.arrears_32)}</span></div>
                <div className="flex justify-between"><span>Insurance:</span><span>Rs. {result.breakdown.insurance_premium}</span></div>
                <div className="flex justify-between font-bold text-orange-400"><span>Service Fee:</span><span>Rs. {result.breakdown.service_charge}</span></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
