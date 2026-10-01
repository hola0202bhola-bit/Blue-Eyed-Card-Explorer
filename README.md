# Blue-Eyes Card Explorer

Aplicación Angular que consulta la API real de YGOPRODeck para buscar cartas por nombre y explorar dinámicamente el arquetipo Blue-Eyes. No usa cartas precargadas, expansiones fijas, archivos JSON locales ni respuestas simuladas.

## Ejecutar el proyecto

```bash
npm install
npm start
```

Abre `http://localhost:4200`. Para generar una versión optimizada:

```bash
npm run build
```

## Organización

- `src/main.ts`: inicia la aplicación standalone con su configuración global.
- `src/index.html`: documento base, metadatos, idioma y favicon.
- `src/styles.css`: variables visuales y estilos globales.
- `src/app/app.config.ts`: registra `HttpClient` para toda la aplicación.
- `src/app/app.ts`: componente raíz; coordina la carta seleccionada y abre/cierra el detalle.
- `src/app/app.html`: composición de cabecera, buscador, colección, detalle y pie.
- `src/app/app.css`: diseño general, cabecera y portada responsive.
- `src/app/models/interfaces/card.interface.ts`: contratos estrictos para cartas, imágenes, impresiones, respuesta de la API y estados de petición.
- `src/app/services/ygoprodeck.service.ts`: único punto de acceso HTTP a YGOPRODeck; construye parámetros para búsqueda parcial y arquetipo.
- `src/app/components/card-search/`: búsqueda reactiva y estados del buscador.
- `src/app/components/blue-eyes-collection/`: carga el arquetipo, obtiene expansiones y filtra cartas.
- `src/app/components/card-grid/`: cuadrícula reutilizable de resultados.
- `src/app/components/card-tile/`: tarjeta individual con imagen, tipo, atributo, nivel, ATK y DEF cuando existen.
- `src/app/components/card-detail/`: panel accesible con descripción, arquetipo y tabla de impresiones.
- `src/app/components/status-message/`: estados visuales reutilizables de carga, vacío y error.

## RxJS y métodos importantes

- `debounceTime(450)` espera 450 ms desde la última tecla. Así una escritura rápida produce una sola consulta y no una petición por carácter.
- `distinctUntilChanged()` evita repetir la petición cuando el texto normalizado es idéntico al anterior.
- `switchMap()` cambia a la petición correspondiente al término más reciente y cancela la suscripción a una petición anterior si el usuario continúa escribiendo.
- `filter()` deja pasar únicamente términos con dos o más caracteres.
- `Set` conserva valores únicos; aquí elimina nombres de expansión duplicados.
- `flatMap()` transforma cada carta en su lista de nombres de expansión y aplana todas esas listas en una sola.
- `some()` comprueba si al menos una impresión de la carta pertenece a la expansión seleccionada.
- El servicio HTTP usa `HttpClient.get<CardApiResponse>()`. El genérico valida el contrato en compilación, `HttpParams` codifica los parámetros y `map()` devuelve solo la lista `data`. Los componentes deciden cómo representar loading, success, empty o error.

## Flujo de datos

El buscador emite texto a un `Subject<string>`, limpia espacios, descarta términos demasiado cortos, aplica el debounce y solo conserva cambios reales. `switchMap` consulta el servicio y actualiza la interfaz con la respuesta vigente. La colección se solicita por `archetype=Blue-Eyes`; sus expansiones se derivan de `card_sets` y el filtro usa esas mismas impresiones, por lo que ambas listas siempre proceden de la API.
