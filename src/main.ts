import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Apply saved theme before app loads to prevent flash
const savedTheme = localStorage.getItem('pms_theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('theme-dark');
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
