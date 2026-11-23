import { KeyValuePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TipoReporte } from '../../core/models/reporte.model';
import {
  ReporteJson,
  ReporteMovimientos,
  ReporteOcupacion,
  ReporteService,
  ReporteUsuariosFrecuentes,
} from '../../core/services/reporte.service';
import { DEFAULT_PAGE_SIZE, Pagination, pageSlice } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-reportes',
  imports: [ReactiveFormsModule, KeyValuePipe, Pagination],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  private readonly reportesApi = inject(ReporteService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<ReporteJson | null>(null);
  readonly csvPreview = signal<string | null>(null);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;

  readonly form = this.fb.nonNullable.group({
    tipo: ['ocupacion' as TipoReporte, Validators.required],
    fechaDesde: [this.isoDaysAgo(30), Validators.required],
    fechaHasta: [this.isoToday(), Validators.required],
  });

  readonly ocupacion = computed(() => {
    const d = this.data();
    return d?.tipo === 'ocupacion' ? (d as ReporteOcupacion) : null;
  });

  readonly movimientos = computed(() => {
    const d = this.data();
    return d?.tipo === 'movimientos' ? (d as ReporteMovimientos) : null;
  });

  readonly frecuentes = computed(() => {
    const d = this.data();
    return d?.tipo === 'usuarios_frecuentes' ? (d as ReporteUsuariosFrecuentes) : null;
  });

  readonly frecuentesPage = computed(() => {
    const f = this.frecuentes();
    return f ? pageSlice(f.usuarios, this.page(), this.pageSize) : [];
  });

  readonly maxEstado = computed(() => {
    const o = this.ocupacion();
    if (!o) {
      return 1;
    }
    const vals = Object.values(o.porEstado);
    return Math.max(1, ...vals);
  });

  readonly maxFrecuente = computed(() => {
    const f = this.frecuentes();
    if (!f?.usuarios.length) {
      return 1;
    }
    return Math.max(1, ...f.usuarios.map((u) => u.ingresos));
  });

  generar(): void {
    this.error.set(null);
    this.csvPreview.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.loading.set(true);
    this.reportesApi.getJson(raw.tipo, raw.fechaDesde, raw.fechaHasta).subscribe({
      next: (res) => {
        this.data.set(res);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.data.set(null);
        const detail = err.error?.detail;
        this.error.set(typeof detail === 'string' ? detail : 'No se pudo generar el reporte');
      },
    });
  }

  descargarCsv(): void {
    this.error.set(null);
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    this.reportesApi.getCsv(raw.tipo, raw.fechaDesde, raw.fechaHasta).subscribe({
      next: (res) => {
        const text = res.body ?? '';
        this.csvPreview.set(text);
        const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${raw.tipo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.error.set('No se pudo descargar el CSV'),
    });
  }

  barWidth(value: number, max: number): string {
    return `${Math.round((value / max) * 100)}%`;
  }

  private isoToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isoDaysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }
}
