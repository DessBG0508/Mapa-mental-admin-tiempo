// Mapa mental: "Administración del tiempo en Scrum"
// Caso de estudio: Equilibra TESH
// Contenido basado en la Scrum Guide 2020 y en la información real del proyecto.

export interface MindNode {
  id: string;
  title: string;
  subtitle: string;
  // Guion hablado en lenguaje natural y conversacional (20-40s, ~50-90 palabras)
  script: string;
  // Ejemplo práctico referido al proyecto Equilibra TESH
  example: string;
  // Error común (de preferencia uno real vivido por el equipo)
  commonError: string;
  // Duración aproximada en segundos (estimación a 150 palabras/minuto en español)
  durationSec: number;
}

export interface MindBranch {
  id: string;
  title: string;
  subtitle: string;
  color: string; // hex del acento de la rama
  colorSoft: string; // tono claro para fondos
  script: string;
  durationSec: number;
  children: MindNode[];
}

export const centralNode: MindNode = {
  id: "central",
  title: "Administración del tiempo en Scrum",
  subtitle: "El tiempo como recurso fijo",
  script:
    "Imagina que el tiempo es el único recurso que en Scrum no se puede negociar. En el proyecto Equilibra TESH, el equipo aprendió que administrar el tiempo no significa apurarse, sino proteger eventos cortos y frecuentes para inspeccionar y adaptar. Esa es la base de todo lo que vamos a explorar.",
  example:
    "El equipo TESH reservó los lunes para Planning y los viernes para Review y Retrospective durante todo el semestre.",
  commonError:
    "Confundir 'administrar el tiempo' con 'trabajar más horas' o dormir menos.",
  durationSec: 22,
};

