import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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

  readonly user = this.auth.user;
  readonly rol = this.auth.rol;

  private readonly allLinks: NavLink[] = [
    { path: '/', label: 'Inicio' },
    { path: '/bicicletas', label: 'Bicicletas' },
    { path: '/reservas', label: 'Reservas', roles: ['ciclista', 'administrador'] },
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

  logout(): void {
    this.auth.logout();
  }
}
