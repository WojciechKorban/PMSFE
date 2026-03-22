import { Component, computed, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import { PropertyService } from '../services/property.service';
import { PropertyResponse } from '../models/property.models';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslatedValidationErrorsPipe } from '../../../shared/pipes/translated-validation-errors.pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

interface PropertyFormControls {
  name: FormControl<string>;
  street: FormControl<string>;
  city: FormControl<string>;
  postalCode: FormControl<string>;
  country: FormControl<string>;
  description: FormControl<string>;
}

@Component({
  selector: 'pms-property-form',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatCardModule, MatProgressSpinnerModule,
    TranslocoModule, PageHeaderComponent, TranslatedValidationErrorsPipe,
    SkeletonLoaderComponent,
  ],
  template: `
    <pms-page-header [title]="pageTitle() | transloco" />
    <div class="form-container">
      @if (isEditMode && propertyResource?.isLoading()) {
        <pms-skeleton-loader type="detail" />
      } @else {
        <mat-card>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="property-form">

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'properties.form.nameLabel' | transloco }}</mat-label>
                <input matInput formControlName="name"
                       [placeholder]="'properties.form.namePlaceholder' | transloco" />
                <mat-error>{{ form.controls.name.errors | translatedValidationErrors }}</mat-error>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-2">
                  <mat-label>{{ 'properties.form.streetLabel' | transloco }}</mat-label>
                  <input matInput formControlName="street"
                         [placeholder]="'properties.form.streetPlaceholder' | transloco" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>{{ 'properties.form.postalCodeLabel' | transloco }}</mat-label>
                  <input matInput formControlName="postalCode"
                         [placeholder]="'properties.form.postalCodePlaceholder' | transloco" />
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>{{ 'properties.form.cityLabel' | transloco }}</mat-label>
                  <input matInput formControlName="city"
                         [placeholder]="'properties.form.cityPlaceholder' | transloco" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>{{ 'properties.form.countryLabel' | transloco }}</mat-label>
                  <input matInput formControlName="country"
                         [placeholder]="'properties.form.countryPlaceholder' | transloco" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'properties.form.descriptionLabel' | transloco }}</mat-label>
                <textarea matInput formControlName="description" rows="3"
                          [placeholder]="'properties.form.descriptionPlaceholder' | transloco">
                </textarea>
              </mat-form-field>

              <div class="form-actions">
                <button mat-button type="button" (click)="router.navigate(['/properties'])">
                  {{ 'properties.form.cancelButton' | transloco }}
                </button>
                <button mat-flat-button color="primary" type="submit"
                        [disabled]="form.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <mat-spinner diameter="20" color="accent" />
                  } @else {
                    {{ 'properties.form.saveButton' | transloco }}
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .form-container { padding: 0 24px 24px; max-width: 720px; }
    .property-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .full-width { width: 100%; }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  `],
})
export class PropertyFormComponent implements OnInit {
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly snackbar = inject(SnackbarService);
  private readonly injector = inject(Injector);

  readonly isSubmitting = signal(false);

  protected readonly isEditMode: boolean =
    !!this.route.snapshot.paramMap.get('propertyId');
  private readonly propertyId: string | null =
    this.route.snapshot.paramMap.get('propertyId');

  protected readonly propertyResource = this.isEditMode && this.propertyId
    ? rxResource<PropertyResponse, void>({
        stream: () => this.propertyService.getById(this.propertyId!),
      })
    : null;

  readonly pageTitle = computed(() =>
    this.isEditMode
      ? 'properties.form.editTitle'
      : 'properties.form.createTitle'
  );

  readonly form = new FormGroup<PropertyFormControls>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    street: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
    postalCode: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    country: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(100)] }),
    description: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    if (this.propertyResource) {
      effect(() => {
        const property = this.propertyResource!.value();
        if (property) {
          this.form.patchValue({
            name: property.name,
            street: property.street ?? '',
            city: property.city ?? '',
            postalCode: property.postalCode ?? '',
            country: property.country ?? '',
            description: property.description ?? '',
          });
        }
      }, { injector: this.injector });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const value = this.form.getRawValue();

    const request$ = this.isEditMode && this.propertyId
      ? this.propertyService.update(this.propertyId, value)
      : this.propertyService.create(value);

    request$.subscribe({
      next: (property) => {
        const key = this.isEditMode
          ? 'properties.form.updateSuccess'
          : 'properties.form.createSuccess';
        this.snackbar.success(key);
        this.router.navigate(['/properties', property.id]);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}
