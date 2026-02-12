// Inside your VehicleTaxCalculator component:

const [brands, setBrands] = useState<string[]>([]);
const [models, setModels] = useState<any[]>([]);
const [selectedBrand, setSelectedBrand] = useState('');

// Fetch unique brands on load
useEffect(() => {
  async function fetchBrands() {
    const { data } = await supabase
      .from('vehicle_models')
      .select('brand')
      .order('brand');
    if (data) setBrands(Array.from(new Set(data.map(i => i.brand))));
  }
  fetchBrands();
}, []);

// Fetch models when a brand is selected
useEffect(() => {
  if (selectedBrand) {
    async function fetchModels() {
      const { data } = await supabase
        .from('vehicle_models')
        .select('model_name')
        .eq('brand', selectedBrand);
      if (data) setModels(data);
    }
    fetchModels();
  }
}, [selectedBrand]);
