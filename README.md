# Tecflo

Información de Las Flores en el celular: deportes, eventos, farmacias de turno e información útil. No tiene publicidad.

**Abrir la app:** https://tenehuini.github.io/tecflo_mobile/

## Instalar la aplicación en el celular

La app se instala desde el navegador y queda con su ícono en la pantalla de inicio, como cualquier otra app. No hace falta pasar por Google Play ni por la App Store.

### Android

1. Abrí **Chrome** y entrá a https://tenehuini.github.io/tecflo_mobile/
2. Tocá el menú **⋮** (arriba a la derecha).
3. Elegí **Instalar app**. Si no aparece, elegí **Agregar a pantalla principal**.
4. Confirmá tocando **Instalar** (o **Agregar**).

> También funciona con otros navegadores, como Samsung Internet o Edge. La opción se encuentra en el menú del navegador y suele llamarse "Agregar a pantalla de inicio".

### iPhone

1. Abrí **Safari** y entrá a https://tenehuini.github.io/tecflo_mobile/
   (tiene que ser Safari: desde Chrome u otros navegadores no siempre aparece la opción)
2. Tocá el botón **Compartir**, el cuadrado con una flecha hacia arriba, en la barra de abajo.
3. Deslizá hacia abajo y elegí **Agregar a inicio**.
4. Tocá **Agregar**, arriba a la derecha.

## Preguntas frecuentes

**¿Necesito internet?**
Solo la primera vez. Una vez que la abriste con conexión, la app funciona sin internet. El mapa de las farmacias sí necesita conexión.

**¿Cómo recibo las actualizaciones?**
Solas: al abrir la app con internet, se descarga la versión nueva. A veces hay que cerrarla y volver a abrirla una vez para ver los cambios. En el inicio dice la fecha de los datos.

**¿Cómo la desinstalo?**
Igual que cualquier app: mantené apretado el ícono y elegí **Desinstalar** (Android) o **Eliminar app** (iPhone).

## Para quien mantiene la app

Es la versión para celulares de [tecflo](../tecflo) (`web/`), sin servidor: todo lo que muestra sale de `data.js`, que se genera desde la base y los datos fijos del backend de tecflo. Las pantallas de `app.js` replican las de `tecflo/web/src/pages` y `styles.css` es una copia adaptada de `tecflo/web/src/index.css`: si cambia una, cambiar la otra.

Cada vez que se publica un cambio:

1. Si cambiaron los datos en tecflo (farmacias de turno, equipos, eventos…), regenerá `data.js`:
   ```bash
   python3 tools/export_data.py            # busca el backend en ../tecflo/backend
   python3 tools/export_data.py /otra/ruta/tecflo/backend
   ```
2. Reemplazá la entrada de `changelog.js` por la nueva novedad, con un número de `version` mayor al anterior. Al abrir la app, quien todavía no la vio ve una sola vez un cartel con esa última novedad.
3. En `sw.js` subí el número de `CACHE` (por ejemplo, de `tecflo-v1` a `tecflo-v2`) para que los celulares descarguen los archivos nuevos.
4. Commit y push a `main`: GitHub Pages publica solo.

Para probar en la compu: `python3 -m http.server` y abrir http://localhost:8000.
