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
- `src/app/components/blue-eyes-collection/`: carga el arquetipo y obtiene el número de expansiones únicas; cada carta abre el detalle para comparar sus impresiones.
- `src/app/components/card-grid/`: cuadrícula reutilizable de resultados.
- `src/app/components/card-tile/`: tarjeta individual con imagen, tipo, atributo, nivel, ATK y DEF cuando existen.
- `src/app/components/card-detail/`: panel accesible con descripción, arquetipo y tabla de impresiones.
- `src/app/models/printing.utils.ts`: convierte los precios de impresiones a números y ordena sin modificar los datos originales; los precios ausentes o inválidos aparecen al final.
- `src/app/components/status-message/`: estados visuales reutilizables de carga, vacío y error.

## RxJS y métodos importantes

- `debounceTime(450)` espera 450 ms desde la última tecla. Así una escritura rápida produce una sola consulta y no una petición por carácter.
- `distinctUntilChanged()` evita repetir la petición cuando el texto normalizado es idéntico al anterior. Se aplica también al texto vacío para que borrar y volver a escribir el mismo nombre permita una nueva consulta.
- `switchMap()` cambia a la petición correspondiente al término más reciente y cancela la suscripción a una petición anterior si el usuario continúa escribiendo.
- `filter()` detecta un cambio real en el texto para cancelar inmediatamente la petición anterior mediante `takeUntil`, incluso antes de que termine el debounce. El texto con menos de dos caracteres vuelve al estado inicial sin consultar la API.
- `Set` conserva valores únicos; aquí elimina nombres de expansión duplicados.
- `flatMap()` transforma cada carta en su lista de nombres de expansión y aplana todas esas listas en una sola.
- `some()` permite comprobar si al menos un elemento cumple una condición (por ejemplo, si una carta tiene una impresión en un set). El filtro actual usa `filter()` directamente sobre las impresiones de la carta abierta para conservar solo las de la expansión elegida.
- El servicio HTTP usa `HttpClient.get<CardApiResponse>()`. El genérico valida el contrato en compilación, `HttpParams` codifica los parámetros y `map()` devuelve solo la lista `data`. Los componentes deciden cómo representar loading, success, empty o error.

## Flujo de datos

El buscador emite texto a un `Subject<string>`, limpia espacios y conserva los cambios reales. Oculta inmediatamente resultados anteriores y aplica el debounce. `switchMap` consulta el servicio o restaura el estado inicial si el término es demasiado corto; `takeUntil` cancela las respuestas obsoletas. La colección se solicita por `archetype=Blue-Eyes`; el detalle deriva las expansiones de `card_sets` de la carta seleccionada y filtra esas impresiones, por lo que las listas siempre proceden de la API.

## Comparar expansiones de cualquier carta

Busca una carta y abre su detalle. El selector **Expansión de esta carta** se genera exclusivamente a partir de sus impresiones. Con **Todas las expansiones de esta carta** se compara toda su lista; al elegir una expansión solo aparecen sus impresiones. El precio se compara numéricamente, con orden ascendente o descendente, y se destaca el máximo de la selección, incluyendo empates. Un precio `0.00` se conserva tal como lo informa la API; un valor ausente o inválido se muestra como **Sin precio**. Los precios son referencias de YGOPRODeck, no cotizaciones consultadas directamente a una tienda.

Según la indicación posterior del usuario, el filtro se aplica a las impresiones de cada carta, tanto desde el buscador como desde Blue-Eyes Collection. El selector general de la colección se trasladó al detalle. Esto sustituye el comportamiento literal del RF-06 de las hojas, que describía un filtrado de cartas en toda la colección.

## Verificación

```bash
npm test -- --watch=false
npm run build
```

TypeScript y las plantillas Angular tienen activado el modo estricto. Las pruebas usan el backend HTTP de pruebas exclusivamente dentro de los archivos `.spec.ts`; la aplicación siempre utiliza la API real. Se comprueban el debounce, repetir una consulta después de borrarla, cancelar peticiones obsoletas y comparar precios numéricos.
