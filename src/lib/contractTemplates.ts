import { uid, type ContractPage } from "@/lib/contracts";

export type ContractTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  title: string;
  /** Cada bloque de texto es una página del documento. */
  pages: string[];
};

const firma = `Firmas

Prestador de servicios
Nombre:
Cargo:
Fecha:

Cliente
Nombre:
Cargo:
Fecha:`;

const partes = (a: string, b: string) => `1. Partes

${a}: [nombre completo o razón social], con domicilio en [dirección] y correo [correo].
${b}: [nombre completo o razón social], con domicilio en [dirección] y correo [correo].

Ambas partes reconocen tener la capacidad legal para celebrar este acuerdo y aceptan las condiciones descritas a continuación.

2. Objeto del contrato

[Describe en una o dos frases el servicio o entregable principal.]

3. Vigencia

Este acuerdo inicia el [fecha de inicio] y concluye el [fecha de término], salvo renovación por escrito entre las partes.`;

const pagos = `4. Contraprestación y forma de pago

Monto total: [monto] [moneda], más los impuestos que apliquen.
Esquema de pago: [anticipo del 50% al firmar y 50% contra entrega / mensualidades / pago único].
Método: transferencia a la cuenta indicada por el prestador.
Plazo de pago: [15] días naturales a partir de la recepción de la factura.

5. Retrasos y penalizaciones

Todo pago no cubierto en tiempo genera un recargo del [3]% mensual sobre el saldo pendiente. El prestador podrá suspender los trabajos hasta regularizar los pagos, sin responsabilidad alguna.`;

