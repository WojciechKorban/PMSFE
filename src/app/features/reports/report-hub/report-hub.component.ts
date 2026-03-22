import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report-hub',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatCardModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="hub-container">
      <h2>{{ 'reports.hub.title' | transloco }}</h2>

      <div class="cards-grid">
        <mat-card class="report-card">
          <mat-card-content>
            <div class="card-icon">
              <mat-icon>table_chart</mat-icon>
            </div>
            <h3>{{ 'reports.hub.csv.title' | transloco }}</h3>
            <p>{{ 'reports.hub.csv.description' | transloco }}</p>
          </mat-card-content>
          <mat-card-actions>
            <a mat-raised-button color="primary" routerLink="/reports/meter-readings">
              <mat-icon>download</mat-icon>
              {{ 'reports.hub.csv.action' | transloco }}
            </a>
          </mat-card-actions>
        </mat-card>

        <mat-card class="report-card">
          <mat-card-content>
            <div class="card-icon">
              <mat-icon>picture_as_pdf</mat-icon>
            </div>
            <h3>{{ 'reports.hub.pdf.title' | transloco }}</h3>
            <p>{{ 'reports.hub.pdf.description' | transloco }}</p>
          </mat-card-content>
          <mat-card-actions>
            <a mat-raised-button color="accent" routerLink="/reports/profitability-pdf">
              <mat-icon>picture_as_pdf</mat-icon>
              {{ 'reports.hub.pdf.action' | transloco }}
            </a>
          </mat-card-actions>
        </mat-card>

        <mat-card class="report-card">
          <mat-card-content>
            <div class="card-icon">
              <mat-icon>schedule</mat-icon>
            </div>
            <h3>{{ 'reports.hub.async.title' | transloco }}</h3>
            <p>{{ 'reports.hub.async.description' | transloco }}</p>
          </mat-card-content>
          <mat-card-actions>
            <a mat-raised-button routerLink="/reports/async">
              <mat-icon>cloud_queue</mat-icon>
              {{ 'reports.hub.async.action' | transloco }}
            </a>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .hub-container { max-width: 900px; margin: 0 auto; padding: 16px; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; margin-top: 20px; }
    .report-card { display: flex; flex-direction: column; }
    .card-icon { margin-bottom: 12px; }
    .card-icon mat-icon { font-size: 40px; width: 40px; height: 40px; color: #1976d2; }
    h3 { margin: 0 0 8px; font-size: 1.1rem; }
    p { color: #555; font-size: 0.9rem; margin: 0; }
    mat-card-actions { margin-top: auto; padding: 8px 16px 16px; }
    mat-card-content { flex: 1; }
  `]
})
export class ReportHubComponent {}
