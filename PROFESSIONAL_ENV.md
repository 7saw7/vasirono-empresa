# Vasirono Empresa - entorno profesional sin DATABASE_URL

Este panel no consulta Supabase/Postgres ni microservicios directamente desde
Vercel. Todas las rutas del panel consumen los servicios mediante el
Worker/Gateway, que es la única capa autorizada para resolver identidad,
permisos, rate limiting y trazabilidad.

## Producción (Vercel)

Configura una sola URL privada del lado servidor:

```env
API_GATEWAY_URL=https://api.vasirono.com
```

No agregues `/api` al final. En producción, las variables
`*_SERVICE_URL` y `*_SERVICE_INTERNAL_URL` se ignoran deliberadamente para
impedir que una configuración antigua eluda el Gateway.

El panel tampoco envía cabeceras `x-user-*`, `x-company-*` o permisos
calculados localmente cuando usa el Gateway. La identidad se deriva del token
y se firma en la infraestructura de confianza.

## Desarrollo local con acceso directo (excepcional)

El acceso directo solo está disponible fuera de producción y requiere un
opt-in explícito:

```env
ALLOW_DIRECT_SERVICE_CALLS=true
COMPANIES_SERVICE_URL=http://localhost:3002
```

No uses `ALLOW_DIRECT_SERVICE_CALLS` en Vercel ni en producción.

## Upstash Redis

Se aceptan las variables generadas por Vercel/Upstash:

```env
UPSTASH_REDIS_REST_KV_REST_API_URL=
UPSTASH_REDIS_REST_KV_REST_API_TOKEN=
```

También se aceptan los alias `UPSTASH_REDIS_REST_URL` y
`UPSTASH_REDIS_REST_TOKEN`.

## DATABASE_URL

No debe existir para este panel. Si vuelve a aparecer un error de
`DATABASE_URL`, una ruta está intentando acceder directamente a la base de
datos y debe considerarse un fallo de arquitectura.
