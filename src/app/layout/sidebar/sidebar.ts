import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { VoyRol } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';

interface NavLink {
  path: string;
  label: string;
  roles?: VoyRol[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly rol = this.auth.rol;
  readonly open = signal(false);

  private readonly allLinks: NavLink[] = [
    { path: '/', label: 'Inicio' },
    { path: '/bicicletas', label: 'Bicicletas' },
    { path: '/reservas', label: 'Reservas', roles: ['ciclista', 'administrador'] },
    { path: '/perfil', label: 'Mi perfil' },
    { path: '/espacios', label: 'Espacios' },
    { path: '/ingresos', label: 'Ingresos', roles: ['administrador', 'vigilante'] },
    { path: '/salidas', label: 'Salidas', roles: ['administrador', 'vigilante'] },
    { path: '/incidentes', label: 'Incidentes', roles: ['administrador', 'vigilante'] },
    { path: '/notas', label: 'Notas', roles: ['administrador', 'vigilante'] },
    { path: '/usuarios', label: 'Usuarios', roles: ['administrador'] },
    { path: '/reportes', label: 'Reportes', roles: ['administrador'] },
  ];

  readonly links = computed(() => {
    const rol = this.rol();
    return this.allLinks.filter((link) => {
      if (!link.roles?.length) {
        return true;
      }
      return !!rol && link.roles.includes(rol as VoyRol);
    });
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.open.set(false));
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
