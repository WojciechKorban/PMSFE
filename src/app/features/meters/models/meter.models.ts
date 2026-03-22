export type UtilityType = 'ELECTRICITY' | 'GAS' | 'WATER' | 'HEAT' | 'OTHER';
export type MeterStatus = 'ACTIVE' | 'REPLACED' | 'DECOMMISSIONED';

export interface Meter {
  id: string;
  propertyId: string;
  utilityType: UtilityType;
  serialNumber: string;
  unit: string;
  status: MeterStatus;
  installationDate: string | null;
  notes: string | null;
  latestReading: Reading | null;
  createdAt: string;
}

export interface Reading {
  id: string;
  meterId: string;
  readingDate: string;
  value: number;
  notes: string | null;
  photos: Photo[];
  createdAt: string;
}

export interface Photo {
  id: string;
  readingId: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface Tariff {
  id: string;
  propertyId: string;
  utilityType: UtilityType;
  pricePerUnit: number;
  currency: string;
  validFrom: string;
  createdAt: string;
}

export interface CreateMeterRequest {
  utilityType: UtilityType;
  serialNumber: string;
  unit: string;
  installationDate?: string;
  notes?: string;
}

export interface UpdateMeterRequest {
  serialNumber: string;
  notes?: string;
}

export interface ReplaceMeterRequest {
  newSerialNumber: string;
  replacementDate: string;
  oldFinalReading: number;
  newInitialReading: number;
  reason?: string;
}

export interface CreateReadingRequest {
  readingDate: string;
  value: number;
  notes?: string;
}

export interface AddTariffRequest {
  utilityType: UtilityType;
  pricePerUnit: number;
  currency: string;
  validFrom: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  photoId: string;
}
