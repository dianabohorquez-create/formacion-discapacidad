# Formación en discapacidad · versión Netlify

Contenido de esta carpeta:

- `public/` : la web (presentación, guía y página de participación por QR).
- `netlify/edge-functions/api.js` y `netlify/lib/core.js` : la pequeña API que recoge las respuestas anónimas (Netlify Blobs).
- `netlify.toml` y `package.json` : configuración para que Netlify lo despliegue solo.

No hace falta Firebase ni ningún otro servicio.
Sigue la guía `DESPLIEGUE.md` para publicarlo.
Para que funcione, configura en Netlify la variable `PRESENTER_PIN` (el PIN de la presentadora).
No se guardan datos personales. Cada móvil usa un identificador aleatorio que no se puede relacionar con ninguna persona.
Las respuestas se pueden borrar desde la pestaña «Sesión en directo».
