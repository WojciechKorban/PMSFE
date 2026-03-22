import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY } from 'rxjs';
import { TenantService } from '../services/tenant.service';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, TranslocoPipe,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <button mat-icon-button routerLink="/tenants"><mat-icon>arrow_back</mat-icon></button>
        <h2>{{ (isEdit() ? 'tenants.form.editTitle' : 'tenants.form.createTitle') | transloco }}</h2>
      </div>
      @if (isEdit() && tenantResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="tenant-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'tenants.form.firstName' | transloco }}</mat-label>
              <input matInput formControlName="firstName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ 'tenants.form.lastName' | transloco }}</mat-label>
              <input matInput formControlName="lastName" />
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'tenants.form.email' | transloco }}</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'tenants.form.phone' | transloco }}</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'tenants.form.notes' | transloco }}</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>
          <div class="form-actions">
            <button mat-stroked-button type="button" routerLink="/tenants">{{ 'common.cancel' | transloco }}</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              @if (saving()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ (isEdit() ? 'common.save' : 'common.create') | transloco }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .form-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .form-header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    .tenant-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
  `],
})
export class TenantFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);

  tenantId = signal<string | null>(null);
  isEdit = signal(false);
  saving = signal(false);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    notes: [''],
  });

  tenantResource = rxResource({
    params: () => this.tenantId(),
    stream: ({ params: id }) => id ? this.tenantService.getById(id) : EMPTY,
  });

  constructor() {
    effect(() => {
      const tenant = this.tenantResource.value();
      if (tenant) {
        this.form.patchValue({
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          email: tenant.email,
          phone: tenant.phone ?? '',
          notes: tenant.notes ?? '',
        });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['tenantId'];
    if (id) {
      this.tenantId.set(id);
      this.isEdit.set(true);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    const data = {
      firstName: val.firstName!,
      lastName: val.lastName!,
      email: val.email!,
      phone: val.phone || undefined,
      notes: val.notes || undefined,
    };
    const obs = this.isEdit()
      ? this.tenantService.update(this.tenantId()!, data)
      : this.tenantService.create(data);
    obs.subscribe({
      next: () => this.router.navigate(['/tenants']),
      error: () => this.saving.set(false),
    });
  }
}
