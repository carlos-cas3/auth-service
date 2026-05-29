# Auth Service

Microservicio de autenticación y administración de usuarios con Supabase.

Roles: **SUPER_ADMIN** (acceso completo) y **VENDOR_ADMIN** (registro público, pendiente de aprobación).

## Tecnologías

- Express 5 + Supabase (auth + DB)
- CommonJS, JWT, bcrypt, Joi

## Comandos

```bash
npm start       # producción
npm run dev     # desarrollo con nodemon
```

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Registro de VENDOR_ADMIN |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| GET | `/api/admin/users/pending` | Lista usuarios pendientes |
| PATCH | `/api/admin/users/{id}/approve` | Aprobar usuario |
| PATCH | `/api/admin/users/{id}/status` | Cambiar estado |
| GET | `/api/admin/vendors/{vendor_id}/user` | Buscar usuario por vendor |

Ver la especificación completa en [`docs/openapi.yaml`](docs/openapi.yaml).
