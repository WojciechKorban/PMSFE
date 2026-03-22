import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule, TranslocoPipe,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatChipsModule, MatIconModule
  ],
  template: `
    <div class="profile-container">
      <h2>{{ 'settings.profile.title' | transloco }}</h2>

      <mat-card>
        <mat-card-content>
          <div class="field-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'settings.profile.email' | transloco }}</mat-label>
              <input matInput [value]="currentUser()?.email ?? ''" [readonly]="true" />
              <mat-icon matSuffix>lock</mat-icon>
            </mat-form-field>
          </div>

          <div class="roles-section">
            <p class="roles-label">{{ 'settings.profile.roles' | transloco }}</p>
            <mat-chip-set>
              @for (role of currentUser()?.roles ?? []; track role) {
                <mat-chip>
                  {{ 'settings.profile.roleLabel.' + role | transloco }}
                </mat-chip>
              }
            </mat-chip-set>
          </div>

          <div class="info-note">
            <mat-icon>info</mat-icon>
            <p>{{ 'settings.profile.editNote' | transloco }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container { max-width: 600px; margin: 0 auto; padding: 16px; }
    .field-section { margin-bottom: 16px; }
    .full-width { width: 100%; }
    .roles-section { margin-bottom: 20px; }
    .roles-label { font-size: 0.875rem; color: #555; margin-bottom: 8px; font-weight: 500; }
    .info-note { display: flex; align-items: flex-start; gap: 8px; padding: 12px; background: #e3f2fd; border-radius: 4px; }
    .info-note mat-icon { color: #1976d2; flex-shrink: 0; margin-top: 2px; }
    .info-note p { margin: 0; color: #333; font-size: 0.875rem; line-height: 1.4; }
  `]
})
export class ProfileSettingsComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
}
