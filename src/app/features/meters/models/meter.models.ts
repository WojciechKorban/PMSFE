export type UtilityType = 'ELECTRICITY' | 'GAS' | 'WATER_COLD' | 'WATER_HOT' | 'HEAT';
export type MeterStatus = 'ACTIVE' | 'REPLACED' | 'DECOMMISSIONED';
export type ReadingDataStatus = 'COMPLETE' | 'INCOMPLETE_DATA' | 'NO_DATA';

export interface Meter {
  id: string;
  propertyId: string;
  propertyAddress?: string;
  utilityType: UtilityType;
  serialNumber: string;
  installationDate: string;
  status: MeterStatus;
  description?: string;
  daysSinceLastReading?: number;
  lastReading?: MeterReading | null;
}

export interface MeterReading {
  id: string;
  meterId: string;
  readingDate: string;
  readingValue: number;
  consumptionSincePrevious?: number;
  consumptionDeltaPercent?: number;
  photoAttached?: boolean;
  notes?: string;
  createdBy?: string;
}

export interface CreateMeterRequest {
  utilityType: UtilityType;
  serialNumber: string;
  installationDate?: string;
  initialReading?: number;
  description?: string;
}

export interface SubmitReadingRequest {
  readingValue: number;
  readingDate: string;
  notes?: string;
}

export interface ReplaceMeterRequest {
  replacementDate: string;
  oldFinalReading: number;
  newSerialNumber: string;
  newInitialReading: number;
  reason?: string;
}

export interface ReadingFilter {
  page?: number;
  size?: number;
  meterId?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Legacy aliases for backward compat with pre-F3 stub components
export type Reading = MeterReading;
export interface CreateReadingRequest {
  value: number;
  readingDate: string;
  notes?: string;
}

export interface Photo {
  id: string;
  readingId: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  photoId: string;
  key: string;
}

export interface Tariff {
  id: string;
  utilityType: UtilityType;
  pricePerUnit: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface AddTariffRequest {
  utilityType: UtilityType;
  pricePerUnit: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateMeterRequest {
  serialNumber?: string;
  description?: string;
}
