import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Bicicleta, TipoBicicleta } from '../../core/models/bicicleta.model';
import { AuthService } from '../../core/services/auth.service';
import { BicicletaService } from '../../core/services/bicicleta.service';

@Component({
  selector: 'app-bicicletas',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './bicicletas.html',
  styleUrl: './bicicletas.css',
})
export class Bicicletas implements OnInit {
  private readonly bicicletasApi = inject(BicicletaService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Bicicleta[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly isAdmin = computed(() => this.auth.rol() === 'administrador');

  readonly tipos: TipoBicicleta[] = ['urbana', 'montaña', 'ruta', 'eléctrica', 'otra'];

  readonly form = this.fb.nonNullable.group({
    marca: ['', [Validators.required, Validators.maxLength(50)]],
    modelo: ['', [Validators.required, Validators.maxLength(50)]],
    color: ['', [Validators.required, Validators.maxLength(50)]],
    tipo: ['' as TipoBicicleta | ''],
    numeroSerie: ['', [Validators.required, Validators.maxLength(40)]],
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    const loadList = (idPropietario?: number) => {
      this.bicicletasApi.list(idPropietario != null ? { idPropietario } : undefined).subscribe({
        next: (list) => {
          this.items.set(list);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(this.errMsg(err));
        },
      });
    };

    if (this.isAdmin()) {
      loadList();
      return;
    }

    const user = this.auth.user();
    if (user) {
      loadList(user.idUsuario);
      return;
    }

    this.auth.me().subscribe({
      next: (u) => loadList(u.idUsuario),
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el usuario');
      },
    });
  }

  toggleEstado(b: Bicicleta): void {
    if (!this.isAdmin()) {
      return;
    }
    const next = b.estado === 'activa' ? 'inactiva' : 'activa';
    this.bicicletasApi.updateEstado(b.idBicicleta, next).subscribe({
      next: () => this.reload(),
      error: (err: HttpErrorResponse) => this.error.set(this.errMsg(err)),
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      marca: '',
      modelo: '',
      color: '',
      tipo: '',
      numeroSerie: '',
    });
  }

  startEdit(b: Bicicleta): void {
    this.editingId.set(b.idBicicleta);
    this.form.patchValue({
      marca: b.marca,
      modelo: b.modelo,
      color: b.color,
      tipo: b.tipo ?? '',
      numeroSerie: b.numeroSerie,
    });
    this.form.controls.numeroSerie.disable();
  }

  cancelForm(): void {
    this.editingId.set(null);
    this.form.controls.numeroSerie.enable();
    this.form.reset({
      marca: '',
      modelo: '',
      color: '',
      tipo: '',
      numeroSerie: '',
    });
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

    const raw = this.form.getRawValue();
    const tipo = raw.tipo || null;
    this.saving.set(true);

    const editId = this.editingId();
    if (editId == null) {
      this.bicicletasApi
        .create({
          idPropietario: user.idUsuario,
          marca: raw.marca,
          modelo: raw.modelo,
          color: raw.color,
          tipo,
          numeroSerie: raw.numeroSerie,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.cancelForm();
            this.reload();
          },
          error: (err: HttpErrorResponse) => {
            this.saving.set(false);
            this.error.set(this.errMsg(err));
          },
        });
      return;
    }

    this.bicicletasApi
      .update(editId, {
        marca: raw.marca,
        modelo: raw.modelo,
        color: raw.color,
        tipo,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.cancelForm();
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
    return 'Error al guardar';
  }
}
