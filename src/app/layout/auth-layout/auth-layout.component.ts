import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'pms-auth-layout',
  imports: [RouterOutlet, LanguageSwitcherComponent],
  template: `
    <!-- Floating background shapes -->
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>
    <div class="bg-shape bg-shape-3"></div>

    <!-- Language switcher — top right -->
    <div class="page-lang">
      <pms-language-switcher variant="ghost" />
    </div>

    <!-- Centered content area -->
    <div class="page-wrapper">
      <router-outlet />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }

    /* Deep gradient background */
    :host::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: -2;
      background: linear-gradient(135deg,
        #0F172A 0%,
        #1E293B 40%,
        #1E3A8A 75%,
        #1D4ED8 100%
      );
    }

    /* Subtle grid overlay */
    :host::after {
      content: '';
      position: fixed;
      inset: 0;
      z-index: -1;
      opacity: 0.12;
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 59px,
          rgba(255,255,255,0.15) 59px,
          rgba(255,255,255,0.15) 60px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 59px,
          rgba(255,255,255,0.15) 59px,
          rgba(255,255,255,0.15) 60px
        );
    }

    /* Floating blur shapes */
    .bg-shape {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
      pointer-events: none;
      z-index: 0;
      animation: floatShape 8s ease-in-out infinite;
    }

    .bg-shape-1 {
      width: 400px;
      height: 400px;
      background: #3B82F6;
      top: -100px;
      right: -100px;
      animation-delay: 0s;
    }

    .bg-shape-2 {
      width: 300px;
      height: 300px;
      background: #1E40AF;
      bottom: -50px;
      left: -80px;
      animation-delay: -3s;
    }

    .bg-shape-3 {
      width: 200px;
      height: 200px;
      background: #60A5FA;
      top: 40%;
      left: 10%;
      animation-delay: -5s;
    }

    @keyframes floatShape {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }

    /* Language switcher position */
    .page-lang {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100;
    }

    /* Center content */
    .page-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 520px) {
      .page-lang {
        top: 12px;
        right: 12px;
      }
    }
  `],
})
export class AuthLayoutComponent {}
