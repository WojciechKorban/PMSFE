import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { Photo, PresignedUrlResponse } from '../models/meter.models';

@Injectable({ providedIn: 'root' })
export class ReadingPhotoService {
  private http = inject(HttpClient);

  uploadPhoto(
    propertyId: string,
    meterId: string,
    readingId: string,
    file: File
  ): Observable<Photo> {
    // Step 1: get presigned URL
    return this.http.get<PresignedUrlResponse>(
      `/api/v1/properties/${propertyId}/meters/${meterId}/readings/${readingId}/photos/upload-url`,
      { params: { filename: file.name } }
    ).pipe(
      // Step 2: PUT directly to S3 (no auth header — interceptor skips non-/api/ URLs)
      switchMap(({ uploadUrl, photoId }) =>
        this.http.put(uploadUrl, file, {
          headers: new HttpHeaders({ 'Content-Type': file.type })
        }).pipe(
          // Step 3: confirm
          switchMap(() =>
            this.http.post<Photo>(
              `/api/v1/properties/${propertyId}/meters/${meterId}/readings/${readingId}/photos/confirm`,
              { photoId }
            )
          )
        )
      )
    );
  }

  getPhotos(propertyId: string, meterId: string, readingId: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(
      `/api/v1/properties/${propertyId}/meters/${meterId}/readings/${readingId}/photos`
    );
  }

  deletePhoto(propertyId: string, meterId: string, readingId: string, photoId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/properties/${propertyId}/meters/${meterId}/readings/${readingId}/photos/${photoId}`
    );
  }
}
