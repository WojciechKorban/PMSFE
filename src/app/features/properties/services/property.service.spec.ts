import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PropertyService } from './property.service';
import { PropertyResponse, CreatePropertyRequest, UpdatePropertyRequest } from '../models/property.models';

const mockProperty: PropertyResponse = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Apartment',
  street: 'Test Street 1',
  city: 'Warsaw',
  postalCode: '00-001',
  country: 'Poland',
  description: 'A test property',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

describe('PropertyService', () => {
  let service: PropertyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PropertyService,
      ],
    });
    service = TestBed.inject(PropertyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('sends GET /api/v1/properties', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne('/api/v1/properties');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('returns PropertyResponse[] on 200', () => {
      const expected = [mockProperty];
      let result: PropertyResponse[] = [];

      service.getAll().subscribe(res => (result = res));

      const req = httpMock.expectOne('/api/v1/properties');
      req.flush(expected);

      expect(result).toEqual(expected);
    });
  });

  describe('getById()', () => {
    it('sends GET /api/v1/properties/{id}', () => {
      const id = mockProperty.id;
      service.getById(id).subscribe();
      const req = httpMock.expectOne(`/api/v1/properties/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProperty);
    });
  });

  describe('create()', () => {
    it('sends POST /api/v1/properties with correct body', () => {
      const createReq: CreatePropertyRequest = {
        name: 'New Property',
        city: 'Krakow',
      };

      service.create(createReq).subscribe();

      const req = httpMock.expectOne('/api/v1/properties');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createReq);
      req.flush(mockProperty, { status: 201, statusText: 'Created' });
    });

    it('returns created property on 201', () => {
      const createReq: CreatePropertyRequest = { name: 'New Property' };
      let result: PropertyResponse | undefined;

      service.create(createReq).subscribe(res => (result = res));

      const req = httpMock.expectOne('/api/v1/properties');
      req.flush(mockProperty, { status: 201, statusText: 'Created' });

      expect(result).toEqual(mockProperty);
    });
  });

  describe('update()', () => {
    it('sends PUT /api/v1/properties/{id}', () => {
      const id = mockProperty.id;
      const updateReq: UpdatePropertyRequest = { name: 'Updated Name' };

      service.update(id, updateReq).subscribe();

      const req = httpMock.expectOne(`/api/v1/properties/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateReq);
      req.flush({ ...mockProperty, name: 'Updated Name' });
    });
  });

  describe('delete()', () => {
    it('sends DELETE /api/v1/properties/{id}', () => {
      const id = mockProperty.id;

      service.delete(id).subscribe();

      const req = httpMock.expectOne(`/api/v1/properties/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
