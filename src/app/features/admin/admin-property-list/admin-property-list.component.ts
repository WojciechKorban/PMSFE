import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-property-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatPaginatorModule
  ],
  template: `
    <div class="list-container">
      <div class="list-header">
        <h2>{{ 'admin.properties.title' | transloco }}</h2>
      </div>

      @if (propertiesResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="propertiesResource.value()?.content ?? []" class="properties-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.properties.columns.name' | transloco }}</th>
            <td mat-cell *matCellDef="let p">{{ p.name }}</td>
          </ng-container>
          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.properties.columns.city' | transloco }}</th>
            <td mat-cell *matCellDef="let p">{{ p.city }}</td>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.properties.columns.createdAt' | transloco }}</th>
            <td mat-cell *matCellDef="let p">{{ p.createdAt | date:'dd.MM.yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>{{ 'admin.properties.columns.id' | transloco }}</th>
            <td mat-cell *matCellDef="let p" class="id-cell">{{ p.id | slice:0:8 }}...</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>

        <mat-paginator
          [length]="propertiesResource.value()?.totalElements ?? 0"
          [pageSize]="pageSize"
          [pageIndex]="page()"
          (page)="onPageChange($event)"
          showFirstLastButtons
        ></mat-paginator>
      }
    </div>
  `,
  styles: [`
    .list-container { max-width: 1000px; margin: 0 auto; padding: 16px; }
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .properties-table { width: 100%; }
    .id-cell { font-family: monospace; font-size: 0.85rem; color: #666; }
  `]
})
export class AdminPropertyListComponent {
  private adminService = inject(AdminService);

  page = signal(0);
  pageSize = 20;
  columns = ['name', 'city', 'createdAt', 'id'];

  propertiesResource = rxResource({
    params: () => this.page(),
    stream: ({ params: p }) => this.adminService.getProperties(p, this.pageSize)
  });

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
  }
}
