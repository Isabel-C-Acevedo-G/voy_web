import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: { class: 'block w-full min-h-screen' },
})
export class Login implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly flash = this.auth.flash;

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    // flash de logout / sesión expirada
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.loading.set(true);

    this.auth.login(username, password).subscribe({
      next: (res) => {
        this.auth.clearFlash();
        this.auth.me().subscribe({ error: () => undefined });
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const dest = returnUrl || this.auth.homeForRole(res.rol);
        void this.router.navigateByUrl(dest);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const detail = err.error?.detail;
        this.error.set(
          typeof detail === 'string' ? detail : 'Credenciales inválidas o usuario inactivo',
        );
      },
    });
  }
}
