# 🏁 Pit Wall — Fórmula 1 con OpenF1
  M3 Reactor Core
  
## Como probarlo
- **Calendario por temporada** (2023 → actual) con buscador que ignora tildes y mayúsculas
  ("mexico" encuentra "México") y resumen de GP disputados y pendientes.
- **Sesiones del fin de semana** como pestañas; se abre sola la última sesión terminada.
- **Podio y tabla de tiempos**: posición, tiempo, gap, vueltas, mejor vuelta y ritmo medio.
  Abandonos (DNF), no salidas (DNS) y descalificados (DSQ) se muestran aparte.
- **Clasificación provisional**: si OpenF1 todavía no ha publicado el resultado oficial,
  la tabla se calcula ordenando a los pilotos por su mejor vuelta.
- **Estados de carga y error**: semáforo de salida animado mientras carga y "bandera roja"
  con botón de reintentar si algo falla.
- **Bonus — caché en localStorage**: cada respuesta se guarda con fecha de caducidad
  (12 h el calendario, 7 días los tiempos). Una etiqueta indica si los datos vienen
  "Desde caché" o "Recién descargado", y un botón permite vaciarla.

## Uso de IA
  Estoy usando Claude Pro. Le he preguntado sobre como cambiar el desempate por mejor vuelta a menor tiempo acumulado en darlas para clasificaciones provisonales "vale, como cambio ese best lap a la menor suma con mayor num"  vueltas?. 
  También le he preguntado qué podía reutilizar de la misión 2 y la jearquía de carpetas: "necesito una carpeta api, otra de logic, otra de vista? algo más?" Respuesta: "Esas tres más otras tres, todas dentro de src/: api/: las peticiones y la caché. Copias las de tu proyecto. logic/: las transformaciones. También las copias. components/: las vistas. En React se suelen llamar así, aunque views/ también vale. types/: los tipos de la API. Lo copias. hooks/: la carga de datos. Es lo que en tu proyecto hacían loadSeason, selectMeeting y selectSession dentro de main.ts; en React va en funciones aparte, llamadas hooks. styles/: tu CSS." Además me confirmó que podía reutilizar los archivos de lógica, api, types y el css.

## Autopsia
  Al reutilizar la aplicación anterior el primer cambio ha sido cambiar session_name por session_type para discriminar en clasificaciones provisionales y sustituir el desempate de results from laps que usaba vuelta rápida por el acumulado. La ia me propone añadir un tiempo total y le he pedido hacerlo solo en caso necesario ya que cuando hay resultados oficiales no se necesita "no podríamos hacerlo directamente en la función?? cuando sea necesario?" 