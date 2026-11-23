import { Component, OnInit, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { SystemService } from '../../core/services/system.service';

type ApiStatus = 'loading' | 'online' | 'offline';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly system = inject(SystemService);

  readonly apiUrl = environment.apiUrl;
  readonly status = signal<ApiStatus>('loading');
  readonly message = signal('');
  readonly requestId = signal<string | null>(null);
  readonly processTime = signal<string | null>(null);

  ngOnInit(): void {
    this.system.getRoot().subscribe({
      next: (res) => {
        this.status.set('online');
        this.message.set(res.body?.message ?? '');
        // Solo visibles si voy_api declara expose_headers (aún opcional)
        this.requestId.set(res.headers.get('X-Request-ID'));
        this.processTime.set(res.headers.get('X-Process-Time'));
      },
      error: () => this.status.set('offline'),
    });
  }
}
