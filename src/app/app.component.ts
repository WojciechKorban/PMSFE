import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LoadingSpinnerComponent, TranslocoModule],
    template: `
    <pms-loading-spinner />
    <router-outlet />
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class AppComponent {}
