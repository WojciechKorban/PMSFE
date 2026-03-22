import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="file-upload-container">
      <input
        #fileInput
        type="file"
        [accept]="accept()"
        (change)="onFileSelected($event)"
        style="display:none"
      />
      <button mat-stroked-button (click)="fileInput.click()" [disabled]="uploading()">
        <mat-icon>upload</mat-icon>
        {{ 'meters.photos.upload' | transloco }}
      </button>
      @if (selectedFile()) {
        <span class="filename">{{ selectedFile()!.name }}</span>
        <button mat-icon-button (click)="clearFile()">
          <mat-icon>close</mat-icon>
        </button>
      }
      @if (uploading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }
    </div>
  `,
  styles: [`
    .file-upload-container { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .filename { font-size: 0.875rem; color: #666; }
    mat-progress-bar { width: 100%; }
  `]
})
export class FileUploadComponent {
  accept = input<string>('image/jpeg,image/png,image/webp');
  uploading = input<boolean>(false);

  fileSelected = output<File>();

  selectedFile = signal<File | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.fileSelected.emit(file);
    }
  }

  clearFile(): void {
    this.selectedFile.set(null);
  }
}
