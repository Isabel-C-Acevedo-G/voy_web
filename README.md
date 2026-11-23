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
| `npm start` | `ng serve` (desarrollo) |
| `npm run build` | build producción |

## Git

Trabajo en `develop`; entrega en `main` con tag **`v1.0.0`**.  
Tags intermedios: `v0.1` … `v1.5` (fases del plan).

## Notas

- No hay seeds de datos en este repo.
- Tema visual: Emerald (sin índigo del tutorial de clase).
- JSON de la API en **camelCase**.
