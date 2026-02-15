const handleCalculate = async () => {
    setLoading(true);
    setResult(null);

    console.log("Sending to SQL:", { selectedBrand, selectedModel, expiryDateBS });

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
      alert(`SQL Error: ${error.message} - ${error.details}`);
      console.error(error);
    } else if (data && data[0]) {
      setResult(data[0]);
    } else {
      alert("No data returned from database.");
    }
    setLoading(false);
  };
