# CopaGol - Administrador de Torneos de Fútbol Amateur

Una aplicación web moderna, rápida y responsiva diseñada para administrar torneos de fútbol (Fútbol 5, 7, 8 y 11) con generación automática de fixtures, planillas de partido en vivo, tablas de posiciones automáticas, estadísticas de goleadores y fair play, exportación para WhatsApp y sincronización en la nube con Firebase Firestore.

---

## 🚀 Características Principales

1. **Formatos de Torneo**:
   - **Liga regular**: Todos contra todos con algoritmo Round Robin (tablas Berger).
   - **Fase de Grupos + Playoffs**: Grupos iniciales y posterior cruce de cuartos, semifinales y gran final.
   - **Eliminación directa**: Llaves y brackets automáticos.

2. **Equipos y Planteles**:
   - Registro de equipos con paleta de colores de camiseta y abreviaturas.
   - **Escudo por equipo**: el administrador sube la imagen de cada equipo (se reduce y se guarda dentro del torneo) y aparece en posiciones, fixture, llaves y planilla.
   - Datos de delegado/contacto con enlace directo.
   - Plantilla de jugadores: Dorsal, posición (Arquero, Defensor, Medio, Delantero), capitán y tarjetas acumuladas.

3. **Planilla de Partido en Vivo (Especial para canchas y celulares)**:
   - Marcador en vivo con controles táctiles grandes `+` y `-`.
   - Registro de goles por jugador con minuto.
   - Tarjetas amarillas y rojas con cálculo automático de sanciones.
   - Elección del Jugador del Partido (MVP).
   - Definición por penales si el partido termina empatado en eliminación directa.

4. **Tablas y Estadísticas Automáticas**:
   - **Tabla de Posiciones**: PJ, PG, PE, PP, GF, GC, DG, Puntos, Racha / Forma reciente (W/D/L).
   - **Goleadores**: Ranking de máximos artilleros del torneo.
   - **Fair Play**: Ranking de conducta y disciplina deportiva.
   - **Valla menos vencida**: Promedio de goles recibidos por equipo y arquero.

5. **Difusión y Planillas**:
   - **Botón WhatsApp**: Genera automáticamente el texto con formato para compartir la tabla o el fixture de la fecha con emojis.
   - **Planilla Oficial Imprimible**: Modelo de planilla física en blanco para entregar a los árbitros o veedores en la cancha.

6. **Almacenamiento Híbrido (Local + Nube)**:
   - **Modo Local (LocalStorage)**: Funciona 100% offline sin necesidad de configurar nada al inicio.
   - **Modo Nube (Firebase Firestore)**: Conexión opcional en 1 click para sincronizar entre varios dispositivos en tiempo real.
   - **Copia de seguridad en JSON**: Exporta e importa torneos en cualquier momento.

---

## 💻 Cómo Iniciar la Aplicación

Para iniciar el servidor de desarrollo local:

```bash
npm run dev
```

Luego abre en tu navegador:
`http://localhost:5173`

Para compilar para producción:
```bash
npm run build
```

---

## 📱 Diseñado para Celulares y Tablets

El sistema cuenta con una barra de navegación inferior adaptada a dispositivos móviles, lo que permite que planilleros y árbitros puedan actualizar los resultados directamente desde el campo de juego.

---

## 🔐 Acceso de administrador

Cualquiera puede **ver** fixture, tabla y estadísticas. Solo los administradores pueden **editar** (crear torneos, cargar resultados, equipos, borrar). El botón "Ingresar" de la barra superior abre el login.

Hay dos roles:

- **Admin**: edita torneos.
- **Superadmin**: además tiene un botón de "Administrar usuarios" para dar de alta y de baja a otros (nombre y apellido, rol, usuario y contraseña). No puede darse de baja a sí mismo.

Se puede entrar con **usuario y contraseña** (los que crea el superadmin) o con **Google**. Cualquier otra cuenta queda en modo lectura ("Sin permiso"). La baja quita el acceso de inmediato.

Configuración única en la consola de Firebase:

1. **Authentication → Sign-in method**: habilitar **Google** y **Correo electrónico/contraseña**.
2. **Authentication → Settings → Authorized domains**: agregar el dominio del sitio.
3. **Firestore Database → Data → Start collection**: colección `admins`; **ID del documento = tu email de Google en minúsculas**; campos `rol` = `superadmin` y `nombre` = tu nombre. Es el único alta manual.
4. **Firestore Database → Rules**: pegar el contenido de `firestore.rules` y publicar.
5. Entrar con Google: aparece "Admin" y el botón de "Administrar usuarios".

Notas: las contraseñas deben tener al menos 6 caracteres (límite de Firebase). Los usuarios con contraseña se guardan internamente como `usuario@torneo.local`. Desde el navegador no se puede cambiar la contraseña de otra persona: si alguien la olvida, se da de baja y se le crea un usuario nuevo con otro nombre.
