export interface Complaint {
  id: string;
  shopName: string;
  shopAddress: string;
  district: string;
  cylinderBrand: string;
  cylinderSize: string;
  govtPrice: number;
  sellingPrice: number;
  markupAmount: number;
  syndicateTactic?: string;
  notes?: string;
  evidencePhotoUrl?: string;
  status?: 'active' | 'under_review' | 'verified_syndicate';
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserProfile {
  userId: string;
  userName: string;
  userEmail: string;
  lastLoginAt: string;
  sessionExpiresAt: string;
}

export interface SyndicateSummary {
  totalComplaints: number;
  totalExcessExtorted: number;
  averageMarkupAmount: number;
  averageMarkupPercent: number;
  highestMarkupComplaint?: Complaint;
  topSyndicateDistrict: string;
}

export type SortOption = 'markup_desc' | 'markup_asc' | 'newest' | 'selling_price_desc';
