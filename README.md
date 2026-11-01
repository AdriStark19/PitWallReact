# 🏁 Pit Wall — Fórmula 1 con OpenF1

  M3 Reactor Core
  **Tecnologías:** React 19 · TypeScript · Vite · Vitest

## Cómo probarlo

```bash
npm install
npm run dev
```
Abre http://localhost:5173. Con `npm test` se ejecutan los tests de logic/ y con `npm run build`
se comprueban los tipos y se genera dist/.

**Qué puedes hacer**
- **Calendario por temporada** (2023 → actual) con buscador que ignora tildes y mayúsculas
  ("mexico" encuentra "México") y resumen de GP disputados y pendientes.
- **Sesiones del fin de semana** como pestañas; se abre sola la última sesión terminada.
- **Podio y tabla de tiempos**: posición, tiempo, gap, vueltas, mejor vuelta y ritmo medio.
  Abandonos (DNF), no salidas (DNS) y descalificados (DSQ) se muestran aparte.
- **Clasificación provisional**: si OpenF1 todavía no ha publicado el resultado oficial,
  la tabla se calcula por mejor vuelta si la sesión no es una carrera; en carrera, por más
  vueltas completadas en menos tiempo acumulado.
- **Estados de carga y error**: semáforo de salida animado mientras carga y "bandera roja"
  con botón de reintentar si algo falla.
- **Caché en localStorage**: cada respuesta se guarda con fecha de caducidad (12 h el
  calendario, 7 días los tiempos). Una etiqueta indica si los datos vienen "Desde caché" o
  "Recién descargado", y un botón permite vaciarla.

**Bonus — custom hooks reutilizables** (`src/hooks/`)
- `useFetch(clave, petición)`: carga genérica con estado de carga, error y reintento.
- `useCachedFetch(clave, petición, { cacheKey, maxAgeMs })`: useFetch con caché en
  localStorage. La usan el calendario, las sesiones y los tiempos.
- `useCache()`: número de entradas en caché, siempre al día, y función para vaciarla.
- `useLocalStorage(clave, inicial)`: como useState, pero sobrevive a recargar. Recuerda la temporada.
- `useSessionData(sesión)`: agrupa las tres cargas de una sesión (pilotos, vueltas y
  resultados) en un único estado con datos, carga, error y reintento

## Uso de IA

- Estoy usando Claude Pro. Le he preguntado sobre como cambiar el desempate por mejor vuelta a menor tiempo acumulado en darlas para clasificaciones provisonales "vale, como cambio ese best lap a la menor suma con mayor num"  vueltas?. 
También le he preguntado qué podía reutilizar de la misión 2 y la jearquía de carpetas: "necesito una carpeta api, otra de logic, otra de vista? algo más?" Respuesta: "Esas tres más otras tres, todas dentro de src/: api/: las peticiones y la caché. Copias las de tu proyecto. logic/: las transformaciones. He estado usando la IA como asistente para migrar las vistas del proyecto anterior con ts al actual usando react y los componentes tsx, pidiendo explicaciones de lo que le he pedido, o corrigiéndome los fallos. Para las partes del return de html más complejo en la mayoría de casos le he pedido que me lo dé.

- Prompt para corregir error del proyecto anterior: "hay que recordar que esto de los rellenados tenía un error para los tiempos de vuelta en casos como 1:00:59.999", además me ha dado un test.ts para probarlo.

- Compactación del proyecto, evitando el abuso de la fragmentación de componentes. Algunos como rowview no se iban a usar jamás por separado.

- Tras la corrección, he usado Claude como guía para aplicar los puntos de mejora de la rúbrica: restaurar StrictMode, extraer la tabla de Standings a TimingTable y agrupar las tres cargas de SessionResults en el hook useSessionData y derivar el estado de useFetch. Le he pedido el código necesario para hacer los cambios y en caso de implicar return de html el código completo para evitar confusiones.

- Ayuda para la implementación de abort controller en lugar de solo ignorar la petición.

- Formato visual del readme.

## Autopsia

- Al reutilizar la aplicación anterior el primer cambio ha sido cambiar session_name por session_type para discriminar en clasificaciones provisionales y sustituir el desempate de results from laps que usaba vuelta rápida por el acumulado. La ia me propone añadir un tiempo total y le he pedido hacerlo solo en caso necesario ya que cuando hay resultados oficiales no se necesita "no podríamos hacerlo directamente en la función?? cuando sea necesario?"

- Aceptar la solución de la IA al problema de formateo de vueltas, ahora primero se hacen los cálculos por separado de horas, minutos y segundos. Tras comprobar con la función de test.

- He pedido una versión compactada para evitar crear componentes que jamás se usarán por separado como "row view". Además he cambiado los 3 hooks que usaban la api por uno genérico que recibe como parámetro los datos que debe recuperar. Además la lógica de caché ha sido movida a un hook para cumplir con el bonus.

- Strict Mode restablecido tras corrección previa.

- Abort Controller implementado sustituyendo la cancelación que solo ignoraba, ahora la petición se cancela realmente.

- Extraje la tabla de tiempos de Standings a su propio componente (TimingTable) y agrupé las tres llamadas a useCachedFetch de SessionResults en el hook useSessionData. SessionResults ya solo decide qué pintar: aviso de sesión futura, error, carga o resultados.

- Cambio para que useFetch solo guarde el último resultado. Así nunca muestra datos de una petición anterior.

- renderBody() de MeetingDetail pasa a ser el componente MeetingSessions: la cabecera solo usa la prop meeting, y la carga, el estado y las pestañas de las sesiones quedan en su propio componente. Quité además el useMemo innecesario de las sesiones.

- Quité los useMemo de Calendar y Standings porque guardaban cálculos que no eran excesivamente pesados.
