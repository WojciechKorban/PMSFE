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

export function formatAddress(p: PropertyResponse): string {
  const parts = [p.street, p.postalCode, p.city, p.country].filter(Boolean);
  return parts.join(', ');
}
