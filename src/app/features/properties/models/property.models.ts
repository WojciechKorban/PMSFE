export interface PropertyResponse {
  id: string;
  name: string;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyProfitability {
  grossProfit: number;
  revenue: number;
  costs: number;
  currency: string;
  dataStatus: 'COMPLETE' | 'INCOMPLETE_DATA' | 'NO_DATA';
  periodMonth: number;
  periodYear: number;
}

export interface PropertySummary {
  id: string;
  name: string;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  description: string | null;
  meterCount: number;
  activeTenantCount: number;
  activeContractCount: number;
  lastProfitability: PropertyProfitability | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyRequest {
  name: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  description?: string;
}

export interface UpdatePropertyRequest {
  name?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  description?: string;
}

export function formatAddress(p: PropertyResponse | PropertySummary): string {
  const parts = [p.street, p.postalCode, p.city, p.country].filter(Boolean);
  return parts.join(', ');
}
