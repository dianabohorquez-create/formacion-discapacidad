# Publicar la formación en Netlify (sin Firebase)

Tiempo aproximado: 15 minutos, una sola vez.
Necesitas tu cuenta de Netlify y una cuenta gratuita de GitHub.

> **Importante:** el método de «arrastrar la carpeta» a Netlify (Netlify Drop) publica solo la web.
> No publica la API que recoge las respuestas de los móviles.
> Por eso aquí se publica desde GitHub. Así, además, cada cambio futuro se publica solo.

---

## Paso 1 · Descomprimir el paquete

1. Descomprime `formacion-discapacidad-netlify.zip`.
2. Dentro de la carpeta `formacion-discapacidad` tienes que ver:
   - la carpeta `public` (la web);
   - la carpeta `netlify` (la API);
   - los archivos `netlify.toml`, `package.json`, `LEEME.md` y `DESPLIEGUE.md`.

## Paso 2 · Subir la carpeta a GitHub

1. Entra en https://github.com (crea una cuenta si no tienes).
2. Arriba a la derecha, pulsa **+** y luego **New repository**.
3. Ponle de nombre `formacion-discapacidad`.
4. Marca **Private** y pulsa **Create repository**.
5. En la página que aparece, pulsa el enlace **uploading an existing file**.
6. Abre la carpeta `formacion-discapacidad` en tu ordenador y selecciona **todo su contenido**:
   - las carpetas `public` y `netlify`;
   - los archivos sueltos.
7. Arrástralo a la ventana de GitHub. Sube el contenido, **no la carpeta que lo contiene**.
8. Espera a que termine de cargar y pulsa **Commit changes**.

Para comprobarlo, en la página del repositorio tienen que verse en primer nivel `public`, `netlify`, `netlify.toml` y `package.json`.

## Paso 3 · Crear el proyecto en Netlify

1. Entra en https://app.netlify.com.
2. Pulsa **Add new project** y luego **Import an existing project**.
3. Elige **GitHub** y autoriza a Netlify. Si te pregunta a qué repositorios da acceso, elige solo `formacion-discapacidad`.
4. Selecciona el repositorio `formacion-discapacidad`.
5. En la configuración **no cambies nada**: Netlify lee `netlify.toml`, y la carpeta de publicación es `public`.
6. Antes de publicar, busca **Add environment variables** (o **Environment variables**) y añade:
   - **Key:** `PRESENTER_PIN`
   - **Value:** tu PIN de presentadora, por ejemplo una cifra de 6 a 8 dígitos. No lo compartas.
7. Pulsa **Deploy**.

Si no viste la opción de variables en el paso 6, publica igualmente y luego:
1. Ve a **Project configuration** → **Environment variables** → **Add a variable**.
2. Añade `PRESENTER_PIN`.
3. Ve a **Deploys** → **Trigger deploy** → **Deploy project** para volver a publicar.

## Paso 4 · Comprobar la publicación

1. Espera a que el despliegue diga **Published** (1–2 minutos).
2. En **Deploys**, abre el último despliegue y comprueba en el resumen que aparece **1 edge function** (`api`).
3. Opcional: en **Project configuration** → **Change project name**, pon un nombre fácil, por ejemplo `formacion-discapacidad-spt`. La dirección será `https://formacion-discapacidad-spt.netlify.app`.

## Paso 5 · Ensayo con dos dispositivos

1. En el ordenador, abre la dirección con un código de sesión, por ejemplo `https://TU-PROYECTO.netlify.app/?s=prueba`.
2. Pulsa el botón verde **Conectar móviles (PIN)**, escribe tu PIN y pulsa **Conectar móviles**. El botón pasará a **En directo · prueba**.
3. Ve a **Presentar** y avanza hasta una dinámica (por ejemplo, la nube de palabras del Día 1).
4. Con el móvil, escanea el QR de la diapositiva, elige equipo y responde.
5. En unos 2 segundos la respuesta aparece en la pantalla.
6. Prueba **↺ Reiniciar** (se pulsa dos veces): la actividad se vacía en la pantalla y en el móvil.
7. Al terminar el ensayo, ve a **Sesión en directo** → **Borrar toda la sesión «prueba»**.

## Paso 6 · El día de la formación

- Usa un código distinto para cada grupo, por ejemplo `?s=grupo-a` o `?s=dgt-noviembre`. Las respuestas de cada código están separadas.
- Abre la presentación en el ordenador que compartes en Teams y conecta con el PIN.
- Pega en el chat de Teams el **enlace para participar desde el ordenador** (pestaña **Sesión en directo** → **Copiar enlace**). Es para quien use lector de pantalla o no tenga cámara.
- Al final de cada jornada, pulsa **Borrar respuestas de hoy**. Al acabar el curso, pulsa **Borrar toda la sesión**.

## Cambios futuros (vídeos, textos)

- Para añadir los enlaces de los vídeos, sube a GitHub el nuevo `public/index.html`:
  1. Abre el repositorio y entra en la carpeta `public`.
  2. Pulsa **Add file** → **Upload files**.
  3. Sube el archivo y pulsa **Commit changes**.
- Netlify vuelve a publicar solo.
- Cada publicación consume 15 créditos, así que conviene agrupar los cambios.

---

## Privacidad (RGPD)

- No se piden nombres, correos ni ningún dato personal.
- Cada móvil genera un identificador aleatorio que se guarda solo en ese navegador. Sirve para que una persona no vote dos veces.
- Las respuestas se guardan en **Netlify Blobs**, dentro de tu propio proyecto. No interviene ningún otro proveedor.
- Solo quien tiene el PIN puede ver las respuestas o borrarlas.
- Las reacciones con emoji se borran solas al minuto.
- Ya no se usa Firebase. Puedes eliminar el proyecto `discapacidad-5e0c1` en https://console.firebase.google.com → ⚙ **Configuración del proyecto** → **Eliminar proyecto**.

## Consumo de créditos (plan Pro, 5.000 créditos/mes)

| Concepto | Estimación por curso (3 jornadas, 200 personas) |
|---|---|
| Consultas de los móviles (cada 3 s, se pausan con la pantalla apagada) | hasta ~720 créditos |
| Transferencia de datos (web + respuestas) | ~50 créditos |
| Publicación (deploy) | 15 créditos por cada una |
| **Total aproximado** | **~800 créditos como máximo** |

Con 5.000 créditos al mes caben unos 5–6 cursos completos de 200 personas, o muchos más con grupos pequeños.
Puedes ver el consumo real en Netlify → **Usage & billing**.

## Si algo falla

- **El botón dice «sin servidor»**: el despliegue no incluyó la API.
  1. Revisa que la carpeta `netlify` está en GitHub en primer nivel.
  2. Revisa que el despliegue muestra «1 edge function».
- **«Falta configurar el PIN»**: añade la variable `PRESENTER_PIN` (paso 3) y vuelve a publicar.
- **«PIN incorrecto»**: comprueba el valor en **Environment variables**. Si lo cambias, vuelve a publicar.
- **Los móviles no ven el cambio de diapositiva**: comprueba que el ordenador muestra **En directo · código** y que el móvil abrió el QR de ese mismo código.
- **El despliegue falla en «Installing dependencies»**:
  1. Abre el registro del despliegue.
  2. Copia las últimas líneas.
  3. Envíamelas para revisarlo.