const legales = `6. Confidencialidad

Ambas partes se obligan a mantener en reserva la información técnica, comercial y estratégica intercambiada, durante la vigencia del contrato y por [2] años posteriores a su término.

7. Propiedad intelectual

Los entregables se transfieren al cliente una vez liquidado el pago total. El prestador conserva el derecho de mostrar el trabajo en su portafolio, salvo pacto expreso en contrario.

8. Terminación anticipada

Cualquiera de las partes puede terminar el acuerdo avisando por escrito con [15] días de anticipación. El cliente cubrirá el trabajo realizado hasta esa fecha.

9. Ley aplicable

Este contrato se rige por las leyes de [ciudad, país]. Las partes se someten a los tribunales de dicha jurisdicción y renuncian a cualquier otro fuero.`;

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "ugc",
    name: "Creación de contenido UGC",
    category: "Creadores y marcas",
    description: "Videos y fotos para la marca, con licencia de uso definida.",
    title: "Contrato de creación de contenido UGC",
    pages: [
      partes("Creador", "Marca"),
      `4. Entregables

[3] videos verticales de hasta [30] segundos y [5] fotografías en alta resolución.
Formato de entrega: archivos originales sin marca de agua vía [enlace de descarga].
Fecha de entrega: [fecha].

5. Rondas de revisión

Se incluyen [2] rondas de ajustes menores. Cambios de concepto o guion se cotizan por separado.

6. Licencia de uso

La marca puede usar el contenido en [redes sociales orgánicas y pauta digital] durante [6] meses en [México]. Usos adicionales (televisión, exteriores, uso perpetuo) requieren acuerdo y pago extra.

7. Créditos y exclusividad

El creador no realizará contenido para marcas competidoras directas durante [30] días posteriores a la publicación.`,
      pagos,
      legales,
      firma,
    ],
  },
  {
    id: "colaboracion",
    name: "Colaboración con marca",
    category: "Creadores y marcas",
    description: "Campaña con publicaciones, historias y métricas acordadas.",
    title: "Contrato de colaboración comercial",
    pages: [
      partes("Creador", "Marca"),
      `4. Alcance de la campaña

Publicaciones: [1] reel, [2] historias con enlace y [1] carrusel.
Plataformas: [Instagram y TikTok].
Fechas de publicación: [fechas].
Mensajes clave y hashtags obligatorios: [detallar].

5. Aprobaciones

La marca revisa el material con [48] horas de anticipación. Si no hay respuesta en ese plazo, el contenido se considera aprobado.

6. Métricas y reporte

El creador entrega un reporte de alcance, interacciones y clics [7] días después de la última publicación.

7. Permanencia

El contenido permanece publicado al menos [90] días.`,
      pagos,
      legales,
      firma,
    ],
  },
  {
    id: "freelance",
    name: "Servicios freelance",
    category: "Freelance",
    description: "Proyecto puntual con alcance, entregas y pagos claros.",
    title: "Contrato de prestación de servicios profesionales",
    pages: [
      partes("Prestador", "Cliente"),
      `4. Alcance del proyecto

Actividades incluidas: [detallar].
Entregables: [detallar con formato y fecha].
Fuera de alcance: todo aquello no listado arriba; se cotiza como trabajo adicional a [tarifa por hora].

5. Calendario

Etapa 1 — [descripción] — [fecha].
Etapa 2 — [descripción] — [fecha].
Entrega final — [fecha].

6. Responsabilidades del cliente

Entregar accesos, materiales y aprobaciones en un máximo de [3] días hábiles. Los retrasos del cliente recorren el calendario en la misma proporción.`,
      pagos,
      legales,
      firma,
    ],
  },
  {
    id: "agencia-retainer",
    name: "Agencia con iguala mensual",
    category: "Agencia",
    description: "Servicio recurrente con horas, alcance y renovación.",
    title: "Contrato de servicios con iguala mensual",
    pages: [
      partes("Agencia", "Cliente"),
      `4. Servicios incluidos en la iguala

Horas mensuales: [40] horas de equipo.
Servicios: [estrategia, diseño, producción de contenido, reportes].
Reuniones: [1] sesión semanal de seguimiento.

5. Horas adicionales

Las horas que excedan la iguala se facturan a [tarifa] por hora, previa autorización escrita del cliente. Las horas no utilizadas no se acumulan al mes siguiente.

6. Renovación

La iguala se renueva de forma automática cada mes salvo aviso por escrito con [30] días de anticipación.`,
      `4. Contraprestación

Iguala mensual: [monto] [moneda] más impuestos, pagadera los primeros [5] días de cada mes.
Retraso mayor a [10] días permite suspender el servicio sin penalización para la agencia.

5. Equipo asignado

La agencia designa a [roles] y puede sustituirlos manteniendo el mismo nivel de experiencia.`,
      legales,
      firma,
    ],
  },
  {
    id: "diseno",
    name: "Diseño de marca",
    category: "Diseño",
    description: "Identidad visual, revisiones y cesión de derechos.",
    title: "Contrato de diseño de identidad de marca",
    pages: [
      partes("Diseñador", "Cliente"),
      `4. Entregables

Propuestas de logotipo: [3] rutas creativas.
Manual de marca con paleta, tipografías y usos correctos.
Archivos editables en [AI, SVG, PNG, PDF].

5. Revisiones

Se incluyen [2] rondas de ajuste sobre la ruta elegida. Rondas adicionales: [monto] cada una.

6. Cesión de derechos

Una vez liquidado el pago total, el cliente adquiere los derechos patrimoniales del diseño seleccionado. Las propuestas no elegidas permanecen como propiedad del diseñador.`,
      pagos,
      legales,
      firma,
    ],
  },
  {
    id: "software",
    name: "Desarrollo de software",
    category: "Producto digital",
    description: "Alcance técnico, entregas por etapas, soporte y garantía.",
    title: "Contrato de desarrollo de software",
    pages: [
      partes("Desarrollador", "Cliente"),
      `4. Alcance técnico

Producto: [descripción de la aplicación].
Funcionalidades principales: [listar].
Tecnologías: [detallar].
Ambientes: desarrollo, pruebas y producción.

5. Entregas por etapas

Etapa 1 — Definición y prototipo — [fecha].
Etapa 2 — Desarrollo del núcleo — [fecha].
Etapa 3 — Pruebas y despliegue — [fecha].

6. Garantía y soporte

Se corrigen sin costo los errores reportados durante [30] días posteriores al despliegue. El soporte continuo y las nuevas funciones se contratan aparte.

7. Accesos y datos

El cliente es responsable de sus cuentas, licencias y del cumplimiento en el tratamiento de datos personales de sus usuarios.`,
      pagos,
      legales,
      firma,
    ],
  },
  {
    id: "consultoria",
    name: "Consultoría y asesoría",
    category: "Servicios",
    description: "Sesiones, entregables de estrategia y confidencialidad.",
    title: "Contrato de consultoría",
    pages: [
      partes("Consultor", "Cliente"),
      `4. Alcance de la consultoría

Sesiones: [4] sesiones de [60] minutos al mes por videollamada.
Entregables: diagnóstico inicial, plan de acción y seguimiento por escrito.
Canal de comunicación: [correo] con respuesta en un máximo de [24] horas hábiles.

5. Naturaleza del servicio

El consultor aporta recomendaciones basadas en su experiencia; la ejecución y los resultados de negocio dependen del cliente.

6. Cancelación de sesiones

Las sesiones canceladas con menos de [24] horas de aviso se consideran impartidas.`,
      pagos,
      legales,
      firma,
    ],
  },
  {
    id: "cesion-derechos",
    name: "Cesión de derechos de contenido",
    category: "Legal",
    description: "Transferencia de uso de material ya producido.",
    title: "Contrato de cesión de derechos de uso",
    pages: [
      partes("Titular del contenido", "Adquirente"),
      `4. Material cedido

Descripción: [listar piezas, enlaces o identificadores].
Fecha de producción: [fecha].

5. Alcance de la cesión

Territorio: [México / global].
Medios: [digitales, impresos, punto de venta].
Vigencia: [12] meses a partir de la firma, con opción de renovación por [monto].

6. Garantías del titular

El titular declara ser el autor del material, contar con las autorizaciones de las personas que aparecen en él y liberar al adquirente de reclamaciones de terceros.`,
      pagos,
      legales,
      firma,
    ],
  },
];

export const TEMPLATE_CATEGORIES = Array.from(new Set(CONTRACT_TEMPLATES.map((t) => t.category)));

export const templatePages = (template: ContractTemplate): ContractPage[] =>
  template.pages.map((content) => ({ id: uid(), content }));
