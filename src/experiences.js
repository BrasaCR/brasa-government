import { queryServices } from './services.js';

const TOPICS = {
  water: 'agua',
  health: 'salud',
  education: 'educacion',
  business: 'patente',
  transport: 'transporte',
  housing: 'vivienda'
};

const COPY = {
  en: {
    title: 'Find a public service',
    introduction: 'Choose a topic, review possible matches, and confirm current requirements directly with the responsible authority.',
    steps: [
      ['Choose a topic', 'Select only the general service area you need. Do not enter personal information.'],
      ['Review possible matches', 'BRASA shows links from its existing public catalog; a match is not a determination that the service applies to you.'],
      ['Check the source', 'Open the source and confirm its owner, current requirements, cost, timing, and accessibility options.'],
      ['Continue with the authority', 'Complete any application or transaction only through the responsible authority’s confirmed channel.']
    ],
    noResults: 'No possible catalog match is available for this topic.'
  },
  es: {
    title: 'Encuentre un servicio público',
    introduction: 'Elija un tema, revise posibles coincidencias y confirme los requisitos vigentes directamente con la autoridad responsable.',
    steps: [
      ['Elija un tema', 'Seleccione únicamente el área general que necesita. No ingrese información personal.'],
      ['Revise posibles coincidencias', 'BRASA muestra enlaces de su catálogo público existente; una coincidencia no determina que el servicio le corresponda.'],
      ['Confirme la fuente', 'Abra la fuente y confirme su responsable, requisitos vigentes, costo, plazo y opciones de accesibilidad.'],
      ['Continúe con la autoridad', 'Complete cualquier solicitud o transacción únicamente mediante el canal confirmado de la autoridad responsable.']
    ],
    noResults: 'No hay una posible coincidencia en el catálogo para este tema.'
  }
};

export function serviceNavigator(records, searchParams) {
  const localeValue = searchParams.get('locale') || 'en', locale = localeValue.toLowerCase().startsWith('es') ? 'es' : localeValue.toLowerCase().startsWith('en') ? 'en' : null;
  const topic = searchParams.get('topic') || 'water', countryCode = (searchParams.get('countryCode') || 'CR').toUpperCase(), rawLimit = searchParams.get('limit') || '8';
  if (!locale) return { error: 'invalid_locale', status: 400 };
  if (!(topic in TOPICS)) return { error: 'invalid_topic', status: 400 };
  if (countryCode !== 'CR') return { error: 'country_not_available', status: 400 };
  if (!/^\d+$/.test(rawLimit) || Number(rawLimit) < 1 || Number(rawLimit) > 12) return { error: 'invalid_limit', status: 400 };
  const serviceQuery = new URLSearchParams({ q: TOPICS[topic], countryCode, limit: rawLimit });
  const matches = queryServices(records, serviceQuery);
  if (matches.error) return { error: matches.error, status: 400 };
  const copy = COPY[locale];
  return {
    data: {
      schemaVersion: 1,
      id: 'service-navigator',
      type: 'government-experience',
      locale,
      countryCode,
      topic,
      title: copy.title,
      introduction: copy.introduction,
      steps: copy.steps.map(([title, description], index) => ({ order: index + 1, title, description })),
      services: matches.data,
      noResults: copy.noResults,
      boundaries: {
        informationalOnly: true,
        legalAdvice: false,
        eligibilityDecision: false,
        officialService: false,
        personalDataRequested: false,
        sourceStatus: 'unreviewed-existing-index'
      }
    },
    meta: { topic, countryCode, locale, total: matches.meta.total, limit: Number(rawLimit) }
  };
}
