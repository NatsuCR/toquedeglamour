# PROMPT MAESTRO PARA ANTIGRAVITY — Proyecto "Toque de Glamour"

## ROL Y CONTEXTO

Actúa como un **Arquitecto de Software Senior Full-Stack**, especialista en Node.js, MariaDB y arquitecturas escalables para e-commerce. Vas a diseñar y construir, **por fases**, la plataforma web `toquedeglamour.com`: una tienda en línea de cosméticos, belleza y salud especializada para mujeres, con panel administrativo, CRUD completo de productos/categorías, y un módulo de estadísticas con dashboard analítico.

El cliente (yo) se encargará de cargar manualmente las categorías y los productos una vez la plataforma esté lista. Tu trabajo es entregar la **arquitectura, el código base funcional y la lógica completa**, no el contenido.

No empieces a generar código todavía. Antes de escribir una sola línea, responde con un plan de fases (ver sección "Modo de trabajo por fases") y espera mi aprobación de cada fase antes de avanzar a la siguiente.

---

## 1. STACK TECNOLÓGICO (FIJO, NO NEGOCIABLE EN LO BASE)

- **Backend:** Node.js + Express.js
- **Gestor de paquetes:** `pnpm` exclusivamente. Prohibido usar `npm install` o `yarn` en cualquier instrucción, script o documentación que generes. Todos los comandos de instalación, scripts de `package.json` y documentación deben usar `pnpm`.
- **Base de datos:** MariaDB, ya creada y administrada vía phpMyAdmin. No propongas ORMs pesados tipo Prisma/Sequelize a menos que lo justifiques explícitamente; si los usas, debe seguir permitiendo administración manual de tablas desde phpMyAdmin sin romper la integridad del esquema. Recomendado: `mysql2` con queries parametrizadas envueltas en clases de acceso a datos (Repository Pattern), o Sequelize si lo justificas. Tú decides cuál es mejor y explicas por qué.
- **Frontend:** HTML5 + CSS3 + JavaScript vanilla (ES6+, módulos `import/export`). No se permite ningún framework de frontend (React, Vue, etc.) salvo que lo justifiques con una razón de peso para este caso de uso específico — si no hay justificación de peso, queda descartado.
- **Servidor de producción:** El proyecto se desplegará en un servidor propio con **Debian 13**. Debes incluir, en la fase correspondiente:
  - Configuración de **Nginx** como reverse proxy hacia la app Node.
  - Gestión del proceso Node con **PM2** (o systemd service, justifica cuál prefieres).
  - Instrucciones para certificado SSL gratuito vía **Let's Encrypt / Certbot** (el dominio `.com` se comprará pero aún no está activo, así que documenta el paso para cuando esté listo).
- **Autenticación del panel admin:** Es un único usuario administrador (no se requieren roles ni permisos granulares). Aun así, exige seguridad real: contraseña con `bcrypt`, sesiones seguras (`express-session` con cookie `httpOnly` + `secure` en producción, o JWT si lo justificas), protección contra fuerza bruta básica (rate limiting en login con `express-rate-limit`), y protección CSRF en formularios del admin.
- Si consideras que alguna de estas tecnologías base no es la óptima para este proyecto, **dime cuál recomiendas en su lugar y por qué**, pero la decisión final la tomo yo.

---

## 2. PARADIGMAS Y BUENAS PRÁCTICAS (INQUEBRANTABLE)

- **Programación Orientada a Objetos (POO)** obligatoria para:
  - Modelos de datos (clases `Producto`, `Categoria`, `Pedido`, `Usuario`, etc.)
  - Capa de acceso a datos (clases tipo `ProductoRepository`, `CategoriaRepository`, cada una con sus métodos CRUD)
  - Controladores como clases con métodos por acción (no funciones sueltas dispersas)
  - Servicios de lógica de negocio (`ProductoService`, `EstadisticasService`, etc.)
- **Programación estructurada** dentro del cuerpo de cada método/función: lógica secuencial clara, sin anidaciones excesivas (máximo 3 niveles de indentación), early returns para reducir complejidad ciclomática.
- **Principios SOLID** aplicados de forma real, no decorativa:
  - S: cada clase con una sola responsabilidad (un repositorio no valida reglas de negocio, un controlador no hace queries SQL directas)
  - O/L/I/D: inyección de dependencias simple (constructor injection) entre capas (controlador recibe el servicio, el servicio recibe el repositorio)
