import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { VoyRol } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import { NavIcon, NavIconName } from '../../shared/nav-icon/nav-icon';

interface NavLink {
  path: string;
  label: string;
  icon: NavIconName;
  roles?: VoyRol[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NavIcon],
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
    { path: '/', label: 'Inicio', icon: 'home' },
    { path: '/bicicletas', label: 'Bicicletas', icon: 'bike' },
    { path: '/reservas', label: 'Reservas', icon: 'calendar', roles: ['ciclista', 'administrador'] },
    { path: '/perfil', label: 'Mi perfil', icon: 'user' },
    { path: '/espacios', label: 'Espacios', icon: 'grid' },
    { path: '/ingresos', label: 'Ingresos', icon: 'login', roles: ['administrador', 'vigilante'] },
    { path: '/salidas', label: 'Salidas', icon: 'logout', roles: ['administrador', 'vigilante'] },
    {
      path: '/incidentes',
      label: 'Incidentes',
      icon: 'alert',
      roles: ['administrador', 'vigilante'],
    },
    { path: '/notas', label: 'Notas', icon: 'note', roles: ['administrador', 'vigilante'] },
    { path: '/usuarios', label: 'Usuarios', icon: 'users', roles: ['administrador'] },
    { path: '/reportes', label: 'Reportes', icon: 'chart', roles: ['administrador'] },
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
