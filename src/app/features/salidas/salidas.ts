import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Ingreso } from '../../core/models/ingreso.model';
import { Salida } from '../../core/models/salida.model';
import { AuthService } from '../../core/services/auth.service';
import { IngresoService } from '../../core/services/ingreso.service';
import { SalidaService } from '../../core/services/salida.service';
import { DEFAULT_PAGE_SIZE, Pagination, pageSlice } from '../../shared/pagination/pagination';
import { ListPage } from '../../shared/list-page/list-page';

@Component({
  selector: 'app-salidas',
  imports: [ReactiveFormsModule, DatePipe, Pagination, ListPage],
  templateUrl: './salidas.html',
  styleUrl: './salidas.css',
  host: { class: 'block h-full min-h-0' },
})
export class Salidas implements OnInit {
  private readonly salidasApi = inject(SalidaService);
  private readonly ingresosApi = inject(IngresoService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Salida[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly pageItems = computed(() => pageSlice(this.items(), this.page(), this.pageSize));
  readonly activos = signal<Ingreso[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly ok = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    idIngreso: ['', Validators.required],
    verificacionMarca: [false, Validators.requiredTrue],
    verificacionColor: [false, Validators.requiredTrue],
    verificacionSerie: [false, Validators.requiredTrue],
    nota: [''],
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.salidasApi.list().subscribe({
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
    this.ingresosApi.list({ estado: 'activo' }).subscribe({
      next: (list) => this.activos.set(list),
      error: () => this.activos.set([]),
    });
  }

  submit(): void {
    this.error.set(null);
    this.ok.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Debes confirmar las tres verificaciones (marca, color y serie)');
      return;
    }
    const user = this.auth.user();
    if (!user) {
      this.error.set('Sesión no cargada');
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);

    this.salidasApi
      .create({
        idIngreso: Number(raw.idIngreso),
        idVigilante: user.idUsuario,
        verificacionMarca: raw.verificacionMarca,
        verificacionColor: raw.verificacionColor,
        verificacionSerie: raw.verificacionSerie,
        nota: raw.nota || null,
      })
      .subscribe({
        next: (s) => {
          this.saving.set(false);
          this.ok.set(
            `Salida #${s.idSalida} OK` +
              (s.duracionMinutos != null ? ` · ${s.duracionMinutos} min` : ''),
          );
          this.form.reset({
            idIngreso: '',
            verificacionMarca: false,
            verificacionColor: false,
            verificacionSerie: false,
            nota: '',
          });
          this.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(this.errMsg(err));
        },
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
    return 'Error en salidas';
  }
}