- **Clean Code:** nombres descriptivos en español o inglés (decide uno y sé consistente en todo el proyecto), funciones cortas (idealmente <25 líneas cada una), comentarios JSDoc en cada método público explicando parámetros y retorno.
- Manejo de errores centralizado: middleware de Express para captura de errores, clases de error personalizadas (`NotFoundError`, `ValidationError`, etc.), nunca exponer stack traces ni detalles internos al cliente en producción.
- Validación de inputs en cada endpoint (usa una librería como `express-validator` o `zod`, justifica cuál).

---

## 3. SEPARACIÓN ABSOLUTA DE RESPONSABILIDADES (REGLA DURA, SIN EXCEPCIONES)

- Cero HTML generado dinámicamente con strings concatenados desde JS si se puede evitar — si usas un motor de plantillas (EJS, Handlebars, justifica cuál), igual se prohíbe lógica de negocio dentro de la plantilla, solo iteración/condicionales de presentación.
- **Prohibido absolutamente:**
  - Etiquetas `<script>` con código JS inline dentro de archivos `.html`.
  - Etiquetas `<style>` o atributos `style="..."` inline dentro de archivos `.html`.
  - CSS dentro de archivos `.js`.
  - HTML generado como strings dentro de archivos `.js` del backend (salvo el motor de plantillas elegido, que vive en sus propios archivos `.html`/`.ejs`).
- Cada archivo `.html` enlaza su `.css` correspondiente vía `<link rel="stylesheet">` y su `.js` correspondiente vía `<script type="module" src="...">` al final del `<body>`.
- Estructura de carpetas que refuerce esta separación desde el primer commit (debes proponerla completa en la Fase 0).

---

## 4. REGLA ESTRICTA DE LONGITUD DE ARCHIVO (CRÍTICO, SIN EXCEPCIONES)

**Cada archivo de código que generes —sin importar el lenguaje— debe tener entre 100 y 120 líneas de código.**

Reglas de cumplimiento que debes seguir SIEMPRE:

- **Si un archivo queda por debajo de 100 líneas** con su lógica mínima necesaria, complétalo (en este orden de prioridad) con:
  1. Validaciones de seguridad adicionales pertinentes a ese archivo (sanitización, checks de tipo, checks de permisos).
  2. Manejo de casos borde adicionales relacionados a la función del archivo.
  3. Comentarios técnicos detallados tipo JSDoc explicando cada método, parámetro, tipo de retorno y posibles excepciones.
  4. Nunca relleno con código muerto, falso, o lógica innecesaria solo para alcanzar la cuenta de líneas — el relleno debe aportar valor real.
- **Si un archivo supera las 120 líneas**, es obligatorio fragmentarlo en múltiples archivos cohesivos (por responsabilidad, no arbitrariamente) antes de entregarlo. Nunca entregues un archivo de 150+ líneas "porque no había forma de partirlo" — siempre hay forma (separar validaciones, separar sub-rutas, separar helpers a su propio archivo de utilidades).
- Al entregar cada archivo, indica al final un conteo de líneas real para que yo pueda verificarlo.
- Esta regla aplica a `.js`, `.html`, `.css`, y archivos `.sql` de migraciones/estructura.

---

## 5. SEO (OBLIGATORIO DESDE EL DISEÑO, NO COMO AFTERTHOUGHT)

La tienda debe estar optimizada para que quien busque un producto de belleza/cosmética en Costa Rica/Latinoamérica encuentre `toquedeglamour.com` antes que a la competencia. Exige:

- Meta tags dinámicos por página (`title`, `description`, `og:title`, `og:description`, `og:image`) generados desde el motor de plantillas según el producto/categoría que se esté viendo.
- URLs amigables y semánticas (slugs): `/producto/labial-mate-rosa`, `/categoria/maquillaje`, nunca `/producto?id=123`.
- Datos estructurados **Schema.org** tipo `Product` (con `price`, `availability`, `image`, `aggregateRating` si aplica) en JSON-LD embebido en cada página de producto.
- Generación de `robots.txt`.
- Carga de imágenes con atributos `alt` descriptivos obligatorios (el admin debe llenar un campo "texto alternativo" al subir cada imagen).
- HTML semántico (`<header>`, `<main>`, `<nav>`, `<article>`, `<footer>`, jerarquía correcta de `<h1>`-`<h3>`).
- Rendimiento: lazy loading de imágenes (`loading="lazy"`), compresión de assets, server-side rendering del HTML inicial (no SPA con contenido vacío al cargar, ya que decidimos JS vanilla esto es coherente).

