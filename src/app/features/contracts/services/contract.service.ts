import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import {
  Contract,
  ContractDocument,
  CreateContractRequest,
  TerminateContractRequest,
  DocumentUploadUrlResponse,
} from '../models/contract.models';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private http = inject(HttpClient);

  getAll(propertyId: string): Observable<Contract[]> {
    return this.http.get<Contract[]>(`/api/v1/properties/${propertyId}/contracts`);
  }

  getById(propertyId: string, contractId: string): Observable<Contract> {
    return this.http.get<Contract>(`/api/v1/properties/${propertyId}/contracts/${contractId}`);
  }

  create(propertyId: string, data: CreateContractRequest): Observable<Contract> {
    return this.http.post<Contract>(`/api/v1/properties/${propertyId}/contracts`, data);
  }

  terminate(
    propertyId: string,
    contractId: string,
    data?: TerminateContractRequest
  ): Observable<Contract> {
    return this.http.post<Contract>(
      `/api/v1/properties/${propertyId}/contracts/${contractId}/terminate`,
      data ?? {}
    );
  }

  getDocuments(propertyId: string, contractId: string): Observable<ContractDocument[]> {
    return this.http.get<ContractDocument[]>(
      `/api/v1/properties/${propertyId}/contracts/${contractId}/documents`
    );
  }

  getDownloadUrl(
    propertyId: string,
    contractId: string,
    docId: string
  ): Observable<{ downloadUrl: string }> {
    return this.http.get<{ downloadUrl: string }>(
      `/api/v1/properties/${propertyId}/contracts/${contractId}/documents/${docId}/download-url`
    );
  }

  uploadDocument(propertyId: string, contractId: string, file: File): Observable<ContractDocument> {
    // Step 1: get presigned upload URL
    return this.http.get<DocumentUploadUrlResponse>(
      `/api/v1/properties/${propertyId}/contracts/${contractId}/documents/upload-url`,
      { params: { filename: file.name, contentType: file.type } }
    ).pipe(
      switchMap(({ uploadUrl, s3Key }) =>
        // Step 2: PUT directly to S3 (no auth header — interceptor skips non-/api/ URLs)
        this.http.put(uploadUrl, file, {
          headers: new HttpHeaders({ 'Content-Type': file.type }),
        }).pipe(
          switchMap(() =>
            // Step 3: confirm upload
            this.http.post<ContractDocument>(
              `/api/v1/properties/${propertyId}/contracts/${contractId}/documents/confirm`,
              {
                s3Key,
                filename: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
              }
            )
          )
        )
      )
    );
  }
}
