import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { EspacioService } from '../../core/services/espacio.service';
import { IncidenteService } from '../../core/services/incidente.service';
import { IngresoService } from '../../core/services/ingreso.service';
import { ReservaService } from '../../core/services/reserva.service';
import { Loading } from '../../shared/loading/loading';

interface HomeKpis {
  libres: number;
  ocupados: number;
  reservados: number;
  ingresosActivos: number;
  reservasActivas: number;
  incidentesAbiertos: number;
}

interface OnboardingStep {
  title: string;
  detail: string;
  path: string;
  cta: string;
}

@Component({
  selector: 'app-home',
  imports: [Loading, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  host: { class: 'block h-full min-h-0 overflow-y-auto' },
})
export class Home implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly espaciosApi = inject(EspacioService);
  private readonly ingresosApi = inject(IngresoService);
  private readonly reservasApi = inject(ReservaService);
  private readonly incidentesApi = inject(IncidenteService);

  readonly user = this.auth.user;
  readonly rol = this.auth.rol;
  readonly loading = signal(true);

  readonly kpis = signal<HomeKpis>({
    libres: 0,
    ocupados: 0,
    reservados: 0,
    ingresosActivos: 0,
    reservasActivas: 0,
    incidentesAbiertos: 0,
  });

  readonly isAdmin = computed(() => this.rol() === 'administrador');
  readonly isVigilante = computed(() => this.rol() === 'vigilante');
  readonly isCiclista = computed(() => this.rol() === 'ciclista');

  readonly showOperacion = computed(() => this.isAdmin() || this.isVigilante());
  readonly showReservas = computed(() => this.isAdmin() || this.isCiclista());

  readonly steps = computed<OnboardingStep[]>(() => {
    const rol = this.rol();
    if (rol === 'vigilante') {
      return [
        {
          title: 'Registrar ingreso',
          detail: 'Asigna espacio libre a la bicicleta que llega.',
          path: '/ingresos',
          cta: 'Ir a ingresos',
        },
        {
          title: 'Registrar salida',
          detail: 'Verifica marca, color y serie antes de liberar.',
          path: '/salidas',
          cta: 'Ir a salidas',
        },
        {
          title: 'Reportar incidente',
          detail: 'Deja constancia de daños o novedades.',
          path: '/incidentes',
          cta: 'Ir a incidentes',
        },
        {
          title: 'Revisar notas',
          detail: 'Consulta aclaraciones de movimientos.',
          path: '/notas',
          cta: 'Ir a notas',
        },
      ];
    }
    if (rol === 'administrador') {
      return [
        {
          title: 'Gestionar espacios',
          detail: 'Crea y activa códigos del parqueadero.',
          path: '/espacios',
          cta: 'Ir a espacios',
        },
        {
          title: 'Usuarios y roles',
          detail: 'Activa cuentas y ajusta roles con motivo.',
          path: '/usuarios',
          cta: 'Ir a usuarios',
        },
        {
          title: 'Ver reportes',
          detail: 'Ocupación, movimientos y usuarios frecuentes.',
          path: '/reportes',
          cta: 'Ir a reportes',
        },
        {
          title: 'Supervisar operación',
          detail: 'Revisa ingresos activos del día.',
          path: '/ingresos',
          cta: 'Ir a ingresos',
        },
      ];
    }
    return [
      {
        title: 'Registra tu bicicleta',
        detail: 'Marca, color y número de serie.',
        path: '/bicicletas',
        cta: 'Ir a bicicletas',
      },
      {
        title: 'Reserva un espacio',
        detail: 'Elige uno libre; vence en 30 minutos.',
        path: '/reservas',
        cta: 'Ir a reservas',
      },
      {
        title: 'Consulta ocupación',
        detail: 'Mira qué espacios están libres ahora.',
        path: '/espacios',
        cta: 'Ir a espacios',
      },
      {
        title: 'Actualiza tu perfil',
        detail: 'Mantén nombre y teléfono al día.',
        path: '/perfil',
        cta: 'Ir a perfil',
      },
    ];
  });

  ngOnInit(): void {
    const user = this.auth.user();
    const rol = this.auth.rol();

    const espacios$ = this.espaciosApi.list({ activo: true }).pipe(catchError(() => of([])));
    const ingresos$ = this.ingresosApi
      .list({ estado: 'activo' })
      .pipe(catchError(() => of([])));
    const reservas$ =
      rol === 'ciclista' && user
        ? this.reservasApi
            .list({ estado: 'activa', idUsuario: user.idUsuario })
            .pipe(catchError(() => of([])))
        : this.reservasApi.list({ estado: 'activa' }).pipe(catchError(() => of([])));
    const incidentes$ = this.incidentesApi
      .list({ estado: 'abierto' })
      .pipe(catchError(() => of([])));

    forkJoin({
      espacios: espacios$,
      ingresos: ingresos$,
      reservas: reservas$,
      incidentes: incidentes$,
    }).subscribe({
      next: ({ espacios, ingresos, reservas, incidentes }) => {
        this.kpis.set({
          libres: espacios.filter((e) => e.estado === 'libre').length,
          ocupados: espacios.filter((e) => e.estado === 'ocupado').length,
          reservados: espacios.filter((e) => e.estado === 'reservado').length,
          ingresosActivos: ingresos.length,
          reservasActivas: reservas.length,
          incidentesAbiertos: incidentes.length,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
