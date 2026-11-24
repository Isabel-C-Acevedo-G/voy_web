import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';

import { Bicicleta } from '../../core/models/bicicleta.model';
import { Espacio } from '../../core/models/espacio.model';
import { Ingreso } from '../../core/models/ingreso.model';
import { Nota, TipoMovimiento } from '../../core/models/nota.model';
import { Salida } from '../../core/models/salida.model';
import { AuthService } from '../../core/services/auth.service';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { EspacioService } from '../../core/services/espacio.service';
import { IngresoService } from '../../core/services/ingreso.service';
import { NotaService } from '../../core/services/nota.service';
import { SalidaService } from '../../core/services/salida.service';
import { DEFAULT_PAGE_SIZE, Pagination, pageSlice } from '../../shared/pagination/pagination';
import { FormListPage } from '../../shared/form-list-page/form-list-page';

export interface MovimientoOption {
  id: number;
  tipo: TipoMovimiento;
  label: string;
}

@Component({
  selector: 'app-notas',
  imports: [ReactiveFormsModule, DatePipe, Pagination, FormListPage],
  templateUrl: './notas.html',
  styleUrl: './notas.css',
  host: { class: 'block h-full min-h-0' },
})
export class Notas implements OnInit {
  private readonly notasApi = inject(NotaService);
  private readonly ingresosApi = inject(IngresoService);
  private readonly salidasApi = inject(SalidaService);
  private readonly bicicletasApi = inject(BicicletaService);
  private readonly espaciosApi = inject(EspacioService);
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

  readonly ingresos = signal<Ingreso[]>([]);
  readonly salidas = signal<Salida[]>([]);
  readonly bicicletas = signal<Bicicleta[]>([]);
  readonly espacios = signal<Espacio[]>([]);

  readonly createMovimientos = computed(() => {
    const tipo = this.createTipo();
    return this.movimientos().filter((m) => m.tipo === tipo);
  });

  readonly filterMovimientos = computed(() => {
    const tipo = this.filterTipo();
    if (!tipo) {
      return this.movimientos();
    }
    return this.movimientos().filter((m) => m.tipo === tipo);
  });

  readonly movimientos = computed(() => {
    const bicis = this.bicicletas();
    const esps = this.espacios();
    const labelBici = (id: number) => {
      const b = bicis.find((x) => x.idBicicleta === id);
      return b ? `${b.marca} · ${b.numeroSerie}` : `bici #${id}`;
    };
    const labelEsp = (id: number) => esps.find((x) => x.idEspacio === id)?.codigo ?? `#${id}`;

    const fromIngresos: MovimientoOption[] = this.ingresos().map((i) => ({
      id: i.idIngreso,
      tipo: 'ingreso' as const,
      label: `Ingreso #${i.idIngreso} · ${labelBici(i.idBicicleta)} · ${labelEsp(i.idEspacio)}`,
    }));
    const fromSalidas: MovimientoOption[] = this.salidas().map((s) => {
      const ing = this.ingresos().find((i) => i.idIngreso === s.idIngreso);
      const extra = ing
        ? ` · ${labelBici(ing.idBicicleta)} · ${labelEsp(ing.idEspacio)}`
        : ` · ingreso #${s.idIngreso}`;
      return {
        id: s.idSalida,
        tipo: 'salida' as const,
        label: `Salida #${s.idSalida}${extra}`,
      };
    });
    return [...fromIngresos, ...fromSalidas];
  });

  private readonly createTipo = signal<TipoMovimiento>('ingreso');
  private readonly filterTipo = signal<TipoMovimiento | ''>('');

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
    this.createForm.controls.tipoMovimiento.valueChanges.subscribe((t) => {
      this.createTipo.set(t);
      this.createForm.controls.idMovimiento.setValue('');
    });
    this.filtros.controls.tipoMovimiento.valueChanges.subscribe((t) => {
      this.filterTipo.set(t);
      this.filtros.controls.idMovimiento.setValue('');
    });

    forkJoin({
      ingresos: this.ingresosApi.list().pipe(catchError(() => of([]))),
      salidas: this.salidasApi.list().pipe(catchError(() => of([]))),
      bicicletas: this.bicicletasApi.list().pipe(catchError(() => of([]))),
      espacios: this.espaciosApi.list().pipe(catchError(() => of([]))),
    }).subscribe(({ ingresos, salidas, bicicletas, espacios }) => {
      this.ingresos.set(ingresos);
      this.salidas.set(salidas);
      this.bicicletas.set(bicicletas);
      this.espacios.set(espacios);
    });

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
          this.createTipo.set('ingreso');
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
