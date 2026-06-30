# Web Empresa — Activación por invitación aprobada

Este `src` deja la web empresa alineada al flujo profesional de Vasirono:

```txt
Web pública → reclamo/registro → panel admin → aprobación por canal oficial o visita presencial → invitación → web empresa /activar-cuenta?token=...
```

## Regla de seguridad

La web empresa no permite registro libre. La creación de credenciales solo ocurre desde:

```txt
/activar-cuenta?token=<token_opaco_de_business_invitations>
```

El token se valida contra `auth-service` mediante:

```http
GET /api/auth/business-invitations/preview?token=...
POST /api/auth/business-invitations/accept
```

La aceptación debe inutilizar el token en backend marcando la invitación como `accepted`. Esta responsabilidad vive en `auth-service`.

## Rutas agregadas

```txt
/activar-cuenta?token=...
/invitacion-expirada
/api/auth/business-invitations/preview
/api/auth/business-invitations/accept
```

## Rutas modificadas

```txt
/login
/
```

El login ahora deja claro que no existe registro libre de empresas y redirige a la web pública para iniciar el filtro.

## Correspondencia de ENVs

### Web empresa / Next.js

```env
# URL interna del auth-service desde la web empresa.
AUTH_SERVICE_URL=http://auth-service.vasirono.svc.cluster.local:3002
# Alias soportado si tu deployment ya lo usa.
AUTH_SERVICE_INTERNAL_URL=http://auth-service.vasirono.svc.cluster.local:3002

# URL pública del panel empresa para sitemap y enlaces públicos.
NEXT_PUBLIC_COMPANY_PANEL_URL=https://panel.vasirono.com

# URL donde empieza el filtro profesional: buscar/reclamar/registrar negocio.
NEXT_PUBLIC_PUBLIC_BUSINESS_ONBOARDING_URL=https://www.vasirono.com/negocios
# Alias soportados por compatibilidad.
NEXT_PUBLIC_BUSINESS_ONBOARDING_URL=https://www.vasirono.com/negocios
NEXT_PUBLIC_PUBLIC_WEB_BUSINESS_ONBOARDING_URL=https://www.vasirono.com/negocios

# Cookies de sesión compartidas con auth-service.
AUTH_SESSION_COOKIE_NAME=vasirono_auth_session
AUTH_REFRESH_COOKIE_NAME=vasirono_auth_refresh
AUTH_COOKIE_DOMAIN=.vasirono.com
AUTH_COOKIE_SAME_SITE=lax
AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS=2592000
```

### Auth-service

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
INTERNAL_SERVICE_TOKEN=...
NOTIFICATIONS_SERVICE_URL=http://notifications-service.vasirono.svc.cluster.local:3009
AUTH_PASSWORD_RESET_URL=https://panel.vasirono.com/recuperar-clave
AUTH_EMAIL_VERIFY_URL=https://app.vasirono.com/verificar-correo
AUTH_SESSION_COOKIE_NAME=vasirono_auth_session
AUTH_COOKIE_DOMAIN=.vasirono.com
AUTH_COOKIE_SAME_SITE=lax
AUTH_SESSION_TTL_DAYS=30
AUTH_SESSION_TOKEN_BYTES=48
REFRESH_TOKEN_TTL_DAYS=30
```

### Verifications-service

```env
# Debe apuntar a la ruta de activación de la web empresa.
BUSINESS_INVITATION_BASE_URL=https://panel.vasirono.com
BUSINESS_INVITATION_ACCEPT_PATH=/activar-cuenta

NOTIFICATIONS_SERVICE_URL=http://notifications-service.vasirono.svc.cluster.local:3009
NOTIFICATIONS_INTERNAL_TOKEN=...
```

### Notifications-service

```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Vasirono <no-reply@vasirono.com>
WHATSAPP_PROVIDER=manual_link
```

## Comportamiento de activación

### Nuevo usuario empresa

```txt
1. Usuario abre /activar-cuenta?token=...
2. La web llama preview.
3. Si el token está pendiente y vigente, muestra el negocio/local aprobado.
4. Usuario crea contraseña.
5. La web llama accept.
6. Auth-service crea usuario/credenciales, vincula company_users/branch_staff e inutiliza token.
7. La web guarda cookies de sesión y redirige a /dashboard.
```

### Correo con cuenta existente

```txt
1. Preview indica requiresExistingLogin=true.
2. La web solicita contraseña actual.
3. Accept valida y vincula la invitación al usuario existente.
4. Si hay sesión, redirige a /dashboard; si no, redirige a /login.
```

## Validación realizada

Se validó sintaxis por transpilación TypeScript de los archivos `.ts/.tsx` del `src`:

```txt
176 archivos revisados
0 errores de transpilación
```

El build completo debe ejecutarse en el monorepo real con dependencias instaladas:

```bash
npm run build
```
