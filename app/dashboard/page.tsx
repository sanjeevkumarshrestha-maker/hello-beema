DROP FUNCTION IF EXISTS public.calculate_tax_core(text, text, text, text, integer);

CREATE OR REPLACE FUNCTION calculate_tax_core(
    p_brand TEXT, 
    p_model_name TEXT, 
    p_expiry_bs TEXT, 
    p_payment_bs TEXT, 
    p_manufacture_year INTEGER
) 
RETURNS TABLE (
    tax_principal NUMERIC, 
    renewal_total NUMERIC, 
    arrears_32 NUMERIC, 
    current_fine NUMERIC, 
    v_ins_premium NUMERIC, 
    is_up_to_date BOOLEAN
) AS $$
DECLARE
    v_engine_cc INTEGER; 
    v_v_cat TEXT; 
    v_base_rate NUMERIC;
    v_ins_rate NUMERIC; 
    v_exp_y INTEGER; 
    v_curr_y INTEGER;
    v_age INTEGER; 
    v_surcharge_factor NUMERIC;
    v_fy_row RECORD;
BEGIN
    -- 1. FIX: HANDLE "BY CC" MODE OR "BY MODEL" MODE
    -- If brand is 'Custom', p_model_name contains the CC integer as text
    IF p_brand = 'Custom' THEN
        v_engine_cc := p_model_name::INTEGER;
        v_v_cat := 'motorcycle'; -- Defaulting to motorcycle for CC mode, can be parameterized
    ELSE
        SELECT engine_cc, category INTO v_engine_cc, v_v_cat
        FROM vehicle_models 
        WHERE brand ILIKE p_brand AND model_name ILIKE p_model_name 
        LIMIT 1;
    END IF;

    -- 2. IDENTIFY CURRENT YEAR
    v_curr_y := EXTRACT(YEAR FROM CURRENT_DATE) + 57; 

    -- 3. INITIALIZE TOTALS
    tax_principal := 0; arrears_32 := 0; current_fine := 0;
    v_exp_y := SPLIT_PART(p_expiry_bs, '-', 1)::INTEGER;

    -- 4. THE 5-YEAR FISCAL LOOP
    FOR v_fy_row IN (
        SELECT id, fy_label FROM fiscal_year_config 
        WHERE CAST(SPLIT_PART(fy_label, '/', 1) AS INTEGER) BETWEEN v_exp_y AND v_curr_y
        ORDER BY fy_label ASC LIMIT 5
    ) LOOP
        -- Fetch annual rate
        SELECT annual_tax_amount INTO v_base_rate FROM tax_slabs 
        WHERE vehicle_type = v_v_cat AND fiscal_year_id = v_fy_row.id 
        AND v_engine_cc BETWEEN min_cc AND COALESCE(max_cc, 9999) LIMIT 1;

        -- 5. OLD MODEL SURCHARGE (5% per year after 14 years)
        v_age := CAST(SPLIT_PART(v_fy_row.fy_label, '/', 1) AS INTEGER) - p_manufacture_year;
        v_surcharge_factor := CASE 
            WHEN v_age >= 34 THEN 2.0 
            WHEN v_age >= 15 THEN 1.0 + ((v_age - 14) * 0.05)
            ELSE 1.0 
        END;

        IF CAST(SPLIT_PART(v_fy_row.fy_label, '/', 1) AS INTEGER) < v_curr_y THEN
            tax_principal := tax_principal + (v_base_rate * v_surcharge_factor);
            arrears_32 := arrears_32 + (v_base_rate * v_surcharge_factor * 0.32);
        ELSE
            tax_principal := tax_principal + (v_base_rate * v_surcharge_factor);
            current_fine := (v_base_rate * v_surcharge_factor * 0.20);
        END IF;
    END LOOP;

    -- 6. RENEWAL & 100% FINE
    renewal_total := CASE WHEN v_curr_y > v_exp_y THEN 600 ELSE 300 END;

    -- 7. INSURANCE
    SELECT annual_tax_amount INTO v_ins_rate FROM tax_slabs 
    WHERE vehicle_type = 'tp_motorcycle' AND v_engine_cc BETWEEN min_cc AND COALESCE(max_cc, 9999) LIMIT 1;
    v_ins_premium := COALESCE(v_ins_rate, 1705);
    
    is_up_to_date := (v_curr_y = v_exp_y);
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
