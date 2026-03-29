import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PropertyService } from '../services/property.service';
import { PropertySummary } from '../models/property.models';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { PropertyDetailDrawerComponent } from '../property-detail-drawer/property-detail-drawer.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'pms-property-list',
  imports: [
    FormsModule,
    TranslocoModule,
    PropertyCardComponent,
    PropertyDetailDrawerComponent,
    SkeletonLoaderComponent,
  ],
  template: `
    <!-- Drawer -->
    <pms-property-detail-drawer
      [propertyId]="drawerPropertyId()"
      [isOpen]="drawerOpen()"
      (close)="closeDrawer()"
    />

    <!-- Page content -->
    <div class="page-wrapper">

      <!-- Page header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">{{ 'properties.list.title' | transloco }}</h1>
          <p class="page-subtitle">{{ subtitleText() }}</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateForm()" type="button">
          <span class="material-icons">add</span>
          {{ 'properties.list.addButton' | transloco }}
        </button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-input-wrap">
          <span class="material-icons">search</span>
          <input
            class="search-input"
            type="text"
            [(ngModel)]="searchQuery"
            [placeholder]="'properties.list.searchPlaceholder' | transloco"
          />
        </div>
      </div>

      <!-- Loading skeleton -->
      @if (propertiesResource.isLoading()) {
        <pms-skeleton-loader type="list" [rowCount]="6" />
      }

      <!-- Error -->
      @else if (propertiesResource.error()) {
        <div class="error-banner">
          <span class="material-icons">error_outline</span>
          <span>{{ 'properties.list.loadError' | transloco }}</span>
          <button class="btn btn-outline btn-sm" (click)="propertiesResource.reload()">
            {{ 'buttons.retry' | transloco }}
          </button>
        </div>
      }

      <!-- Empty state — no properties at all -->
      @else if ((propertiesResource.value()?.length ?? 0) === 0) {
        <div class="empty-state">
          <svg class="empty-state-icon" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="60" width="88" height="52" rx="4" fill="currentColor" opacity="0.15"/>
            <path d="M16 64L64 24L112 64" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.4"/>
            <rect x="48" y="84" width="32" height="28" rx="2" fill="currentColor" opacity="0.2"/>
          </svg>
          <h2 class="empty-state-title">{{ 'properties.list.emptyState.title' | transloco }}</h2>
          <p class="empty-state-desc">{{ 'properties.list.emptyState.description' | transloco }}</p>
          <button class="btn btn-primary" (click)="openCreateForm()">
            <span class="material-icons">add</span>
            {{ 'properties.list.emptyState.action' | transloco }}
          </button>
        </div>
      }

      <!-- Empty state — search filtered everything -->
      @else if (filteredProperties().length === 0 && searchQuery.length > 0) {
        <div class="empty-search">
          <span class="material-icons">search_off</span>
          <p>{{ 'properties.list.noSearchResults' | transloco }}</p>
        </div>
      }

      <!-- Properties grid -->
      @else {
        <div class="properties-grid">
          @for (property of filteredProperties(); track property.id; let i = $index) {
            <div class="card-wrapper" [style.animation-delay]="(i * 50) + 'ms'">
              <pms-property-card
                [property]="property"
                (detailsClick)="openDrawer($event)"
                (editClick)="onEdit($event)"
                (deleteClick)="onDelete($event)"
              />
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .page-wrapper {
      padding: 24px;
    }

    /* ── Page header ── */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
    }

    .page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--color-text-primary, #0F172A);
      letter-spacing: -0.025em;
      line-height: 1.2;
      margin: 0 0 4px;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary, #475569);
      margin: 0;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      height: 40px;
      border-radius: 6px;
      border: none;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      font-family: var(--font-family-base, 'Inter', sans-serif);
      text-decoration: none;
      white-space: nowrap;
      transition: background 200ms, box-shadow 200ms, transform 200ms;

      .material-icons { font-size: 18px; }
    }

    .btn-primary {
      background: var(--color-interactive-primary, #2563EB);
      color: #ffffff;

      &:hover {
        background: var(--color-primary-700, #1D4ED8);
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
      }
    }

    .btn-outline {
      background: transparent;
      color: var(--color-text-secondary, #475569);
      border: 1px solid var(--color-border-default, #E2E8F0);

      &:hover {
        border-color: var(--color-border-strong, #CBD5E1);
        color: var(--color-text-primary, #0F172A);
        background: var(--color-bg-canvas, #F8FAFC);
      }
    }

    .btn-sm {
      height: 32px;
      padding: 0 12px;
      font-size: 0.75rem;
    }

    /* ── Toolbar ── */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .search-input-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;

      .material-icons {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        color: var(--color-text-muted, #94A3B8);
        pointer-events: none;
      }
    }

    .search-input {
      width: 100%;
      height: 40px;
      padding: 0 16px 0 40px;
      border: 1px solid var(--color-border-default, #E2E8F0);
      border-radius: 6px;
      background: var(--color-bg-surface, #ffffff);
      color: var(--color-text-primary, #0F172A);
      font-size: 0.875rem;
      font-family: var(--font-family-base, 'Inter', sans-serif);
      outline: none;
      transition: border-color 200ms, box-shadow 200ms;

      &::placeholder { color: var(--color-text-muted, #94A3B8); }
      &:focus {
        border-color: var(--color-primary-500, #3B82F6);
        box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
      }
    }

    /* ── Grid ── */
    .properties-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .card-wrapper {
      animation: fadeSlideUp 400ms cubic-bezier(0,0,0.2,1) both;
    }

    /* ── Error banner ── */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 8px;
      color: var(--color-error-600, #DC2626);
      font-size: 0.875rem;

      .material-icons { font-size: 20px; }
    }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      min-height: 400px;
    }

    .empty-state-icon {
      width: 128px;
      height: 128px;
      margin-bottom: 24px;
      color: var(--color-text-muted, #94A3B8);
    }

    .empty-state-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary, #0F172A);
      margin: 0 0 12px;
    }

    .empty-state-desc {
      font-size: 0.875rem;
      color: var(--color-text-secondary, #475569);
      max-width: 360px;
      margin: 0 0 24px;
      line-height: 1.6;
    }

    .empty-search {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: var(--color-text-muted, #94A3B8);
      gap: 12px;
      text-align: center;

      .material-icons { font-size: 48px; opacity: 0.5; }
      p { font-size: 0.875rem; }
    }

    /* ── Animations ── */
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Responsive ── */
    @media (max-width: 1200px) {
      .properties-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .page-wrapper { padding: 16px; }
      .properties-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: flex-start; }
    }

    @media (max-width: 480px) {
      .properties-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PropertyListComponent {
  protected readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(SnackbarService);
  private readonly transloco = inject(TranslocoService);

  searchQuery = '';

  readonly drawerOpen = signal(false);
  readonly drawerPropertyId = signal<string | null>(null);

  readonly propertiesResource = rxResource<PropertySummary[], void>({
    stream: () => this.propertyService.getAll(),
  });

  readonly filteredProperties = computed((): PropertySummary[] => {
    const q = this.searchQuery.toLowerCase().trim();
    const all: PropertySummary[] = this.propertiesResource.value() ?? [];
    if (!q) return all;
    return all.filter(
      (p: PropertySummary) =>
        p.name.toLowerCase().includes(q) ||
        (p.city ?? '').toLowerCase().includes(q) ||
        (p.street ?? '').toLowerCase().includes(q)
    );
  });

  readonly subtitleText = computed(() => {
    const count = this.propertiesResource.value()?.length ?? 0;
    return this.transloco.translate('properties.list.subtitle', { count });
  });

  openDrawer(id: string): void {
    this.drawerPropertyId.set(id);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    setTimeout(() => this.drawerPropertyId.set(null), 300);
  }

  openCreateForm(): void {
    this.router.navigate(['/properties/new']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/properties', id, 'edit']);
  }

  onDelete(property: PropertySummary): void {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.transloco.translate('properties.delete.confirmTitle'),
        message: this.transloco.translate('properties.delete.confirmMessage', {
          name: property.name,
        }),
        confirmLabel: this.transloco.translate('properties.delete.confirmButton'),
        cancelLabel: this.transloco.translate('buttons.cancel'),
        dangerous: true,
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.propertyService.delete(property.id).subscribe({
        next: () => {
          this.snackbar.success('properties.delete.success');
          this.propertiesResource.reload();
        },
      });
    });
  }
}
