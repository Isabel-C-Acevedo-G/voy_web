import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  host: { class: 'block h-full min-h-0 overflow-y-auto' },
})
export class Perfil implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly usuariosApi = inject(UsuarioService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly ok = signal<string | null>(null);
  readonly rol = this.auth.rol;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: [''],
    correo: [{ value: '', disabled: true }],
    documento: [{ value: '', disabled: true }],
    tipoDocumento: [{ value: '', disabled: true }],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const apply = (u: {
      nombre: string;
      telefono: string | null;
      correo: string;
      documento: string;
      tipoDocumento: string;
    }) => {
      this.form.patchValue({
        nombre: u.nombre,
        telefono: u.telefono ?? '',
        correo: u.correo,
        documento: u.documento,
        tipoDocumento: u.tipoDocumento,
      });
      this.loading.set(false);
    };

    const user = this.auth.user();
    if (user) {
      apply(user);
      return;
    }

    this.auth.me().subscribe({
      next: (u) => apply(u),
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el perfil');
      },
    });
  }

  submit(): void {
    this.error.set(null);
    this.ok.set(null);
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
    this.saving.set(true);
    this.usuariosApi
      .update(user.idUsuario, {
        nombre: raw.nombre,
        telefono: raw.telefono || null,
      })
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.ok.set('Perfil actualizado');
          // refresca signal de auth
          this.auth.me().subscribe({ error: () => undefined });
          this.form.patchValue({
            nombre: updated.nombre,
            telefono: updated.telefono ?? '',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          const detail = err.error?.detail;
          this.error.set(
            typeof detail === 'string'
              ? detail
              : Array.isArray(detail)
                ? detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(' · ')
                : 'No se pudo guardar',
          );
        },
      });
  }
}
