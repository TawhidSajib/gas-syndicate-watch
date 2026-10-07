export interface CylinderPricingBaseline {
  size: string;
  officialGovtRate: number; // in local currency (BDT)
  description: string;
}

export const OFFICIAL_PRICING_BENCHMARKS: Record<string, CylinderPricingBaseline> = {
  '12kg': {
    size: '12kg',
    officialGovtRate: 1455,
    description: 'Standard Domestic 12kg (Most commonly gouged by syndicates)'
  },
  '5.5kg': {
    size: '5.5kg',
    officialGovtRate: 668,
    description: 'Compact Household Cylinder'
  },
  '35kg': {
    size: '35kg',
    officialGovtRate: 4245,
    description: 'Commercial Restaurant Cylinder'
  },
  '45kg': {
    size: '45kg',
    officialGovtRate: 5458,
    description: 'Heavy Commercial / Industrial Cylinder'
  }
};

export const COMMON_LPG_BRANDS = [
  'Bashundhara LP Gas',
  'Omera LPG',
  'Jamuna Gas',
  'Beximco LPG',
  'TotalEnergies LPG',
  'BM LP Gas',
  'Fresh LP Gas',
  'Delta LPG',
  'Sena LP Gas',
  'Universal Gas',
  'G-Gas (Energypac)',
  'Petromax LPG',
  'JMI LPG',
  'Other / Local Distributor'
];

export const SYNDICATE_TACTICS = [
  'Artificial Supply Shortage (Hiding cylinders in backyard)',
  'Refusing Money Receipt / Cash memo',
  'Cartel Price Fixing across neighborhood shops',
  'Forced Bundled Purchase (Must buy stove/regulator)',
  'Night-time Exorbitant Surcharge',
  'Demanding Extra "Transportation Fee" over MSRP',
  'Under-filling / Tampered Seal on Cylinder'
];

export const BANGLADESH_REGIONS = [
  'Dhaka - Dhanmondi',
  'Dhaka - Mirpur',
  'Dhaka - Uttara',
  'Dhaka - Mohammadpur',
  'Dhaka - Gulshan / Banani',
  'Dhaka - Old Dhaka / Sadarghat',
  'Dhaka - Badda / Rampura',
  'Dhaka - Jatrabari',
  'Chattogram - Kotwali',
  'Chattogram - Agrabad',
  'Chattogram - Halishahar',
  'Sylhet - Zindabazar',
  'Rajshahi - Shaheb Bazar',
  'Khulna - Shibbari',
  'Barishal - Sadar',
  'Rangpur - City',
  'Mymensingh - Town',
  'Cumilla - Kandirpar',
  'Narayanganj - Chashara',
  'Gazipur - Joydebpur',
  'Bogura - Satmatha'
];
