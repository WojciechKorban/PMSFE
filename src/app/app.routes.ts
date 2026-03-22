import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then(
        m => m.AuthLayoutComponent
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'register/success',
        loadComponent: () =>
          import('./features/auth/register-success/register-success.component').then(m => m.RegisterSuccessComponent),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.component').then(
            m => m.VerifyEmailComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            m => m.ForgotPasswordComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            m => m.ResetPasswordComponent
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        m => m.VerifyEmailComponent
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        m => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            m => m.DashboardComponent
          ),
      },
      {
        path: 'tenants',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/tenants/tenant-list/tenant-list.component').then(
                m => m.TenantListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/tenants/tenant-form/tenant-form.component').then(
                m => m.TenantFormComponent
              ),
          },
          {
            path: ':tenantId',
            loadComponent: () =>
              import('./features/tenants/tenant-detail/tenant-detail.component').then(
                m => m.TenantDetailComponent
              ),
          },
          {
            path: ':tenantId/edit',
            loadComponent: () =>
              import('./features/tenants/tenant-form/tenant-form.component').then(
                m => m.TenantFormComponent
              ),
          },
        ],
      },
      {
        path: 'properties',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/properties/property-list/property-list.component').then(
                m => m.PropertyListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/properties/property-form/property-form.component').then(
                m => m.PropertyFormComponent
              ),
          },
          {
            path: ':propertyId/edit',
            loadComponent: () =>
              import('./features/properties/property-form/property-form.component').then(
                m => m.PropertyFormComponent
              ),
          },
          {
            path: ':propertyId',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/properties/property-detail/property-detail.component').then(
                    m => m.PropertyDetailComponent
                  ),
              },
              {
                path: 'contracts/new',
                loadComponent: () =>
                  import('./features/contracts/contract-form/contract-form.component').then(
                    m => m.ContractFormComponent
                  ),
              },
              {
                path: 'contracts/:contractId',
                loadComponent: () =>
                  import('./features/contracts/contract-detail/contract-detail.component').then(
                    m => m.ContractDetailComponent
                  ),
              },
              {
                path: 'profitability',
                loadComponent: () =>
                  import('./features/reports/profitability-dashboard/profitability-dashboard.component').then(
                    m => m.ProfitabilityDashboardComponent
                  ),
              },
              {
                path: 'meters',
                children: [
                  {
                    path: '',
                    loadComponent: () =>
                      import('./features/meters/meter-list/meter-list.component').then(
                        m => m.MeterListComponent
                      ),
                  },
                  {
                    path: 'new',
                    loadComponent: () =>
                      import('./features/meters/meter-form/meter-form.component').then(
                        m => m.MeterFormComponent
                      ),
                  },
                  {
                    path: ':meterId',
                    loadComponent: () =>
                      import('./features/meters/meter-detail/meter-detail.component').then(
                        m => m.MeterDetailComponent
                      ),
                  },
                  {
                    path: ':meterId/edit',
                    loadComponent: () =>
                      import('./features/meters/meter-form/meter-form.component').then(
                        m => m.MeterFormComponent
                      ),
                  },
                  {
                    path: ':meterId/replace',
                    loadComponent: () =>
                      import('./features/meters/meter-replacement-form/meter-replacement-form.component').then(
                        m => m.MeterReplacementFormComponent
                      ),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'notifications',
        children: [
          {
            path: 'preferences',
            loadComponent: () =>
              import('./features/notifications/notification-preferences/notification-preferences.component').then(
                m => m.NotificationPreferencesComponent
              ),
          },
          {
            path: 'history',
            loadComponent: () =>
              import('./features/notifications/notification-history/notification-history.component').then(
                m => m.NotificationHistoryComponent
              ),
          },
        ],
      },
      {
        path: 'reports',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/reports/report-hub/report-hub.component').then(
                m => m.ReportHubComponent
              ),
          },
          {
            path: 'meter-readings',
            loadComponent: () =>
              import('./features/reports/csv-download/csv-download.component').then(
                m => m.CsvDownloadComponent
              ),
          },
          {
            path: 'async',
            loadComponent: () =>
              import('./features/reports/async-report/async-report.component').then(
                m => m.AsyncReportComponent
              ),
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: 'language',
            loadComponent: () =>
              import('./features/settings/language-settings/language-settings.component').then(
                m => m.LanguageSettingsComponent
              ),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('./features/settings/profile-settings/profile-settings.component').then(
                m => m.ProfileSettingsComponent
              ),
          },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/admin-dashboard/admin-dashboard.component').then(
                m => m.AdminDashboardComponent
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/admin-user-list/admin-user-list.component').then(
                m => m.AdminUserListComponent
              ),
          },
          {
            path: 'users/:userId',
            loadComponent: () =>
              import('./features/admin/admin-user-detail/admin-user-detail.component').then(
                m => m.AdminUserDetailComponent
              ),
          },
          {
            path: 'audit-log',
            loadComponent: () =>
              import('./features/admin/admin-audit-log/admin-audit-log.component').then(
                m => m.AdminAuditLogComponent
              ),
          },
          {
            path: 'properties',
            loadComponent: () =>
              import('./features/admin/admin-property-list/admin-property-list.component').then(
                m => m.AdminPropertyListComponent
              ),
          },
          {
            path: 'system',
            loadComponent: () =>
              import('./features/admin/admin-system-health/admin-system-health.component').then(
                m => m.AdminSystemHealthComponent
              ),
          },
        ],
      },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
