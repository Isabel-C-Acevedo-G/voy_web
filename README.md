# voy_web

Frontend Angular del sistema **VOY** — parqueaderos de bicicletas (Medellín).

Stack: **Angular 22** · **Tailwind CSS v4** · tema **Emerald** (`#10b981`) · JWT contra `voy_api`.

## Requisitos

- Node.js LTS 22+
- Backend `voy_api` en `http://127.0.0.1:8000` (CORS ya incluye `http://localhost:4200`)

## Instalación y arranque

```bash
cd voy_web
npm install
npm start
```

Abre **http://localhost:4200**.

En otra terminal, la API:

```bash
cd voy_api
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

## Roles y pantallas

| Rol | Rutas típicas |
|-----|----------------|
| `ciclista` | `/bicicletas`, `/reservas`, `/perfil`, `/espacios` (lectura) |
| `vigilante` | `/ingresos`, `/salidas`, `/incidentes`, `/notas` (lectura) |
| `administrador` | todo lo anterior + `/usuarios`, `/reportes`, CRUD espacios, alta notas, estado bicicleta |

- Registro público (`/register`) crea **ciclista** (sin selector de rol).
- Vigilante / admin: registrar vía API/Swagger con `idRol` 2 o 3.
- Login: correo o documento + clave → JWT 30 min (`localStorage`).

## Scripts

| Comando | Uso |
|---------|-----|
| `npm start` | `ng serve` (desarrollo → API `http://127.0.0.1:8000`) |
| `npm run build` | build producción (`apiUrl` de `environment.ts`) |

## Environments

| Archivo | Cuándo | `apiUrl` |
|---------|--------|----------|
| `src/environments/environment.development.ts` | `ng serve` (fileReplacements) | `http://127.0.0.1:8000` |
| `src/environments/environment.ts` | `ng build` / Vercel | `https://voy-api.vercel.app` |

`angular.json` solo reemplaza el environment en **development**; producción usa `environment.ts` tal cual.

### API URL en producción (Vercel)

Producción apunta a la API en Vercel:

`https://voy-api.vercel.app`

Para cambiarla: edita `apiUrl` en `src/environments/environment.ts` y vuelve a desplegar el frontend.

`vercel.json` fija: build `npm run build`, output `dist/voy_web/browser`, rewrite SPA → `index.html`.

## Git

Trabajo en `develop`; entrega en `main` con tag **`v1.0.0`**.  
Tags intermedios: `v0.1` … `v1.5` (fases del plan).

## Notas

- No hay seeds de datos en este repo.
- Tema visual: Emerald (sin índigo del tutorial de clase).
- JSON de la API en **camelCase**.
- UI solo del rol actual (RBAC); sin banners “solo admin” a otros perfiles.
