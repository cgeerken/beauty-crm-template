# Sanitization Report

## Cambios realizados

- Eliminadas referencias específicas de AI Studio.
- Eliminado `firebase-applet-config.json` con el proyecto Firebase original.
- Eliminados `metadata.json` y `firebase-blueprint.json` por ser artefactos acoplados al origen.
- Reemplazados nombres, teléfonos, Instagram y agenda demo por datos genéricos.
- Reemplazado branding fijo por una marca neutra para plantilla pública.
- Movida la configuración de Firebase a variables de entorno.
- Agregado soporte a `.env` en `server.ts` mediante `dotenv/config`.
- Generalizado el timezone del servidor con `APP_TIMEZONE`.

## Observaciones

- En el zip recibido no había `.env` real ni `node_modules`.
- No apareció historial `.git` dentro del archivo.
- Sí había una configuración web de Firebase y referencias a un app de AI Studio, que fueron removidas del template público.

## Antes de publicar

- Elegí una licencia.
- Revisá si querés dejar el template beauty-specific o abrirlo más a estética general.
- Agregá capturas o un GIF cuando lo quieras mostrar mejor en GitHub.
