import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { Nota, TipoMovimiento } from '../../core/models/nota.model';
import { NotaService } from '../../core/services/nota.service';

@Component({
  selector: 'app-notas',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './notas.html',
  styleUrl: './notas.css',
})
export class Notas implements OnInit {
  private readonly notasApi = inject(NotaService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Nota[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly filtros = this.fb.nonNullable.group({
    tipoMovimiento: ['' as TipoMovimiento | ''],
    idMovimiento: [''],
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const raw = this.filtros.getRawValue();
    this.notasApi
      .list({
        tipoMovimiento: raw.tipoMovimiento || undefined,
        idMovimiento: raw.idMovimiento ? Number(raw.idMovimiento) : undefined,
      })
      .subscribe({
        next: (list) => {
          this.items.set(list);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const detail = err.error?.detail;
          this.error.set(
            typeof detail === 'string' ? detail : 'No se pudieron cargar las notas',
          );
        },
      });
  }
}
