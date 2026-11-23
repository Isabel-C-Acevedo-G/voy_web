import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { TipoDocumento } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
  host: { class: 'block w-full min-h-screen' },
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly tipos: TipoDocumento[] = ['CC', 'TI', 'CE', 'PA'];

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    tipoDocumento: ['CC' as TipoDocumento, Validators.required],
    documento: ['', [Validators.required, Validators.maxLength(20)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [''],
    clave: ['', [Validators.required, Validators.minLength(8)]],
    aceptaTratamientoDatos: [false, Validators.requiredTrue],
  });

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.loading.set(true);

    this.auth
      .register({
        nombre: raw.nombre,
        tipoDocumento: raw.tipoDocumento,
        documento: raw.documento,
        correo: raw.correo,
        telefono: raw.telefono || null,
        clave: raw.clave,
        aceptaTratamientoDatos: raw.aceptaTratamientoDatos,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.auth.setFlash('Cuenta creada. Inicia sesión.');
          void this.router.navigate(['/login']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const detail = err.error?.detail;
          if (typeof detail === 'string') {
            this.error.set(detail);
          } else if (Array.isArray(detail)) {
            this.error.set(detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(' · '));
          } else {
            this.error.set('No se pudo registrar');
          }
        },
      });
  }
}