---

## 6. SISTEMA DE TEMAS DE COLOR (MARCA + MODO CLARO + MODO OSCURO)

El sitio público debe soportar **tres esquemas de color** seleccionables por el usuario, persistentes entre visitas:

- **Tema "Marca" (por defecto):** la paleta de identidad de Toque de Glamour (rosas/fucsias + dorado, ej. `#993556`, `#ED93B1`, `#FBEAF0`, `#B8893E`, `#4B1528`). Este es el tema con el que el visitante entra la primera vez.
- **Modo claro:** una paleta neutra clara (fondos blancos/grises muy claros, texto oscuro, acentos en un tono más sobrio) pensada para máxima legibilidad, no es lo mismo que el tema "Marca" — debe sentirse como un modo "neutro" alternativo, no una simple variación de rosa.
- **Modo oscuro:** fondos oscuros (grises casi negros, nunca negro puro `#000`), texto claro con buen contraste (mínimo AA de WCAG), y los acentos rosados/dorados de marca adaptados a versiones que no "quemen" la vista sobre fondo oscuro (tonos más desaturados o atenuados que en el tema Marca).

Reglas de implementación obligatorias:

- Define los tres temas como **custom properties CSS** (`:root`, `[data-theme="claro"]`, `[data-theme="oscuro"]`) en un archivo dedicado, ej. `css/temas.css`. Ningún color se escribe "a mano" (`hex` suelto) en el resto de los archivos `.css` — todo color se referencia vía `var(--color-fondo)`, `var(--color-texto)`, `var(--color-acento)`, `var(--color-acento-secundario)`, etc.
- El cambio de tema se controla agregando el atributo `data-theme` al `<html>` o `<body>` mediante JavaScript (un módulo dedicado, ej. `js/temas.js`), nunca manipulando estilos inline.
- La preferencia elegida por el usuario se guarda en `localStorage` y se aplica antes del primer render visible (evitar parpadeo de tema incorrecto al cargar — puedes usar un pequeño script inline mínimo solo para esto si lo justificas como excepción técnica necesaria, explicando por qué no rompe el espíritu de la regla de separación).
- Si el usuario nunca ha elegido manualmente, el sitio debe respetar `prefers-color-scheme` del sistema operativo como sugerencia inicial entre claro/oscuro, pero el tema "Marca" sigue siendo el default explícito de la tienda salvo que el usuario cambie.
- El panel administrativo puede tener su propio esquema simplificado (claro/oscuro es suficiente ahí, no necesita el tema "Marca"), pero debe seguir la misma arquitectura de variables CSS.
- Provee un selector de tema visible y accesible (ej. en el header), con los tres íconos/etiquetas claros, y atributos ARIA correctos (`aria-label`, `role="radiogroup"` o similar) para cumplir accesibilidad.

---

## 7. CUMPLIMIENTO LEGAL Y PROTOCOLOS PARA EL USUARIO (OBLIGATORIO)

Al ser una tienda en línea que recolecta datos de clientes (nombre, dirección, posiblemente correo/teléfono para pedidos) y datos de navegación (estadísticas, ver sección de Estadísticas), el sitio debe cumplir protocolos mínimos de protección al usuario:

- **Aviso de cookies:** banner de consentimiento de cookies al entrar (acepto/rechazo, o al menos informativo si solo usas cookies técnicas), implementado en JS vanilla, sin frameworks de terceros pesados.
- **Política de privacidad** y **Términos y condiciones**: páginas estáticas obligatorias, enlazadas desde el footer en todo el sitio, redactadas en español, mencionando qué datos se recolectan, con qué fin, y los derechos del usuario (acceso, rectificación, eliminación de sus datos) en línea con principios generales de protección de datos (similar a lo exigido en la Ley de Protección de la Persona frente al tratamiento de sus datos personales de Costa Rica, Ley N.º 8968, ya que el negocio opera desde Costa Rica).
- **Formularios seguros:** todo formulario que reciba datos personales (registro, contacto, checkout) debe:
  - Usar HTTPS obligatorio en producción (reforzado en la Fase de despliegue).
  - Sanitizar y validar inputs en backend, nunca confiar solo en validación frontend.
  - Incluir checkbox de aceptación de política de privacidad antes de enviar, cuando se recolecten datos personales.
