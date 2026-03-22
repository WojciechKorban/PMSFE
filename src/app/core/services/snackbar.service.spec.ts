import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let snackBarSpy: jest.Mocked<MatSnackBar>;
  let translocoSpy: jest.Mocked<TranslocoService>;

  beforeEach(() => {
    snackBarSpy = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    translocoSpy = {
      translate: jest.fn().mockImplementation((key: string) => `translated:${key}`),
    } as unknown as jest.Mocked<TranslocoService>;

    TestBed.configureTestingModule({
      providers: [
        SnackbarService,
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: TranslocoService, useValue: translocoSpy },
      ],
    });

    service = TestBed.inject(SnackbarService);
  });

  describe('success()', () => {
    it('calls snackBar.open with success-snackbar panelClass', () => {
      service.success('some.key');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        expect.any(String),
        '✕',
        expect.objectContaining({
          panelClass: ['success-snackbar'],
        })
      );
    });

    it('translates the key via TranslocoService before showing', () => {
      service.success('some.key');

      expect(translocoSpy.translate).toHaveBeenCalledWith('some.key', {});
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'translated:some.key',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('passes params to translate', () => {
      service.success('some.key', { name: 'Test' });

      expect(translocoSpy.translate).toHaveBeenCalledWith('some.key', { name: 'Test' });
    });
  });

  describe('error()', () => {
    it('calls snackBar.open with error-snackbar panelClass', () => {
      service.error('some.error.key');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        expect.any(String),
        '✕',
        expect.objectContaining({
          panelClass: ['error-snackbar'],
        })
      );
    });

    it('translates the key via TranslocoService', () => {
      service.error('some.error.key');

      expect(translocoSpy.translate).toHaveBeenCalledWith('some.error.key', {});
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'translated:some.error.key',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('uses longer duration (5000ms) for errors', () => {
      service.error('some.error.key');

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ duration: 5000 })
      );
    });
  });
});
