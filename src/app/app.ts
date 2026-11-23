import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { AlertService } from './core/services/alert.service';
import { Sidebar } from './layout/sidebar/sidebar';
import { Alert } from './shared/alert/alert';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Alert],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);

  readonly showShell = signal(true);

  ngOnInit(): void {
    this.auth.restoreSession();
    this.syncShell(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncShell(e.urlAfterRedirects));

    // Muestra flash de logout/sesión en toast Emerald
    const flash = this.auth.flash();
    if (flash) {
      this.alerts.warning(flash);
      this.auth.clearFlash();
    }
  }

  private syncShell(url: string): void {
    const path = url.split('?')[0];
    this.showShell.set(path !== '/login' && path !== '/register');
  }
}