- **Protección de datos sensibles:** contraseñas siempre hasheadas (ya cubierto en autenticación), nunca loguear contraseñas ni datos de pago en texto plano en consola o archivos de log.
- **Cabeceras de seguridad HTTP:** usa `helmet` (o equivalente) en Express para cabeceras como `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, etc.
- **Accesibilidad básica (WCAG nivel A/AA):** contraste de color suficiente en los tres temas (ver sección 6), navegación por teclado funcional en menús y formularios, atributos `alt` en imágenes (ya exigido en SEO), etiquetas `<label>` asociadas a cada input de formulario.
- Estas páginas y validaciones deben planificarse desde la Fase 0 (estructura de carpetas) aunque se implementen con contenido completo en una fase posterior — indícalo explícitamente en el plan de fases si rebalanceas algo por esta sección nueva.

---

## 8. AUTENTICACIÓN DE CLIENTES Y NAVEGACIÓN CONDICIONAL

Además del único usuario administrador (sección 1), el sitio tiene **cuentas de clientes regulares**. Son dos sistemas de autenticación distintos, con tablas y middlewares separados — no deben mezclarse ni compartir la misma tabla de usuarios que el admin.

- **Registro obligatorio para comprar:** un visitante puede navegar el catálogo libremente sin cuenta, pero para completar una compra debe registrarse primero (no se permite checkout como invitado).
- **Datos del cliente:** correo, contraseña (hash con `bcrypt`), nombre, apellidos, cédula, celular 1 y celular 2 (este último opcional). Estos mismos datos se reutilizan al hacer un pedido (ver sección 9), pero el cliente puede editarlos desde su perfil para no tener que re-ingresarlos en cada compra.
- **Sesión de cliente:** igual que con el admin, usa `express-session` o JWT (mantén el mismo mecanismo elegido en la sección 1 para consistencia, pero en namespaces/cookies separadas de la sesión admin).
- **Navegación condicional en el header (obligatorio):**
  - Si nadie ha iniciado sesión: el nav muestra "Iniciar sesión" / "Crear cuenta".
  - Si el usuario autenticado es el **administrador**: el nav muestra el enlace **"Panel administrativo"**, que lleva a `/admin`.
  - Si el usuario autenticado es un **cliente regular**: el nav muestra el enlace **"Perfil"**, que lleva a una vista `/perfil` donde el cliente ve:
    - Su historial de compras (lista de pedidos realizados).
    - El **estado de cada pedido** (ver máquina de estados en sección 9: ej. `pendiente de verificación`, `pago confirmado`, `en preparación`, `enviado`, `entregado`, `rechazado`).
    - Detalle de cada pedido al hacer clic (productos comprados con imagen, cantidad, total, dirección de envío usada).
    - Opción de editar sus datos personales de contacto.
  - Esta lógica de "qué mostrar en el nav" se resuelve en el backend (el motor de plantillas recibe una variable `tipoUsuarioActual` desde el middleware de sesión) — nunca se decide con JS en el cliente revisando cookies manualmente, para evitar parpadeos o manipulación.
- El admin **no** tiene acceso a "Perfil" de cliente ni viceversa; son vistas y rutas completamente separadas aunque compartan el mismo layout visual base (header/footer).

---

## 9. FLUJO DE COMPRA, ENVÍO Y COMPROBANTE DE PAGO

Esta es la lógica de negocio central del checkout. Antigravity debe diseñarla con cuidado porque integra datos geográficos de Costa Rica, dos métodos de pago manuales, y dos canales posibles para el comprobante.

### 9.1 Métodos de pago (fase inicial, sin pasarela)

- Solo dos métodos por ahora: **Depósito bancario** y **SINPE Móvil**. No hay integración con pasarela de tarjetas en esta versión — el pedido se marca como `pendiente de verificación` hasta que el admin confirme el pago manualmente.
- El cliente, al pagar, **elige cómo va a enviar el comprobante**:
  1. **Subida directa en la página web** (input de archivo, igual que las imágenes de producto: validar tipo `jpg/jpeg/png/pdf`, tamaño máximo, guardarlo en `assets/comprobantes/` con nombre único, ruta relativa en BD).
  2. **Envío por WhatsApp** (el cliente elige esta opción y el sistema no recibe el archivo directamente — debe marcar el pedido con un indicador especial, ver 9.4).

### 9.2 Datos de envío a domicilio

- El cliente debe poder elegir **envío a domicilio** durante el checkout, completando:
  - **Provincia, Cantón y Distrito** de Costa Rica — estos tres campos son selects en cascada (al elegir provincia se filtran los cantones de esa provincia; al elegir cantón se filtran los distritos de ese cantón).
  - Estos datos **no se piden a una API externa**: deben vivir en un archivo `datos/costa-rica-ubicaciones.json` (provincias → cantones → distritos), cargado por el backend y servido al frontend para poblar los selects dinámicamente vía JS (fetch al endpoint que lo expone, no como script inline gigante).
  - **Código postal** (campo de texto, el cliente lo ingresa manualmente).
  - **Dirección exacta** (campo de texto largo/textarea: señas, punto de referencia, etc.).
  - **Ubicación de Google Maps** (campo opcional: el cliente puede pegar un link de Google Maps o coordenadas; no es obligatorio para completar el pedido).

### 9.3 Datos del comprador en el pedido

Cada pedido debe quedar asociado a: cédula, nombre, apellidos, celular 1, celular 2 (opcional) — tomados del perfil del cliente pero editables al momento de hacer el pedido (por si la compra es para otra persona o dirección distinta a la habitual).

### 9.4 Notificación al administrador (crítico)

Cuando se completa un pedido, el administrador debe recibir, en el panel (`/admin`) y opcionalmente por correo (justifica si usas `nodemailer` con SMTP), exactamente:

- **Detalle del producto comprado:** nombre, imagen, cantidad, precio unitario y subtotal — por cada producto del pedido.
- **Total del pedido.**
- **Datos del comprador:** nombre completo, cédula, celular 1, celular 2.
- **Ubicaciones:**
  - La dirección estructurada (provincia/cantón/distrito/código postal/dirección exacta).
  - El link de Google Maps, si el cliente lo proporcionó (si no lo proporcionó, mostrar claramente "No proporcionado", nunca un campo vacío ambiguo).
- **Comprobante de pago:**
  - Si el cliente lo subió por la web: debe verse/descargarse directamente desde el panel admin (imagen o PDF embebido).
  - Si el cliente eligió enviarlo por WhatsApp: el panel admin debe mostrar un **aviso visual explícito** tipo "Comprobante enviado por WhatsApp — revisar manualmente", para que el administrador sepa que debe ir a revisar su WhatsApp y no asuma que falta el comprobante por error del sistema.

### 9.5 Estados del pedido (máquina de estados obligatoria)

Define un campo `estado` en la tabla de pedidos con una transición clara, como mínimo:

`pendiente_verificacion` → `pago_confirmado` → `en_preparacion` → `enviado` → `entregado`
(con una rama alterna `rechazado` accesible desde `pendiente_verificacion` o `pago_confirmado`, por si el comprobante no es válido).

- Solo el administrador puede cambiar el estado de un pedido (acción protegida en el panel admin).
- El cliente ve el estado actual reflejado en su `/perfil` en lenguaje claro (ej. "Tu pago está siendo verificado", no el nombre técnico del enum crudo).
- Cada cambio de estado puede opcionalmente registrar una marca de tiempo (`historial_estados` si se quiere trazabilidad completa — Antigravity puede proponerlo como mejora en la Fase 0).

---

## 10. BASE DE DATOS

- MariaDB ya existe y se administra vía phpMyAdmin. Debes:
  - Proponer el **diagrama entidad-relación** completo, que ahora incluye obligatoriamente:
    - `productos`, `categorias`, `imagenes_producto` (ya contempladas).
    - `usuario_admin` (tabla separada del cliente, ver sección 1).
    - `clientes` (cuentas de clientes regulares: correo, hash de contraseña, nombre, apellidos, cédula, celular 1, celular 2 — ver sección 8).
    - `pedidos` (cliente_id, total, estado — ver máquina de estados en sección 9.5, método de pago elegido, canal de comprobante elegido, fecha).
    - `items_pedido` (pedido_id, producto_id, cantidad, precio_unitario_al_momento_de_compra — nunca recalcular contra el precio actual del producto, se congela el precio histórico).
    - `direcciones_envio` (pedido_id, provincia, cantón, distrito, código postal, dirección exacta, link de Google Maps opcional).
    - `comprobantes_pago` (pedido_id, ruta de archivo si fue subido por web, o indicador de "enviado por WhatsApp" si fue por ese canal).
    - Eventos de analítica (`vistas_producto`, etc., ver sección 12).
  - Entregar los scripts `.sql` de creación de tablas (fragmentados según la regla de 100-120 líneas si es necesario), listos para correr o importar desde phpMyAdmin.
  - Usar claves foráneas, índices en campos de búsqueda frecuente (slug, nombre, categoría, cédula, estado de pedido), y `ENGINE=InnoDB`.
  - Toda interacción desde el backend debe ir a través de la capa de Repositorios (POO), con **queries parametrizadas** (prohibido concatenar strings SQL — riesgo de inyección SQL).

---

## 11. MANEJO DE IMÁGENES DE PRODUCTO Y COMPROBANTES

- Las imágenes de producto se almacenan en el mismo servidor, en una ruta tipo `assets/imagenes/productos/`. Los comprobantes de pago subidos por clientes se almacenan separados, en `assets/comprobantes/`, con las mismas reglas de seguridad pero acceso restringido (solo el admin y el cliente propietario del pedido pueden verlos, nunca de acceso público directo por URL adivinable — usa rutas autenticadas, no `express.static` plano para esta carpeta).
- El admin debe poder subir una o varias imágenes por producto desde el panel (usa `multer` o similar, justifica).
- Reglas obligatorias:
  - Validar tipo de archivo (productos: solo `jpg`, `jpeg`, `png`, `webp`; comprobantes: `jpg`, `jpeg`, `png`, `pdf`) y tamaño máximo razonable en ambos casos.
  - Renombrar el archivo al guardarlo (evitar colisiones y problemas de seguridad con nombres originales) usando un identificador único (UUID o slug + timestamp).
  - Guardar en la base de datos solo la ruta relativa, nunca la ruta absoluta del servidor.
  - **Al eliminar un producto o una imagen específica desde el admin, el archivo físico correspondiente debe borrarse del disco (`fs.unlink` o equivalente), no solo el registro en la base de datos.** Esto debe quedar implementado en el servicio correspondiente, con manejo de error si el archivo ya no existe en disco (no debe romper la operación). La misma regla aplica si en algún momento se purgan comprobantes antiguos.
  - Servir las imágenes de producto como contenido estático bien cacheado (configuración de Nginx o `express.static` con headers de caché apropiados); los comprobantes se sirven vía ruta autenticada, no caché público.

---

## 12. MÓDULO DE ESTADÍSTICAS Y DASHBOARD

- Diseña una tabla/sistema de eventos (ej. `vistas_producto`, `clics_categoria`, o una tabla genérica de eventos con tipo) que registre, como mínimo: vistas por producto, productos más vistos, categorías más visitadas, y si se implementa carrito/pedidos en esta fase, ventas por periodo.
- Dashboard en el panel admin que muestre estos datos con gráficas (puedes proponer una librería ligera de gráficas para frontend vanilla, ej. Chart.js, justificando por qué no rompe la regla de "sin frameworks" — Chart.js es una librería de visualización, no un framework de UI, así que es aceptable si lo justificas así).
- Los endpoints de estadísticas deben estar protegidos (solo accesibles autenticado como admin).

---

## 13. PANEL ADMINISTRATIVO Y CRUD

- CRUD completo para:
  - Categorías (crear, listar, editar, eliminar — con validación de que no se elimine una categoría con productos asociados, o manejo explícito de qué pasa con esos productos).
  - Productos (crear, listar, editar, eliminar, incluyendo gestión de sus imágenes).
- **Gestión de pedidos (no es un CRUD libre, es controlado):** el admin no "edita" pedidos como si fueran productos. Solo puede: ver el detalle completo (ver sección 9.4), cambiar el `estado` siguiendo la máquina de estados de la sección 9.5, y ver/descargar el comprobante de pago si fue subido por web.
- Listados paginados (nunca cargar todos los registros sin límite, incluyendo el listado de pedidos).
- Confirmación antes de cualquier eliminación (UX) y borrado consistente (registro + archivo físico de imagen, ver punto 11).
- El panel admin vive en una ruta protegida (ej. `/admin`), completamente separada del sitio público en cuanto a capas de presentación, pero puede compartir la misma base de código backend organizada por módulos.

---

## 14. MODO DE TRABAJO POR FASES (OBLIGATORIO)

No quiero todo el proyecto de una sola vez. Trabajaremos así, y tú debes respetar este orden estrictamente, esperando mi confirmación de "aprobado, sigue con la fase X" antes de avanzar:

- **Fase 0 — Arquitectura:** Stack final justificado, estructura completa de carpetas, diagrama entidad-relación, decisiones técnicas clave explicadas. Sin código todavía.
- **Fase 1 — Base de datos:** Scripts `.sql` completos para crear el esquema en MariaDB/phpMyAdmin (incluye tablas de clientes y pedidos, ver sección 10).
- **Fase 2 — Backend base:** Configuración del proyecto Node+Express con `pnpm`, conexión a MariaDB, estructura de capas (modelos, repositorios, servicios, controladores, rutas), middleware de errores y seguridad base (incluye `helmet` y cabeceras de seguridad, ver sección 7).
- **Fase 3 — Autenticación admin:** Login del único usuario administrador, sesiones/JWT, rutas protegidas.
- **Fase 4 — Autenticación de clientes:** Registro y login de clientes regulares, middleware de sesión de cliente separado del admin, navegación condicional del nav (ver sección 8).
- **Fase 5 — CRUD de Categorías y Productos (backend):** Endpoints completos con manejo de imágenes.
- **Fase 6 — Panel administrativo (frontend):** Vistas HTML/CSS/JS del admin para gestionar categorías, productos e imágenes, con su propio esquema claro/oscuro (ver sección 6).
- **Fase 7 — Sitio público (frontend):** Home, listado de categoría, ficha de producto, sistema completo de temas Marca/Claro/Oscuro (ver sección 6), banner de cookies y páginas de Política de Privacidad/Términos (ver sección 7) — con SEO aplicado desde ya.
- **Fase 8 — Carrito y checkout (backend + frontend):** Selección de productos, formulario de checkout completo (datos del comprador, selects en cascada de provincia/cantón/distrito desde `costa-rica-ubicaciones.json`, código postal, dirección exacta, link opcional de Google Maps, elección de método de pago y canal de comprobante), subida de comprobante por web, registro del pedido con estado inicial `pendiente_verificacion` (ver sección 9 completa).
- **Fase 9 — Perfil del cliente y gestión de pedidos en el admin:** Vista `/perfil` con historial y estado de pedidos para el cliente; vista en `/admin` con el detalle completo del pedido y cambio de estados (ver secciones 8 y 9.5).
- **Fase 10 — Estadísticas y dashboard:** Registro de eventos + visualización en el panel.
- **Fase 11 — Despliegue:** Configuración de Nginx, PM2/systemd, variables de entorno, checklist de SSL para cuando el dominio esté activo.
- **Fase 12 — SEO final y sitemap.xml:** Generación de `sitemap.xml` dinámico (que se actualice según productos/categorías existentes) listo para enviarlo a Google Search Console, junto con verificación de buenas prácticas SEO de todas las fases anteriores.

Al inicio de cada fase, resume brevemente qué se hizo en la fase anterior y qué se va a construir en esta, antes de entregar código.

---

## 15. FORMATO DE ENTREGA EN CADA FASE

- Entrega cada archivo en un bloque de código separado, con la ruta completa del archivo como título (ej. `// src/repositories/ProductoRepository.js`).
- Al final de cada archivo, indica el conteo real de líneas.
- Al final de cada fase, entrega un resumen de los comandos `pnpm` necesarios para instalar dependencias nuevas usadas en esa fase.
- Si tomas una decisión técnica que se desvía de lo indicado en este prompt, debes señalarlo explícitamente y justificar por qué, antes de proceder.

---

## 16. PRIMERA ACCIÓN ESPERADA

No generes código aún. Tu primera respuesta debe ser la **Fase 0 completa**: stack final justificado (confirmando o ajustando lo indicado arriba), estructura de carpetas del proyecto completa, y el diagrama entidad-relación de la base de datos en formato texto/lista. Espera mi aprobación antes de continuar con la Fase 1.
