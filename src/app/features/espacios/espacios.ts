import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Espacio } from '../../core/models/espacio.model';
import { AuthService } from '../../core/services/auth.service';
import { EspacioService } from '../../core/services/espacio.service';
import { DEFAULT_PAGE_SIZE, Pagination, pageSlice } from '../../shared/pagination/pagination';
import { ListPage } from '../../shared/list-page/list-page';

@Component({
  selector: 'app-espacios',
  imports: [ReactiveFormsModule, DatePipe, Pagination, ListPage],
  templateUrl: './espacios.html',
  styleUrl: './espacios.css',
  host: { class: 'block h-full min-h-0' },
})
export class Espacios implements OnInit {
  private readonly espaciosApi = inject(EspacioService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Espacio[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly pageItems = computed(() => pageSlice(this.items(), this.page(), this.pageSize));
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly isAdmin = computed(() => this.auth.rol() === 'administrador');

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    activo: [true],
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.espaciosApi.list().subscribe({
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
  }

  startCreate(): void {
    this.editingId.set(null);
    this.form.reset({ codigo: '', activo: true });
  }

  startEdit(e: Espacio): void {
    this.editingId.set(e.idEspacio);
    this.form.patchValue({ codigo: e.codigo, activo: e.activo });
  }

  submit(): void {
    if (!this.isAdmin()) {
      return;
    }
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.saving.set(true);
    const id = this.editingId();
    const req =
      id == null
        ? this.espaciosApi.create({ codigo: raw.codigo, activo: raw.activo })
        : this.espaciosApi.update(id, { codigo: raw.codigo, activo: raw.activo });

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.editingId.set(null);
        this.form.reset({ codigo: '', activo: true });
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
    return 'Error en espacios';
  }
}
