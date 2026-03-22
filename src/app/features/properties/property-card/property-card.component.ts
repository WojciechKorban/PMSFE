import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { PropertyResponse, formatAddress } from '../models/property.models';
import { TranslatedDatePipe } from '../../../core/i18n/translated-date.pipe';

@Component({
  selector: 'pms-property-card',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslocoModule, TranslatedDatePipe],
  template: `
    <mat-card class="property-card">
      <mat-card-header>
        <mat-card-title>
          <a [routerLink]="['/properties', property().id]" class="property-link">
            {{ property().name }}
          </a>
        </mat-card-title>
        <mat-card-subtitle>{{ address() }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        @if (property().description) {
          <p class="description">{{ property().description }}</p>
        }
        <p class="meta">
          {{ 'properties.detail.lastUpdated' | transloco }}:
          {{ property().updatedAt | translatedDate }}
        </p>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-icon-button color="primary"
                (click)="editClick.emit(property().id)"
                [attr.aria-label]="'properties.detail.editButton' | transloco">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button color="warn"
                (click)="deleteClick.emit(property())"
                [attr.aria-label]="'properties.delete.confirmButton' | transloco">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .property-card { height: 100%; }
    .property-link { text-decoration: none; color: inherit; }
    .property-link:hover { text-decoration: underline; }
    .description { overflow: hidden; display: -webkit-box;
                   -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                   color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
    .meta { font-size: 0.8rem; color: var(--mat-sys-on-surface-variant); margin-top: 8px; }
  `],
})
export class PropertyCardComponent {
  readonly property = input.required<PropertyResponse>();
  readonly editClick = output<string>();
  readonly deleteClick = output<PropertyResponse>();

  protected address(): string {
    return formatAddress(this.property());
  }
}
