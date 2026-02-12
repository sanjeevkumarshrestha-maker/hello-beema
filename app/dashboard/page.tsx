"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Adjust based on your file structure

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
    }
  }, [selectedBrand]);

  const handleCalculate = async () => {
    if (!selectedBrand || !selectedModel