export const branches: MindBranch[] = [
  {
    id: "fundamentos",
    title: "Fundamentos",
    subtitle: "Las tres ideas que sostienen todo",
    color: "#8B5CF6", // morado
    colorSoft: "#EDE9FE",
    script:
      "Los fundamentos son las tres ideas de las que nace todo lo demás en Scrum: el timeboxing, el empirismo y el ciclo de inspección y adaptación. Sin estas tres, los eventos pierden sentido y el equipo corre sin rumbo.",
    durationSec: 20,
    children: [
      {
        id: "timeboxing",
        title: "Timeboxing",
        subtitle: "Una caja de tiempo que no se estira",
        script:
          "El timeboxing consiste en fijar un máximo de tiempo a cada actividad, sin excepción. Imagina una caja: lo que no cabe en la caja, no entra en el sprint. En Equilibra TESH, el Daily Scrum de quince minutos era sagrado, aunque Esmeralda tuviera algo urgente que contar. El timebox protege el foco del equipo.",
        example:
          "El Sprint 4 de TESH duró dos semanas más fines de semana; se alargó el sprint, no el timebox de cada evento.",
        commonError: "Dejar que la Daily se vuelva una reunión de estatus de cuarenta minutos.",
        durationSec: 30,
      },
      {
        id: "empirismo",
        title: "Empirismo",
        subtitle: "El conocimiento viene de la experiencia",
        script:
          "El empirismo dice que el conocimiento nace de la experiencia y de lo que es posible observar. En lugar de planificar todo de una vez, Scrum avanza en pasos pequeños y revisa qué pasó. En TESH, el equipo no diseñó todo el tamizaje antes de programar; prototiparon la charla con Eli sprint a sprint y ajustaron.",
        example:
          "El prototipo conversacional de Eli se probó con usuarios antes de integrar el scoring automático.",
        commonError: "Bloquear el avance esperando un diseño perfecto que nunca llega.",
        durationSec: 28,
      },
      {
        id: "inspeccion-adaptacion",
        title: "Inspección y adaptación",
        subtitle: "Mirar y corregir, una y otra vez",
        script:
          "Inspeccionar es mirar el artefacto o el proceso; adaptar es cambiar lo que sea necesario cuando se detecta una desviación. En TESH, la Retrospective del veintitrés de octubre dejó acuerdos concretos: empezar QA desde el día tres y reservar diez por ciento para refactor. No fueron quejas, fueron ajustes con fecha y responsable.",
        example:
          "El acuerdo A3 reservó el diez por ciento del sprint, unas once horas, para deuda técnica.",
        commonError: "Hacer retrospectivas sin generar acciones con responsable y plazo.",
        durationSec: 29,
      },
    ],
  },
  {
    id: "eventos",
    title: "Eventos y timeboxes",
    subtitle: "Cinco eventos con reloj, más el Sprint",
    color: "#3B82F6", // azul
    colorSoft: "#DBEAFE",
    script:
      "Scrum tiene cinco eventos con timebox, más el propio Sprint como contenedor de todos. Cada uno tiene un propósito distinto; si se salta alguno, se pierde la inspección que necesita el equipo.",
    durationSec: 19,
    children: [
      {
        id: "sprint",
        title: "El Sprint",
        subtitle: "El contenedor de todo",
        script:
          "El Sprint es el contenedor de todo: un mes o menos, con un objetivo claro. En TESH usaron sprints de una a tres semanas según la carga del semestre. Fíjate que el Sprint cero fue de una sola semana para preparar entorno y backlog, y el Sprint cinco llegó a tres semanas por el piloto.",
        example:
          "El Sprint 1, del 14 al 25 de septiembre, incluyó el feriado del 16 de septiembre en el cálculo de capacidad.",
        commonError: "Estirar el sprint sin acuerdo del equipo cuando aparecen retrasos.",
        durationSec: 29,
      },
      {
        id: "planning-daily",
        title: "Sprint Planning y Daily Scrum",
        subtitle: "El lunes se planea, cada día se sincroniza",
        script:
          "El Planning ocurre el primer día y define qué y cómo se trabaja el sprint. La Daily Scrum es de quince minutos cada día laboral. En TESH, Denisse llevaba el Product Goal al Planning y el equipo verificaba capacidad: cuatro personas por diez horas da cuarenta horas semanales. En la Daily se sincronizaban y detectaban bloqueos.",
        example:
          "El lunes de Planning se planearon 70 a 73 horas de carga por sprint, con un colchón de 6 a 37 horas.",
        commonError: "Convertir la Daily en un reporte de estatus para el Scrum Master.",
        durationSec: 32,
      },
      {
        id: "review-retro-refinement",
        title: "Review, Retrospective y Refinamiento",
        subtitle: "El viernes se inspecciona, el backlog se afina siempre",
        script:
          "La Review muestra el incremento a los interesados; la Retrospective revisa el proceso. En TESH ambas caían el viernes final del sprint, una después de la otra. El refinamiento del Product Backlog es continuo y fuera del Planning. En la bitácora del veintitrés de octubre nacieron diez acuerdos, desde GitHub Issues hasta configurar CI/CD.",
        example:
          "El acuerdo extraordinario A-10 incluyó los fines de semana como días laborables desde el Sprint 4.",
        commonError: "Mezclar Review y Retrospective en una sola reunión para 'ahorrar tiempo'.",
        durationSec: 33,
      },
    ],
  },
  {
    id: "roles",
    title: "Roles y responsabilidades",
    subtitle: "Tres roles, tres miradas del tiempo",
    color: "#EC4899", // rosa
    colorSoft: "#FCE7F3",
    script:
      "Hay tres roles con responsabilidades distintas sobre el tiempo. El Product Owner prioriza el valor, el Scrum Master protege el proceso, y los Developers ejecutan y se autoorganizan.",
    durationSec: 20,
    children: [
      {
        id: "product-owner",
        title: "Product Owner",
        subtitle: "El dueño del qué y del porqué",
        script:
          "El Product Owner es el dueño del 'qué' y del 'por qué', y prioriza el backlog para maximizar el valor. En TESH, Denisse defendió el Product Goal todo el semestre: que todo estudiante pueda tamizarse las veinticuatro horas y el psicólogo reciba el expediente pre-procesado. Su trabajo clave era decidir qué no entraba al sprint.",
        example:
          "El backlog versión seis tenía 20 historias: 13 Must, 6 Should, 1 Could, con 170 story points totales.",
        commonError: "Un Product Owner técnico que dice 'cómo' en lugar de 'qué', invadiendo al equipo.",
        durationSec: 32,
      },
      {
        id: "scrum-master",
        title: "Scrum Master",
        subtitle: "Protege el proceso y elimina impedimentos",
        script:
          "El Scrum Master protege los eventos, elimina impedimentos y enseña Scrum. En TESH, Mario como asesor académico era el Scrum Master formal, pero Esmeralda cumplía ese rol en la práctica, día a día. Ella se aseguraba de que la Daily durara quince minutos y de que los acuerdos de la Retro se respetaran.",
        example:
          "El impedimento del traductor de Chrome corrompiendo el SQL Editor se documentó en la bitácora 5.15.",
        commonError: "Un Scrum Master que asigna tareas en lugar de facilitar el proceso.",
        durationSec: 30,
      },
      {
        id: "developers",
        title: "Developers",
        subtitle: "Crean el incremento y se autoorganizan",
        script:
          "Los Developers son quienes crean el incremento cada sprint y se autoorganizan. En TESH eran Sharon en IA y frontend, Esmeralda en backend, y Alexa en QA y documentación. Ellos estimaban la carga, reservaban refactor y decidían cómo cumplir el Sprint Goal. La autonomía técnica era suya.",
        example:
          "El acuerdo A5 organizó una sesión de transferencia de conocimiento entre Sharon y Esmeralda, contra el bus-factor.",
        commonError: "Esperar que el Scrum Master reparta el trabajo 'para que sea justo'.",
        durationSec: 30,
      },
    ],
  },
  {
    id: "artefactos",
    title: "Artefactos y priorización",
    subtitle: "Transparencia para inspeccionar",
    color: "#22C55E", // verde
    colorSoft: "#DCFCE7",
    script:
      "Los artefactos dan transparencia: el Product Backlog, el Sprint Backlog, el incremento y el Definition of Done. La priorización ordena el valor y decide qué se hace primero.",
    durationSec: 19,
    children: [
      {
        id: "backlogs",
        title: "Product Backlog y Sprint Backlog",
        subtitle: "La lista total y el compromiso del sprint",
        script:
          "El Product Backlog es la lista ordenada de todo lo que se necesita; el Sprint Backlog es el subconjunto comprometido para el sprint, más el plan para entregarlo. En TESH, el backlog versión seis cerró cuatro historias críticas del MVP: el acceso, Eli, el tamizaje y la auditoría. El Sprint Backlog se armaba cada Planning con la capacidad real.",
        example:
          "La capacidad máxima planeada era de 26 story points, o 70 a 73 horas por sprint.",
        commonError: "Empezar el sprint sin un Sprint Goal claro que articule el backlog.",
        durationSec: 33,
      },
      {
        id: "definition-of-done",
        title: "Definition of Done",
        subtitle: "Cuándo algo está realmente terminado",
        script:
          "La Definition of Done define cuándo un incremento está realmente terminado, igual para todo el equipo. En TESH, 'hecho' significaba código revisado, pruebas de QA y documentación actualizada. Cuando QA se concentraba el último día, el DoD se cumplía, pero con mucho estrés. Por eso el acuerdo A1 adelantó QA al día tres.",
        example:
          "El acuerdo A1 estandarizó corridas formales de QA desde el día tres del sprint.",
        commonError: "Considerar 'hecho' como 'el código compila y ya lo probé yo'.",
        durationSec: 30,
      },
      {
        id: "valor-moscow",
        title: "Valor y priorización MoSCoW",
        subtitle: "Must, Should, Could, Won't",
        script:
          "El valor ordena el backlog; MoSCoW clasifica en Must, Should, Could y Won't. En TESH, el backlog versión seis dedicaba 13 historias Must con 126 story points y solo una Could. Lo que pasa cuando mezclas prioridades es que el Sprint Goal se vuelve difuso, como cuando el S3 arrastró PB-001 junto con PB-004 y PB-006.",
        example:
          "PB-001, PB-004, PB-006 y PB-015 fueron las cuatro historias cerradas críticas del MVP.",
        commonError: "Marcar todo como Must 'por si acaso', dejando MoSCoW sin poder de decisión.",
        durationSec: 32,
      },
    ],
  },
  {
    id: "tecnicas",
    title: "Técnicas de gestión del tiempo",
    subtitle: "Herramientas para proteger el foco",
    color: "#F59E0B", // ámbar
    colorSoft: "#FEF3C7",
    script:
      "Más allá de Scrum, hay técnicas que ayudan a proteger el foco: los bloques de foco, el límite de trabajo en proceso, la ley de Parkinson, el Pomodoro, MoSCoW y la capacidad real del equipo.",
    durationSec: 22,
    children: [
      {
        id: "foco-wip",
        title: "Bloques de foco y límite WIP",
        subtitle: "Trabajo profundo sin interrupciones",
        script:
          "Los bloques de foco reservan franjas sin interrupciones para trabajo profundo; el límite WIP restringe cuánto trabajo en proceso se acepta. En TESH, Sharon se bloqueaba para programar a Eli sin mirar el celular. El WIP bajo evita el contexto switching, que es el enemigo silencioso del sprint.",
        example:
          "El equipo evitaba tener más de dos historias 'en progreso' simultáneas por persona.",
        commonError: "Abrir cinco historias a la vez 'para no perder el hilo' y no cerrar ninguna.",
        durationSec: 30,
      },
      {
        id: "parkinson-pomodoro",
        title: "Ley de Parkinson y Pomodoro",
        subtitle: "El trabajo se expande; el foco lo frena",
        script:
          "La ley de Parkinson dice que el trabajo se expande hasta llenar el tiempo disponible. El Pomodoro combate eso con veinticinco minutos de foco y cinco de descanso. En TESH, el colchón de 6 a 37 horas del sprint no era para hacer más historias, sino para absorber lo imprevisto sin romper el timebox.",
        example:
          "El Sprint 3 se trabajó al límite: 70 de 80 horas, con colchón mínimo.",
        commonError: "Usar el colchón del sprint para meter historias extra y perder el margen.",
        durationSec: 30,
      },
      {
        id: "moscow-capacidad",
        title: "MoSCoW y capacidad del equipo",
        subtitle: "Prioriza y compromete solo lo posible",
        script:
          "MoSCoW prioriza y la capacidad limita cuánto se compromete. En TESH, la capacidad real eran cuatro personas por diez horas semanales, es decir, ochenta horas en un sprint de dos semanas. La carga máxima planeada era de 26 story points. Cuando el S4 incluyó fines de semana, la capacidad subió a 112 horas.",
        example:
          "El acuerdo A-10 de la Retrospective del 23 de octubre sumó los fines de semana desde el S4.",
        commonError: "Comprometer por arriba de la capacidad histórica 'para quedar bien'.",
        durationSec: 32,
      },
    ],
  },
  {
    id: "metricas",
    title: "Métricas",
    subtitle: "Hacer visible el tiempo, no castigar",
    color: "#06B6D4", // cyan
    colorSoft: "#CFFAFE",
    script:
      "Las métricas hacen visible el tiempo: velocity, cycle time, lead time, burndown, burnup y throughput. Sirven para predecir y conversar, no para castigar al equipo.",
    durationSec: 19,
    children: [
      {
        id: "velocity",
        title: "Velocity",
        subtitle: "Story points completados por sprint",
        script:
          "La velocity es cuántos story points el equipo completa en promedio por sprint. En TESH, con 26 story points de carga máxima y cuatro desarrolladores, la velocity permitía predecir si el Product Goal de fin de semestre era alcanzable. No es un objetivo, es una observación del pasado que ayuda a planear.",
        example:
          "Con 170 story points totales en el backlog, la velocity definía cuántos sprints faltaban.",
        commonError: "Exigir subir la velocity sprint tras sprint como meta de rendimiento.",
        durationSec: 30,
      },
      {
        id: "cycle-lead-time",
        title: "Cycle time y lead time",
        subtitle: "Desde 'en progreso' y desde 'pedida'",
        script:
          "El cycle time mide desde que una historia entra 'en progreso' hasta que está hecha; el lead time, desde que se pide hasta que se entrega. En TESH, cuando QA se concentraba el último día, el cycle time se disparaba aunque el lead time pareciera normal. Por eso el acuerdo A1 adelantó QA al día tres.",
        example:
          "La bitácora del 20 de octubre mostró las corridas formales de QA concentradas en un solo día.",
        commonError: "Mirar solo el lead time y no ver los cuellos de botella internos.",
        durationSec: 31,
      },
      {
        id: "burndown-burnup-throughput",
        title: "Burndown, burnup y throughput",
        subtitle: "Restante, hecho y velocidad de entrega",
        script:
          "El burndown muestra el trabajo restante; el burnup muestra el trabajo hecho contra el total; el throughput es cuántos ítems se terminan por periodo. En TESH, el burndown ayudaba a ver si el sprint iba a cumplir el viernes. El throughput, en ítems por semana, revelaba si el WIP bajo aceleraba o no la entrega.",
        example:
          "El feriado del 16 de septiembre se vio como un día plano en el burndown del S1.",
        commonError: "Usar el burndown para presionar, no para conversar sobre el avance.",
        durationSec: 32,
      },
    ],
  },
  {
    id: "antipatrones",
    title: "Antipatrones",
    subtitle: "Errores reales que el equipo vivió",
    color: "#EF4444", // rojo
    colorSoft: "#FEE2E2",
    script:
      "Los antipatrones son errores recurrentes sobre el tiempo. El equipo TESH vivió varios y los documenta honestamente, para que otros estudiantes no los repitan.",
    durationSec: 19,
    children: [
      {
        id: "reuniones-multitarea",
        title: "Reuniones sin timebox y multitarea",
        subtitle: "Charlas eternas y contexto switching",
        script:
          "Una reunión sin timebox se alarga hasta el agotamiento; la multitarea cambia de tarea antes de terminar. En TESH, cuando el Sprint Goal del S3 se volvió difuso por mezclar PB-001, PB-004 y PB-006, el equipo sintió ambas cosas: reuniones eternas y contexto switching constante.",
        example:
          "El Sprint 3 cerró 70 de 80 horas, casi sin colchón, por falta de foco.",
        commonError: "Agendar 'reuniones para hablar del proyecto' sin agenda ni duración.",
        durationSec: 29,
      },
      {
        id: "interrupciones-sobrecarga",
        title: "Interrupciones y sobrecarga",
        subtitle: "Cuotas, entornos y carga de más",
        script:
          "Las interrupciones rompen el foco; la sobrecarga sube la carga por arriba de la capacidad. En TESH, la dependencia de Google AI Studio causaba interrupciones cuando la cuota gratuita se agotaba. Y el dev server se cayó por dependencias rotas entre bun y npm, un problema de entorno que consumió horas.",
        example:
          "El acuerdo A9 estandarizó npm, no bun, para evitar ese cuello de botella del entorno.",
        commonError: "Aceptar trabajo nuevo a mitad del sprint sin sacar nada del Sprint Backlog.",
        durationSec: 32,
      },
      {
        id: "sprint-goal-difuso",
        title: "Sprint Goal difuso",
        subtitle: "Cuando el sprint no tiene un norte claro",
        script:
          "Un Sprint Goal difuso es cuando el sprint no tiene un objetivo que se pueda resumir en una frase. En TESH, en el S3 se mezcló el cierre de PB-001, arrastrada del S1, con PB-004 y PB-006, y el equipo perdió el norte. El Sprint Goal debe ser único y priorizado para guiar la negociación.",
        example:
          "Desde el S4, cada Planning definió un Sprint Goal de una sola línea antes de comprometer ítems.",
        commonError: "Listar las historias como Sprint Goal en lugar de redactar un objetivo.",
        durationSec: 31,
      },
    ],
  },
  {
    id: "buenas-practicas",
    title: "Buenas prácticas",
    subtitle: "Lo que protege el tiempo sprint a sprint",
    color: "#14B8A6", // teal
    colorSoft: "#CCFBF1",
    script:
      "Frente a los antipatrones, hay prácticas que el equipo TESH adoptó y que protegen el tiempo y el foco sprint a sprint.",
    durationSec: 17,
    children: [
      {
        id: "agenda-parking",
        title: "Agenda y parking lot",
        subtitle: "Temas claros, lo lateral para después",
        script:
          "La agenda enumera los temas y el tiempo de cada uno; el parking lot guarda los temas laterales para después. En TESH, la Daily tenía tres preguntas y nada más; lo que no era para todo el equipo iba al parking y se trataba aparte. Así la reunión terminaba en quince minutos.",
        example:
          "El canal del grupo servía de parking lot asíncrono para lo que no necesitaba la Daily.",
        commonError: "Dejar que cualquier tema 'urgente' secuestre la Daily de todos.",
        durationSec: 29,
      },
      {
        id: "asincronas-foco",
        title: "Reuniones asíncronas y foco",
        subtitle: "Texto o video en diferido",
        script:
          "Las reuniones asíncronas usan texto o video en diferido para no romper el foco; el foco protege el trabajo profundo. En TESH, Alexa documentaba en la bitácora y los demás la leían en su momento. El acuerdo A8 de 'modo incógnito' nació porque el traductor de Chrome corrompía el SQL Editor: foco también es controlar el entorno.",
        example:
          "El modo incógnito evitó que el traductor de Chrome dañara el SQL Editor de Supabase.",
        commonError: "Convocar a una reunión sincrónica para algo que bien iría en un mensaje escrito.",
        durationSec: 33,
      },
      {
        id: "timebox-retro",
        title: "Respeto del timebox y retrospectiva",
        subtitle: "Cerrar a tiempo y convertir el dolor en mejora",
        script:
          "Respetar el timebox es cerrar el evento a tiempo aunque falte tratar algo; la retrospectiva convierte el dolor en mejora. La lección estrella del proyecto TESH dice que 'la regla ítem 9 mayor que 0 en rojo no es decorativa: es la salvaguarda que separa un sistema de salud mental funcional de uno peligroso'. El timebox y la disciplina van juntos.",
        example:
          "La guía Sprint Review más Retrospective del 23 de octubre formalizó esa regla de seguridad.",
        commonError: "Saltarse la Retrospective 'por falta de tiempo' justo cuando más se necesita.",
        durationSec: 35,
      },
    ],
  },
];

// Calcula el total de segundos si se reproducen todos los nodos (centro + ramas + hojas)
export function totalNarrationSeconds(): number {
  const branchTotal = branches.reduce(
    (acc, b) => acc + b.durationSec + b.children.reduce((s, c) => s + c.durationSec, 0),
    0,
  );
  return centralNode.durationSec + branchTotal;
}

// Cuenta nodos explicativos (ramas + hojas)
export function countExplanatoryNodes(): number {
  return branches.reduce((acc, b) => acc + 1 + b.children.length, 0);
}
