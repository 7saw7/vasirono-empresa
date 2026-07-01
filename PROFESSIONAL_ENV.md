# Vasirono Empresa - entorno profesional sin DATABASE_URL

Este panel ya no debe consultar Supabase/Postgres directo desde Vercel. Las rutas internas del panel consumen los microservicios a través del Worker/Gateway.

Variables recomendadas en Vercel para `vasirono-empresa`:

AUTH_SERVICE_URL=https://api.vasirono.com
COMPANIES_SERVICE_URL=https://api.vasirono.com
VERIFICATIONS_SERVICE_URL=https://api.vasirono.com
BRANCH_SERVICE_URL=https://api.vasirono.com
ANALYTICS_SERVICE_URL=https://api.vasirono.com
REVIEWS_SERVICE_URL=https://api.vasirono.com
NOTIFICATIONS_SERVICE_URL=https://api.vasirono.com
API_GATEWAY_URL=https://api.vasirono.com

No agregues `/api` al final de esas URLs.

Upstash Redis:
El código acepta las variables generadas por Vercel/Upstash:

UPSTASH_REDIS_REST_KV_REST_API_URL
UPSTASH_REDIS_REST_KV_REST_API_TOKEN

También acepta estos alias, si prefieres crearlos manualmente:

UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

DATABASE_URL:
No debe ser necesaria para este panel. Si vuelve a aparecer un error de DATABASE_URL, hay una ruta o feature que todavía está importando acceso directo a base de datos.
