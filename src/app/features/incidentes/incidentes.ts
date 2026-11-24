import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';

import { Bicicleta } from '../../core/models/bicicleta.model';
import { Incidente, TipoIncidente } from '../../core/models/incidente.model';
import { Usuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { IncidenteService } from '../../core/services/incidente.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { FormListPage } from '../../shared/form-list-page/form-list-page';
import { DEFAULT_PAGE_SIZE, Pagination, pageSlice } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-incidentes',
  imports: [ReactiveFormsModule, DatePipe, Pagination, FormListPage],
  templateUrl: './incidentes.html',
  styleUrl: './incidentes.css',
  host: { class: 'block h-full min-h-0' },
})
export class Incidentes implements OnInit {
  private readonly incidentesApi = inject(IncidenteService);
  private readonly bicicletasApi = inject(BicicletaService);
  private readonly usuariosApi = inject(UsuarioService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Incidente[]>([]);
  readonly page = signal(1);
  readonly pageSize = DEFAULT_PAGE_SIZE;
  readonly pageItems = computed(() => pageSlice(this.items(), this.page(), this.pageSize));
  readonly bicicletas = signal<Bicicleta[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly tipos: TipoIncidente[] = ['daño', 'pérdida', 'intento de robo', 'conducta', 'otro'];

  readonly form = this.fb.nonNullable.group({
    tipo: ['daño' as TipoIncidente, Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    idBicicleta: [''],
    idUsuarioInvolucrado: [''],
  });

  ngOnInit(): void {
    this.bicicletasApi
      .list()
      .pipe(catchError(() => of([])))
      .subscribe((list) => this.bicicletas.set(list));
    this.usuariosApi
      .list({ estado: 'activo' })
      .pipe(catchError(() => of([])))
      .subscribe((list) => this.usuarios.set(list));
    this.reload();
  }

  labelBici(b: Bicicleta): string {
    return `${b.marca} · ${b.numeroSerie}`;
  }

  labelUsuario(u: Usuario): string {
    return `${u.nombre} · ${u.correo}`;
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.incidentesApi.list().subscribe({
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
    this.saving.set(true);
    this.incidentesApi
      .create({
        tipo: raw.tipo,
        descripcion: raw.descripcion,
        idBicicleta: raw.idBicicleta ? Number(raw.idBicicleta) : null,
        idUsuarioInvolucrado: raw.idUsuarioInvolucrado
          ? Number(raw.idUsuarioInvolucrado)
          : null,
        idResponsable: user.idUsuario,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.reset({
            tipo: 'daño',
            descripcion: '',
            idBicicleta: '',
            idUsuarioInvolucrado: '',
          });
          this.reload();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(this.errMsg(err));
        },
      });
  }

  cerrar(i: Incidente): void {
    if (i.estado === 'cerrado') {
      return;
    }
    this.incidentesApi.update(i.idIncidente, { estado: 'cerrado' }).subscribe({
      next: () => this.reload(),
      error: (err: HttpErrorResponse) => this.error.set(this.errMsg(err)),
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
    return 'Error en incidentes';
  }
}
