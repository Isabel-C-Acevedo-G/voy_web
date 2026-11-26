import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Espacio } from '../../core/models/espacio.model';
import { Reserva } from '../../core/models/reserva.model';
import { AuthService } from '../../core/services/auth.service';
import { EspacioService } from '../../core/services/espacio.service';
import { ReservaService } from '../../core/services/reserva.service';
import { minutosRestantesHasta, parseApiDateTime } from '../../core/utils/api-datetime';
import { DEFAULT_PAGE_SIZE, Pagination, pageSlice } from '../../shared/pagination/pagination';
import { FormListPage } from '../../shared/form-list-page/form-list-page';

@Component({
  selector: 'app-reservas',
  imports: [ReactiveFormsModule, DatePipe, Pagination, FormListPage],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
  host: { class: 'block h-full min-h-0' },
})
export class Reservas implements OnInit {
  private readonly reservasApi = inject(ReservaService);
  private readonly espaciosApi = inject(EspacioService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Reserva[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly pageItems = computed(() => pageSlice(this.items(), this.page(), this.pageSize));
  readonly libres = signal<Espacio[]>([]);
  readonly espacios = signal<Espacio[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  readonly now = signal(Date.now());

  readonly form = this.fb.nonNullable.group({
    idEspacio: ['', Validators.required],
  });

  ngOnInit(): void {
    this.espaciosApi.list().subscribe({
      next: (list) => this.espacios.set(list),
      error: () => this.espacios.set([]),
    });
    this.reload();
    // refresca “vence en…” cada 30s
    setInterval(() => this.now.set(Date.now()), 30_000);
  }

  labelEspacio(id: number): string {
    return this.espacios().find((e) => e.idEspacio === id)?.codigo ?? `#${id}`;
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    const run = (idUsuario: number) => {
      this.reservasApi.list({ idUsuario }).subscribe({
        next: (list) => {
          this.items.set(list);
          this.page.set(1);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(this.errMsg(err));
        },
      });
      this.espaciosApi.list({ estado: 'libre', activo: true }).subscribe({
        next: (list) => this.libres.set(list),
        error: () => this.libres.set([]),
      });
    };

    const user = this.auth.user();
    if (user) {
      run(user.idUsuario);
    } else {
      this.auth.me().subscribe({
        next: (u) => run(u.idUsuario),
        error: () => {
          this.loading.set(false);
          this.error.set('No se pudo cargar el usuario');
        },
      });
    }
  }

  /** Normaliza ISO naive del API como UTC (para DatePipe y “Quedan”). */
  asDate(iso: string): Date {
    return parseApiDateTime(iso);
  }

  minutosRestantes(expiraIso: string): number {
    // Lee this.now() para re-evaluar cuando el tick de 30s actualiza la señal.
    return minutosRestantesHasta(expiraIso, this.now());
  }

  estaPorVencer(r: Reserva): boolean {
    return r.estado === 'activa' && this.minutosRestantes(r.fechaExpiracion) <= 5;
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.auth.user();
    if (!user) {
      this.error.set('Sesión no cargada');
      return;
    }

    const idEspacio = Number(this.form.controls.idEspacio.value);
    if (!idEspacio) {
      this.error.set('Selecciona un espacio');
      return;
    }

    this.saving.set(true);
    this.reservasApi.create(idEspacio, user.idUsuario).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset({ idEspacio: '' });
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(this.errMsg(err));
      },
    });
  }

  cancelar(r: Reserva): void {
    if (r.estado !== 'activa') {
      return;
    }
    this.reservasApi.cancelar(r.idReserva).subscribe({
      next: () => this.reload(),
      error: (err: HttpErrorResponse) => this.error.set(this.errMsg(err)),
    });
  }

  private errMsg(err: HttpErrorResponse): string {
    const detail = err.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(' · ');
    }
    return 'Error en reservas';
  }
}
