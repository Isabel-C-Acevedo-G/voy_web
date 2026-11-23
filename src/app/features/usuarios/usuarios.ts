import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Rol } from '../../core/models/rol.model';
import { EstadoUsuario, Usuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { RolService } from '../../core/services/rol.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { DEFAULT_PAGE_SIZE, Pagination, pageSlice } from '../../shared/pagination/pagination';
import { ListPage } from '../../shared/list-page/list-page';

@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule, DatePipe, Pagination, ListPage],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  host: { class: 'block h-full min-h-0' },
})
export class Usuarios implements OnInit {
  private readonly usuariosApi = inject(UsuarioService);
  private readonly rolesApi = inject(RolService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Usuario[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly pageItems = computed(() => pageSlice(this.items(), this.page(), this.pageSize));
  readonly roles = signal<Rol[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    nuevoEstado: ['' as EstadoUsuario | ''],
    nuevoRol: [''],
    motivo: ['', [Validators.required, Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    this.rolesApi.list().subscribe({
      next: (list) => this.roles.set(list),
      error: () => this.roles.set([]),
    });
    this.reload();
  }

  rolNombre(idRol: number): string {
    return this.roles().find((r) => r.idRol === idRol)?.nombre ?? String(idRol);
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.usuariosApi.list().subscribe({
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

  openGestion(u: Usuario): void {
    this.selectedId.set(u.idUsuario);
    this.form.reset({
      nuevoEstado: u.estado,
      nuevoRol: String(u.idRol),
      motivo: '',
    });
  }

  cancelGestion(): void {
    this.selectedId.set(null);
  }

  submitGestion(): void {
    this.error.set(null);
    if (this.form.invalid || this.selectedId() == null) {
      this.form.markAllAsTouched();
      return;
    }
    const admin = this.auth.user();
    if (!admin) {
      this.error.set('Sesión no cargada');
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.usuariosApi
      .gestion(this.selectedId()!, {
        nuevoEstado: (raw.nuevoEstado || null) as EstadoUsuario | null,
        nuevoRol: raw.nuevoRol ? Number(raw.nuevoRol) : null,
        motivo: raw.motivo,
        idAdministrador: admin.idUsuario,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.selectedId.set(null);
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
    return 'Error al gestionar usuario';
  }
}
