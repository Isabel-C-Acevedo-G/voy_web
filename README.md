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
| `src/environments/environment.ts` | `ng build` / Vercel | placeholder HTTPS de la API |

`angular.json` solo reemplaza el environment en **development**; producción usa `environment.ts` tal cual.

### API URL en producción (Vercel)

Hasta que exista el deploy de `voy_api` (Fase 3), el placeholder es:

`https://voy-api-PLACEHOLDER.vercel.app`

**Cómo setearla en Fase 4** (elige una):

1. **Editar y commit** (simple): en `src/environments/environment.ts`, cambia `apiUrl` a la URL HTTPS real de la API (p. ej. `https://voy-api-xxxx.vercel.app`) y vuelve a desplegar el frontend.
2. **Sin tocar el repo en cada preview**: en el proyecto Vercel de `voy_web`, define la variable de entorno de build `VOY_API_URL` con esa URL; en el *Build Command* usa algo como:
   ```bash
   node -e "const fs=require('fs');const u=process.env.VOY_API_URL;if(!u){console.error('Falta VOY_API_URL');process.exit(1);}const p='src/environments/environment.ts';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace(/apiUrl:\\s*'[^']*'/,\"apiUrl: '\"+u+\"'\"));" && npm run build
   ```
   (Sustituye el `apiUrl` del placeholder justo antes del build.)

`vercel.json` fija: build `npm run build`, output `dist/voy_web/browser`, rewrite SPA → `index.html`.

## Git

Trabajo en `develop`; entrega en `main` con tag **`v1.0.0`**.  
Tags intermedios: `v0.1` … `v1.5` (fases del plan).

## Notas

- No hay seeds de datos en este repo.
- Tema visual: Emerald (sin índigo del tutorial de clase).
- JSON de la API en **camelCase**.
- UI solo del rol actual (RBAC); sin banners “solo admin” a otros perfiles.
