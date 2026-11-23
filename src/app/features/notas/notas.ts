import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Nota, TipoMovimiento } from '../../core/models/nota.model';
import { AuthService } from '../../core/services/auth.service';
import { NotaService } from '../../core/services/nota.service';
import { DEFAULT_PAGE_SIZE, Pagination, pageSlice } from '../../shared/pagination/pagination';
import { ListPage } from '../../shared/list-page/list-page';

@Component({
  selector: 'app-notas',
  imports: [ReactiveFormsModule, DatePipe, Pagination, ListPage],
  templateUrl: './notas.html',
  styleUrl: './notas.css',
  host: { class: 'block h-full min-h-0' },
})
export class Notas implements OnInit {
  private readonly notasApi = inject(NotaService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Nota[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly pageItems = computed(() => pageSlice(this.items(), this.page(), this.pageSize));
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAdmin = computed(() => this.auth.rol() === 'administrador');

  readonly filtros = this.fb.nonNullable.group({
    tipoMovimiento: ['' as TipoMovimiento | ''],
    idMovimiento: [''],
  });

  readonly createForm = this.fb.nonNullable.group({
    tipoMovimiento: ['ingreso' as TipoMovimiento, Validators.required],
    idMovimiento: ['', Validators.required],
    texto: ['', [Validators.required, Validators.maxLength(300)]],
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
          this.page.set(1);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(this.errMsg(err, 'No se pudieron cargar las notas'));
        },
      });
  }

  submitCreate(): void {
    if (!this.isAdmin()) {
      return;
    }
    this.error.set(null);
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const admin = this.auth.user();
    if (!admin) {
      this.error.set('Sesión no cargada');
      return;
    }
    const raw = this.createForm.getRawValue();
    this.saving.set(true);
    this.notasApi
      .create({
        tipoMovimiento: raw.tipoMovimiento,
        idMovimiento: Number(raw.idMovimiento),
        texto: raw.texto,
        idAdministrador: admin.idUsuario,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.createForm.reset({
            tipoMovimiento: 'ingreso',
            idMovimiento: '',
            texto: '',
          });
          this.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(this.errMsg(err, 'No se pudo crear la nota'));
        },
      });
  }

  private errMsg(err: HttpErrorResponse, fallback: string): string {
    const detail = err.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(' · ');
    }
    return fallback;
  }
}
