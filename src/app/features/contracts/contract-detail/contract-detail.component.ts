import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { ContractService } from '../services/contract.service';
import { ContractTerminateDialogComponent } from '../contract-terminate-dialog/contract-terminate-dialog.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslocoPipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule,
    FileUploadComponent,
  ],
  template: `
    <div class="detail-container">
      <div class="detail-header">
        <button mat-icon-button [routerLink]="['/properties', propertyId()]">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2>{{ 'contracts.detail.title' | transloco }}</h2>
      </div>

      @if (contractResource.isLoading()) {
        <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
      } @else if (contractResource.error()) {
        <div class="error">{{ 'common.error.loadFailed' | transloco }}</div>
      } @else if (contractResource.value(); as contract) {
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-row">
                <span class="label">{{ 'contracts.detail.dates' | transloco }}</span>
                <span class="value">
                  {{ contract.startDate | date:'dd.MM.yyyy' }} –
                  {{ contract.endDate ? (contract.endDate | date:'dd.MM.yyyy') : '∞' }}
                </span>
              </div>
              <div class="info-row">
                <span class="label">{{ 'contracts.detail.amount' | transloco }}</span>
                <span class="value">{{ contract.monthlyAmount | number:'1.2-2' }} {{ contract.currency }}/mo</span>
              </div>
              <div class="info-row">
                <span class="label">Status</span>
                <span [class]="'status-chip status-' + contract.status.toLowerCase()">
                  {{ ('contracts.status.' + contract.status) | transloco }}
                </span>
              </div>
              @if (contract.terminatedAt) {
                <div class="info-row">
                  <span class="label">Terminated</span>
                  <span class="value">{{ contract.terminatedAt | date:'dd.MM.yyyy' }}</span>
                </div>
              }
            </div>
          </mat-card-content>
          @if (contract.status === 'ACTIVE') {
            <mat-card-actions>
              <button mat-raised-button color="warn" (click)="terminateContract(contract.id)">
                <mat-icon>cancel</mat-icon>
                {{ 'contracts.terminate.button' | transloco }}
              </button>
            </mat-card-actions>
          }
        </mat-card>

        <!-- Documents section -->
        <mat-card class="docs-card">
          <mat-card-header>
            <mat-card-title>{{ 'contracts.detail.documents' | transloco }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (documentsResource.isLoading()) {
              <mat-spinner diameter="24"></mat-spinner>
            } @else if ((documentsResource.value() ?? []).length === 0) {
              <p class="empty">{{ 'contracts.documents.empty' | transloco }}</p>
            } @else {
              <div class="doc-list">
                @for (doc of documentsResource.value() ?? []; track doc.id) {
                  <div class="doc-item">
                    <div class="doc-info">
                      <mat-icon>description</mat-icon>
                      <div>
                        <div class="doc-name">{{ doc.filename }}</div>
                        <div class="doc-meta">
                          {{ formatSize(doc.sizeBytes) }} · {{ doc.uploadedAt | date:'dd.MM.yyyy' }}
                        </div>
                      </div>
                    </div>
                    <button mat-icon-button (click)="downloadDoc(doc.id)">
                      <mat-icon>download</mat-icon>
                    </button>
                  </div>
                }
              </div>
            }

            <div class="upload-section">
              <p class="upload-label">{{ 'contracts.documents.upload' | transloco }}</p>
              <app-file-upload
                accept="application/pdf,image/jpeg,image/png,image/webp"
                [uploading]="uploading()"
                (fileSelected)="onFileSelected($event)"
              />
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 700px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .detail-header { display: flex; align-items: center; gap: 8px; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .error { color: red; padding: 16px; }
    .info-grid { display: flex; flex-direction: column; gap: 12px; }
    .info-row { display: flex; gap: 16px; align-items: center; }
    .label { font-weight: 600; min-width: 140px; color: var(--mat-sys-on-surface-variant); }
    .value { flex: 1; }
    .status-chip { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-terminated { background: #fce4ec; color: #880e4f; }
    .status-expired { background: #f5f5f5; color: #616161; }
    .doc-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .doc-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #eee; border-radius: 8px; }
    .doc-info { display: flex; align-items: center; gap: 12px; }
    .doc-name { font-weight: 500; }
    .doc-meta { font-size: 0.75rem; color: #666; }
    .empty { color: #999; font-style: italic; }
    .upload-section { margin-top: 16px; }
    .upload-label { font-weight: 500; margin-bottom: 8px; }
    .info-card, .docs-card { margin: 0; }
  `],
})
export class ContractDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private contractService = inject(ContractService);
  private dialog = inject(MatDialog);

  propertyId = signal('');
  contractId = signal<string | null>(null);
  uploading = signal(false);

  contractResource = rxResource({
    params: () => ({ propertyId: this.propertyId(), contractId: this.contractId() }),
    stream: ({ params }) =>
      params.propertyId && params.contractId
        ? this.contractService.getById(params.propertyId, params.contractId)
        : EMPTY,
  });

  documentsResource = rxResource({
    params: () => ({ propertyId: this.propertyId(), contractId: this.contractId() }),
    stream: ({ params }) =>
      params.propertyId && params.contractId
        ? this.contractService.getDocuments(params.propertyId, params.contractId)
        : EMPTY,
  });

  ngOnInit(): void {
    const pid = this.route.snapshot.params['propertyId'];
    const cid = this.route.snapshot.params['contractId'];
    if (pid) this.propertyId.set(pid);
    if (cid) this.contractId.set(cid);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  downloadDoc(docId: string): void {
    this.contractService
      .getDownloadUrl(this.propertyId(), this.contractId()!, docId)
      .subscribe(({ downloadUrl }) => window.open(downloadUrl, '_blank'));
  }

  terminateContract(contractId: string): void {
    const ref = this.dialog.open(ContractTerminateDialogComponent, {
      data: { propertyId: this.propertyId(), contractId },
      width: '400px',
    });
    ref.afterClosed().subscribe((result: boolean) => {
      if (result) this.contractResource.reload();
    });
  }

  onFileSelected(file: File): void {
    const pid = this.propertyId();
    const cid = this.contractId();
    if (!pid || !cid) return;
    this.uploading.set(true);
    this.contractService.uploadDocument(pid, cid, file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.documentsResource.reload();
      },
      error: () => this.uploading.set(false),
    });
  }
}
