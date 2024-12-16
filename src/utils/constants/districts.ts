export const districts = [
  {
    name: "Gasabo",
    code: "GAS",
    province: "Kigali"
  },
  {
    name: "Kicukiro",
    code: "KIC", 
    province: "Kigali"
  },
  {
    name: "Nyarugenge",
    code: "NYA",
    province: "Kigali"
  },
  {
    name: "Bugesera",
    code: "BUG",
    province: "Eastern"
  },
  {
    name: "Gatsibo",
    code: "GAT",
    province: "Eastern"
  },
  {
    name: "Kayonza",
    code: "KAY",
    province: "Eastern"
  },
  {
    name: "Kirehe",
    code: "KIR",
    province: "Eastern"
  },
  {
    name: "Ngoma",
    code: "NGO",
    province: "Eastern"
  },
  {
    name: "Nyagatare",
    code: "NYG",
    province: "Eastern"
  },
  {
    name: "Rwamagana",
    code: "RWA",
    province: "Eastern"
  },
  {
    name: "Burera",
    code: "BUR",
    province: "Northern"
  },
  {
    name: "Gakenke",
    code: "GAK",
    province: "Northern"
  },
  {
    name: "Gicumbi",
    code: "GIC",
    province: "Northern"
  },
  {
    name: "Musanze",
    code: "MUS",
    province: "Northern"
  },
  {
    name: "Rulindo",
    code: "RUL",
    province: "Northern"
  },
  {
    name: "Gisagara",
    code: "GIS",
    province: "Southern"
  },
  {
    name: "Huye",
    code: "HUY",
    province: "Southern"
  },
  {
    name: "Kamonyi",
    code: "KAM",
    province: "Southern"
  },
  {
    name: "Muhanga",
    code: "MUH",
    province: "Southern"
  },
  {
    name: "Nyamagabe",
    code: "NYB",
    province: "Southern"
  },
  {
    name: "Nyanza",
    code: "NYZ",
    province: "Southern"
  },
  {
    name: "Nyaruguru",
    code: "NYU",
    province: "Southern"
  },
  {
    name: "Ruhango",
    code: "RUH",
    province: "Southern"
  },
  {
    name: "Karongi",
    code: "KAR",
    province: "Western"
  },
  {
    name: "Ngororero",
    code: "NGR",
    province: "Western"
  },
  {
    name: "Nyabihu",
    code: "NYH",
    province: "Western"
  },
  {
    name: "Nyamasheke",
    code: "NYK",
    province: "Western"
  },
  {
    name: "Rubavu",
    code: "RBV",
    province: "Western"
  },
  {
    name: "Rusizi",
    code: "RSZ",
    province: "Western"
  },
  {
    name: "Rutsiro",
    code: "RUT",
    province: "Western"
  }
];

// Group districts by province
export const districtsByProvince = districts.reduce((acc, district) => {
  if (!acc[district.province]) {
    acc[district.province] = [];
  }
  acc[district.province].push(district);
  return acc;
}, {} as Record<string, typeof districts>);

// Get all provinces
export const provinces = [...new Set(districts.map(d => d.province))];

// Get districts by province
export const getDistrictsByProvince = (province: string) => {
  return districts.filter(d => d.province === province);
};

// Get district by code
export const getDistrictByCode = (code: string) => {
  return districts.find(d => d.code === code);
};

// Get district by name
export const getDistrictByName = (name: string) => {
  return districts.find(d => d.name === name);
}; 