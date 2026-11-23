import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Bicicleta } from '../../core/models/bicicleta.model';
import { Ingreso } from '../../core/models/ingreso.model';
import { AuthService } from '../../core/services/auth.service';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { IngresoService } from '../../core/services/ingreso.service';

@Component({
  selector: 'app-ingresos',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './ingresos.html',
  styleUrl: './ingresos.css',
})
export class Ingresos implements OnInit {
  private readonly ingresosApi = inject(IngresoService);
  private readonly bicicletasApi = inject(BicicletaService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Ingreso[]>([]);
  readonly bicicletas = signal<Bicicleta[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly lastCreated = signal<Ingreso | null>(null);

  readonly form = this.fb.nonNullable.group({
    idBicicleta: ['', Validators.required],
    idReserva: [''],
    observaciones: [''],
  });

  ngOnInit(): void {
    this.reload();
    this.bicicletasApi.list({ estado: 'activa' }).subscribe({
      next: (list) => this.bicicletas.set(list),
      error: () => this.bicicletas.set([]),
    });
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ingresosApi.list().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.errMsg(err));
      },
    });
  }

  submit(): void {
    this.error.set(null);
    this.lastCreated.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.auth.user();
    if (!user) {
      this.error.set('Sesión no cargada');
      return;
    }

    const raw = this.form.getRawValue();
    const idReserva = raw.idReserva ? Number(raw.idReserva) : null;
    this.saving.set(true);

    this.ingresosApi
      .create({
        idBicicleta: Number(raw.idBicicleta),
        idVigilante: user.idUsuario,
        idReserva,
        observaciones: raw.observaciones || null,
      })
      .subscribe({
        next: (ing) => {
          this.saving.set(false);
          this.lastCreated.set(ing);
          this.form.reset({ idBicicleta: '', idReserva: '', observaciones: '' });
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
    return 'Error en ingresos';
  }
}
