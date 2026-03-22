export interface FixedCost {
  id: string;
  propertyId: string;
  name: string;
  amount: number;
  currency: string;
  validFrom: string;
  validTo: string | null;
  createdAt: string;
}

export interface AddFixedCostRequest {
  name: string;
  amount: number;
  currency: string;
  validFrom: string;
}

export interface UpdateFixedCostRequest {
  amount: number;
  currency: string;
  validFrom: string;
}
