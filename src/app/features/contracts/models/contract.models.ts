export type ContractStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED';

export interface Contract {
  id: string;
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string | null;
  monthlyAmount: number;
  currency: string;
  status: ContractStatus;
  terminatedAt: string | null;
  createdAt: string;
}

export interface ContractDocument {
  id: string;
  contractId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface CreateContractRequest {
  tenantId: string;
  startDate: string;
  endDate?: string;
  monthlyAmount: number;
  currency: string;
  notes?: string;
}

export interface TerminateContractRequest {
  terminationReason?: string;
}

export interface DocumentUploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
}
