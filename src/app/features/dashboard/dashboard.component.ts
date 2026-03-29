import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as echarts from 'echarts';
import { DashboardService } from './dashboard.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';

type EChartsInstance = ReturnType<typeof echarts.init>;

@Component({
  selector: 'pms-dashboard',
  imports: [TranslocoModule, StatCardComponent, DatePipe, DecimalPipe, RouterLink],
  template: `
    <!-- Alert banner -->
    @if (showAlert()) {
      <div class="alert-banner" role="alert">
        <span class="material-icons alert-icon">warning_amber</span>
        <div class="alert-text">
          <strong>{{ 'dashboard.alert.title' | transloco }}:</strong>
          {{ 'dashboard.alert.expiringContract' | transloco }}
        </div>
        <button class="alert-close" (click)="showAlert.set(false)" [attr.aria-label]="'buttons.close' | transloco">
          <span class="material-icons">close</span>
        </button>
      </div>
    }

    <!-- Page header -->
    <div class="page-header">
      <p class="welcome-greeting">{{ timeGreeting() }}, <strong>{{ userName() }}</strong></p>
      <h1 class="page-title">{{ 'nav.dashboard' | transloco }}</h1>
      <p class="page-subtitle">{{ today | date:'EEEE, d MMMM yyyy':undefined:currentLocale() }}</p>
    </div>

    <!-- Stat cards -->
    <div class="stat-grid">
      <app-stat-card
        class="stat-card-wrapper"
        icon="apartment"
        iconColor="var(--color-primary-600)"
        iconBackground="var(--color-primary-50)"
        [value]="dashboardResource.isLoading() ? null : (dashboardResource.value()?.stats?.propertyCount ?? 0)"
        [label]="'nav.properties' | transloco"
        [isLoading]="dashboardResource.isLoading()"
        accentColor="var(--color-primary-600)"
      />
      <app-stat-card
        class="stat-card-wrapper"
        icon="trending_up"
        iconColor="var(--color-success-600, #16A34A)"
        iconBackground="#F0FDF4"
        [value]="dashboardResource.isLoading() ? null : (dashboardResource.value()?.stats?.revenueThisMonth ?? null)"
        currency="PLN"
        [label]="'dashboard.stats.revenue' | transloco"
        [trend]="dashboardResource.value()?.stats?.revenueTrend ?? null"
        [isLoading]="dashboardResource.isLoading()"
        accentColor="var(--color-success-600)"
      />
      <app-stat-card
        class="stat-card-wrapper"
        icon="trending_down"
        iconColor="var(--color-error-600, #DC2626)"
        iconBackground="#FEF2F2"
        [value]="dashboardResource.isLoading() ? null : (dashboardResource.value()?.stats?.costsThisMonth ?? null)"
        currency="PLN"
        [label]="'dashboard.stats.costs' | transloco"
        [trend]="dashboardResource.value()?.stats?.costsTrend ?? null"
        [isLoading]="dashboardResource.isLoading()"
        accentColor="var(--color-error-600)"
      />
      <app-stat-card
        class="stat-card-wrapper"
        icon="account_balance_wallet"
        iconColor="#7C3AED"
        iconBackground="#F5F3FF"
        [value]="dashboardResource.isLoading() ? null : (dashboardResource.value()?.stats?.profitThisMonth ?? null)"
        currency="PLN"
        [label]="'dashboard.stats.profit' | transloco"
        [trend]="dashboardResource.value()?.stats?.profitTrend ?? null"
        [isLoading]="dashboardResource.isLoading()"
        accentColor="#7C3AED"
        [profitPositive]="(dashboardResource.value()?.stats?.profitThisMonth ?? 0) > 0"
      />
    </div>

    <!-- Dashboard grid -->
    <div class="dashboard-grid">

      <!-- Chart card -->
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title">{{ 'dashboard.chart.title' | transloco }}</div>
          <a class="card-action-link" [routerLink]="['/reports']">{{ 'dashboard.chart.viewFull' | transloco }}</a>
        </div>
        <div class="card-body">
          @if (dashboardResource.isLoading()) {
            <div class="chart-skeleton"></div>
          } @else {
            <div #chartContainer class="chart-container"></div>
          }
        </div>
      </div>

      <!-- Quick actions -->
      <div class="card quick-actions-card">
        <div class="card-header">
          <div class="card-title">{{ 'dashboard.quickActions.title' | transloco }}</div>
        </div>
        <div class="quick-action-list">
          <a class="quick-action-item" [routerLink]="['/properties']">
            <div class="quick-action-icon qa-blue">
              <span class="material-icons">electric_meter</span>
            </div>
            <div class="quick-action-text">
              <div class="quick-action-title">{{ 'dashboard.quickActions.addReading' | transloco }}</div>
              <div class="quick-action-desc">{{ 'dashboard.quickActions.addReadingDesc' | transloco }}</div>
            </div>
            <span class="material-icons arrow">chevron_right</span>
          </a>
          <a class="quick-action-item" [routerLink]="['/properties/new']">
            <div class="quick-action-icon qa-green">
              <span class="material-icons">add_home</span>
            </div>
            <div class="quick-action-text">
              <div class="quick-action-title">{{ 'dashboard.quickActions.addProperty' | transloco }}</div>
              <div class="quick-action-desc">{{ 'dashboard.quickActions.addPropertyDesc' | transloco }}</div>
            </div>
            <span class="material-icons arrow">chevron_right</span>
          </a>
          <a class="quick-action-item" [routerLink]="['/reports']">
            <div class="quick-action-icon qa-purple">
              <span class="material-icons">download</span>
            </div>
            <div class="quick-action-text">
              <div class="quick-action-title">{{ 'dashboard.quickActions.downloadReport' | transloco }}</div>
              <div class="quick-action-desc">{{ 'dashboard.quickActions.downloadReportDesc' | transloco }}</div>
            </div>
            <span class="material-icons arrow">chevron_right</span>
          </a>
        </div>
      </div>

      <!-- Recent readings -->
      <div class="card readings-card">
        <div class="card-header">
          <div class="card-title">{{ 'dashboard.recentReadings.title' | transloco }}</div>
          <a class="card-action-link" [routerLink]="['/properties']">{{ 'dashboard.recentReadings.viewAll' | transloco }}</a>
        </div>
        @if ((dashboardResource.value()?.recentReadings ?? []).length === 0 && !dashboardResource.isLoading()) {
          <div class="empty-readings">
            <span class="material-icons">electric_meter</span>
            <p>{{ 'dashboard.recentReadings.empty' | transloco }}</p>
          </div>
        } @else {
          <div class="reading-list">
            @for (reading of dashboardResource.value()?.recentReadings ?? []; track reading.id) {
              <div class="reading-item">
                <div class="reading-icon" [style.background]="getUtilityBg(reading.utilityType)">
                  <span class="material-icons" [style.color]="getUtilityColor(reading.utilityType)">
                    {{ getUtilityIcon(reading.utilityType) }}
                  </span>
                </div>
                <div class="reading-info">
                  <div class="reading-address">{{ reading.address }}</div>
                  <div class="reading-detail">
                    <span class="dot" [style.background]="getUtilityColor(reading.utilityType)"></span>
                    {{ reading.meterName }}
                  </div>
                </div>
                <div class="reading-value">
                  <div class="reading-amount">{{ reading.value | number:'1.2-2' }} {{ reading.unit }}</div>
                  <div class="reading-date">{{ reading.readingDate | date:'dd.MM.yyyy' }}</div>
                </div>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 0 24px 24px;
    }

    /* ── Alert Banner ── */
    .alert-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--color-status-warning-bg, #FFFBEB);
      border: 1px solid #FDE68A;
      border-left: 4px solid var(--color-status-warning, #D97706);
      border-radius: 8px;
      margin-bottom: 20px;
      animation: slideInDown 300ms cubic-bezier(0, 0, 0.2, 1) both;
    }

    .alert-icon { color: var(--color-status-warning, #D97706); font-size: 20px; flex-shrink: 0; }

    .alert-text {
      flex: 1;
      font-size: 0.875rem;
      color: var(--color-text-primary);
      strong { font-weight: 600; }
    }

    .alert-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      padding: 2px;
      border-radius: 4px;
      .material-icons { font-size: 16px; }
      &:hover { color: var(--color-text-secondary); }
    }

    /* ── Page Header ── */
    .page-header {
      margin-bottom: 24px;
    }

    .welcome-greeting {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
      strong { color: var(--color-text-primary); font-weight: 600; }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
      margin: 0 0 4px;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    /* ── Stat Grid ── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card-wrapper {
      animation: fadeSlideUp 400ms cubic-bezier(0, 0, 0.2, 1) both;
      &:nth-child(1) { animation-delay: 50ms; }
      &:nth-child(2) { animation-delay: 120ms; }
      &:nth-child(3) { animation-delay: 190ms; }
      &:nth-child(4) { animation-delay: 260ms; }
    }

    /* ── Dashboard Grid ── */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      grid-template-rows: auto auto;
      gap: 20px;
    }

    .card {
      background: var(--color-bg-surface, #ffffff);
      border: 1px solid var(--color-border-default, #E2E8F0);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      animation: fadeSlideUp 400ms cubic-bezier(0, 0, 0.2, 1) both;
      &:nth-child(1) { animation-delay: 350ms; }
      &:nth-child(2) { animation-delay: 420ms; }
      &:nth-child(3) { animation-delay: 500ms; }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border-default, #E2E8F0);
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .card-action-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-interactive-primary, #2563EB);
      text-decoration: none;
      cursor: pointer;
      &:hover { text-decoration: underline; }
    }

    .card-body { padding: 24px; }

    /* ── Chart ── */
    .chart-card { grid-column: 1; }

    .chart-container {
      width: 100%;
      height: 260px;
    }

    .chart-skeleton {
      width: 100%;
      height: 260px;
      background: var(--color-bg-skeleton, #E2E8F0);
      border-radius: 8px;
      animation: shimmer 1.5s infinite;
    }

    /* ── Quick Actions ── */
    .quick-actions-card { grid-column: 2; grid-row: 1 / 3; }

    .quick-action-list { padding: 16px 24px 24px; }

    .quick-action-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      transition: background 200ms;
      margin-bottom: 4px;
      &:hover { background: var(--color-bg-canvas, #F8FAFC); }
      &:hover .arrow { opacity: 1; }
    }

    .quick-action-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .material-icons { font-size: 20px; }
    }

    .qa-blue { background: var(--color-primary-50, #EFF6FF); .material-icons { color: var(--color-primary-600, #2563EB); } }
    .qa-green { background: #F0FDF4; .material-icons { color: var(--color-success-600, #16A34A); } }
    .qa-purple { background: #F5F3FF; .material-icons { color: #7C3AED; } }

    .quick-action-text { flex: 1; min-width: 0; }

    .quick-action-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .quick-action-desc {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    .arrow {
      font-size: 18px;
      color: var(--color-text-muted);
      opacity: 0.5;
      transition: opacity 200ms;
    }

    /* ── Recent Readings ── */
    .readings-card { grid-column: 1; }

    .reading-list {}

    .reading-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 24px;
      border-bottom: 1px solid var(--color-border-default, #E2E8F0);
      &:last-child { border-bottom: none; }
    }

    .reading-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .material-icons { font-size: 20px; }
    }

    .reading-info { flex: 1; min-width: 0; }

    .reading-address {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .reading-detail {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .reading-value { text-align: right; flex-shrink: 0; }

    .reading-amount {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .reading-date {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    .empty-readings {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 24px;
      color: var(--color-text-muted);
      gap: 8px;
      .material-icons { font-size: 40px; opacity: 0.4; }
      p { font-size: 0.875rem; }
    }

    /* ── Animations ── */
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes shimmer {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    /* ── Responsive ── */
    @media (max-width: 1200px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-grid { grid-template-columns: 1fr; }
      .quick-actions-card { grid-column: 1; grid-row: auto; }
    }

    @media (max-width: 640px) {
      :host { padding: 0 16px 16px; }
      .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }
  `],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer?: ElementRef<HTMLDivElement>;

  protected readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly transloco = inject(TranslocoService);
  private readonly languageService = inject(LanguageService);

  readonly today = new Date();
  readonly showAlert = signal(true);

  private chartInstance: EChartsInstance | null = null;

  readonly dashboardResource = rxResource({
    stream: () => this.dashboardService.getDashboardData(),
  });

  constructor() {
    // Initialize chart once loading completes and container is in DOM
    effect(() => {
      if (!this.dashboardResource.isLoading()) {
        // Wait for next paint so @if renders the chart container
        setTimeout(() => this.tryInitChart(), 0);
      }
    });
  }

  readonly userName = computed(() => {
    const email = this.authService.currentUser()?.email ?? '';
    return email.split('@')[0] ?? email;
  });

  readonly currentLocale = computed(() => this.languageService.currentLanguage().code === 'pl' ? 'pl' : 'en-US');

  readonly timeGreeting = computed(() => {
    const hour = new Date().getHours();
    const key = hour < 12 ? 'dashboard.greeting.morning'
               : hour < 18 ? 'dashboard.greeting.afternoon'
               : 'dashboard.greeting.evening';
    return this.transloco.translate(key);
  });

  ngAfterViewInit(): void {
    this.tryInitChart();
  }

  ngOnDestroy(): void {
    this.chartInstance?.dispose();
  }

  /** Called after loading finishes via template binding — no-op if already initialized */
  private tryInitChart(): void {
    if (!this.chartContainer?.nativeElement) return;
    if (this.chartInstance) return;

    this.chartInstance = echarts.init(this.chartContainer.nativeElement, null, { renderer: 'svg' });
    this.renderChart();

    const ro = new ResizeObserver(() => this.chartInstance?.resize());
    ro.observe(this.chartContainer.nativeElement);
  }

  private renderChart(): void {
    if (!this.chartInstance) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94A3B8' : '#475569';
    const gridLineColor = isDark ? '#334155' : '#E2E8F0';

    const lang = this.languageService.currentLanguage().code;
    const months = lang === 'pl'
      ? ['Paź', 'Lis', 'Gru', 'Sty', 'Lut', 'Mar']
      : ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

    const revenueLabel = this.transloco.translate('dashboard.chart.revenue');
    const costsLabel = this.transloco.translate('dashboard.chart.costs');
    const profitLabel = this.transloco.translate('dashboard.chart.profit');

    this.chartInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        borderColor: isDark ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        textStyle: { color: isDark ? '#F1F5F9' : '#0F172A', fontSize: 12, fontFamily: 'Inter, sans-serif' },
      },
      legend: {
        data: [revenueLabel, costsLabel, profitLabel],
        bottom: 0,
        itemHeight: 10,
        itemWidth: 16,
        itemGap: 24,
        textStyle: { color: textColor, fontSize: 12, fontFamily: 'Inter, sans-serif' },
        icon: 'roundRect',
      },
      grid: { left: 0, right: 0, top: 10, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: months,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: gridLineColor } },
        axisLabel: { color: textColor, fontSize: 11, fontFamily: 'Inter, sans-serif' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' } },
        axisLabel: {
          color: textColor,
          fontSize: 11,
          fontFamily: 'Inter, sans-serif',
          formatter: (v: number) => v.toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-US') + (lang === 'pl' ? ' zł' : ' PLN'),
        },
      },
      series: [
        {
          name: revenueLabel,
          type: 'bar',
          barWidth: '22%',
          data: [4100, 4100, 4200, 4300, 4150, 4500],
          itemStyle: { color: '#2563EB', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: costsLabel,
          type: 'bar',
          barWidth: '22%',
          data: [2050, 2200, 2300, 1950, 2040, 2100],
          itemStyle: { color: '#EF4444', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: profitLabel,
          type: 'bar',
          barWidth: '22%',
          data: [2050, 1900, 1900, 2350, 2110, 2400],
          itemStyle: { color: '#16A34A', borderRadius: [4, 4, 0, 0] },
        },
      ],
    });
  }

  getUtilityIcon(type: string): string {
    const map: Record<string, string> = {
      ELECTRICITY: 'bolt',
      GAS: 'local_fire_department',
      WATER_COLD: 'water_drop',
      WATER_HOT: 'water_drop',
      HEAT: 'thermostat',
    };
    return map[type] ?? 'electric_meter';
  }

  getUtilityColor(type: string): string {
    const map: Record<string, string> = {
      ELECTRICITY: 'var(--color-utility-electricity, #F59E0B)',
      GAS: 'var(--color-utility-gas, #F97316)',
      WATER_COLD: 'var(--color-utility-water, #3B82F6)',
      WATER_HOT: 'var(--color-utility-water, #3B82F6)',
      HEAT: 'var(--color-utility-heat, #F87171)',
    };
    return map[type] ?? '#94A3B8';
  }

  getUtilityBg(type: string): string {
    const map: Record<string, string> = {
      ELECTRICITY: 'var(--color-utility-electricity-bg, #FEF3C7)',
      GAS: 'var(--color-utility-gas-bg, #FFEDD5)',
      WATER_COLD: 'var(--color-utility-water-bg, #EFF6FF)',
      WATER_HOT: 'var(--color-utility-water-bg, #EFF6FF)',
      HEAT: 'var(--color-utility-heat-bg, #FEF2F2)',
    };
    return map[type] ?? '#F1F5F9';
  }
}
