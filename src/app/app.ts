import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { signal } from '@angular/core';

import { AuthService } from './core/services/auth.service';
import { Sidebar } from './layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly showShell = signal(true);

  ngOnInit(): void {
    this.auth.restoreSession();
    this.syncShell(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncShell(e.urlAfterRedirects));
  }

  private syncShell(url: string): void {
    const path = url.split('?')[0];
    this.showShell.set(path !== '/login' && path !== '/register');
  }
}
