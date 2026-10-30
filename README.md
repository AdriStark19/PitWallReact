# 🏁 Pit Wall — Fórmula 1 con OpenF1
  M3 Reactor Core
  
## Como probarlo
- **Calendario por temporada** (2023 → actual) con buscador que ignora tildes y mayúsculas
  ("mexico" encuentra "México") y resumen de GP disputados y pendientes.
- **Sesiones del fin de semana** como pestañas; se abre sola la última sesión terminada.
- **Podio y tabla de tiempos**: posición, tiempo, gap, vueltas, mejor vuelta y ritmo medio.
  Abandonos (DNF), no salidas (DNS) y descalificados (DSQ) se muestran aparte.
- **Clasificación provisional**: si OpenF1 todavía no ha publicado el resultado oficial,
  la tabla se calcula ordenando a los pilotos por su mejor vuelta si el tipo de sesión no es una carrera. En caso de ser carrera más vueltas en menor tiempo.
- **Estados de carga y error**: semáforo de salida animado mientras carga y "bandera roja"
  con botón de reintentar si algo falla.
- **Bonus — caché en localStorage**: cada respuesta se guarda con fecha de caducidad
  (12 h el calendario, 7 días los tiempos). Una etiqueta indica si los datos vienen
  "Desde caché" o "Recién descargado", y un botón permite vaciarla.

## Uso de IA
  Estoy usando Claude Pro. Le he preguntado sobre como cambiar el desempate por mejor vuelta a menor tiempo acumulado en darlas para clasificaciones provisonales "vale, como cambio ese best lap a la menor suma con mayor num"  vueltas?. 
  También le he preguntado qué podía reutilizar de la misión 2 y la jearquía de carpetas: "necesito una carpeta api, otra de logic, otra de vista? algo más?" Respuesta: "Esas tres más otras tres, todas dentro de src/: api/: las peticiones y la caché. Copias las de tu proyecto. logic/: las transformaciones. He estado usando la IA como asistente para migrar las vistas del proyecto anterior con ts al actual usando react y los componentes tsx, pidiendo explicaciones de lo que le he pedido, o corrigiéndome los fallos. Para las partes del return de html más complejo en la mayoría de casos le he pedido que me lo dé.
  Prompt para corregir error del proyecto anterior: "hay que recordar que esto de los rellenados tenía un error para los tiempos de vuelta en casos como 1:00:59.999", además me ha dado un test.ts para probarlo.


## Autopsia
  Al reutilizar la aplicación anterior el primer cambio ha sido cambiar session_name por session_type para discriminar en clasificaciones provisionales y sustituir el desempate de results from laps que usaba vuelta rápida por el acumulado. La ia me propone añadir un tiempo total y le he pedido hacerlo solo en caso necesario ya que cuando hay resultados oficiales no se necesita "no podríamos hacerlo directamente en la función?? cuando sea necesario?"
  Aceptar la solución de la IA al problema de formateo de vueltas, ahora primero se hacen los cálculos por separado de horas, minutos y segundos. Tras comprobar con la función de test.
  Renombré los hooks: la IA los llamó useSeason y useSessions, nombres demasiado parecidos que me
  confundían. Los cambié a useMeetings y useSessions, para que coincidan con lo que cargan y con las
  funciones de la API que usan (getMeetings y getSessions).
  Quité StrictMode de main.tsx: solo actúa en desarrollo y no cambia nada para el usuario. A cambio
  pierdo sus comprobaciones, como ejecutar dos veces los efectos para detectar los que no se limpian;
  mis hooks ya cancelan las peticiones viejas con su función de limpieza.  
  