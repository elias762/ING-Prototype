import { type Offer, type Project } from './mockData'
import { type Language, t } from '../i18n/translations'

// --- Types ---

export type AmpelColor = 'green' | 'yellow' | 'red'

export interface ScreeningCategory {
  id: string
  name: string
  score: number
  color: AmpelColor
  explanation: string
}

export interface ScreeningResult {
  offerId: string
  overallScore: number
  overallColor: AmpelColor
  overallLabel: string
  summary: string
  categories: ScreeningCategory[]
}

// --- Helpers ---

function getLang(): Language {
  const stored = localStorage.getItem('ing-plan-lang')
  return (stored === 'en' || stored === 'de') ? stored : 'de'
}

function getAmpelColor(score: number): AmpelColor {
  if (score >= 70) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

function getAmpelLabel(color: AmpelColor): string {
  const lang = getLang()
  switch (color) {
    case 'green': return t('screening.recommended', lang)
    case 'yellow': return t('screening.reviewRecommended', lang)
    case 'red': return t('screening.critical', lang)
  }
}

type Discipline = 'Straße' | 'Wasser' | 'RA' | 'Vermessung' | null

const disciplineKeywords: Record<string, Discipline> = {
  'straße': 'Straße',
  'strasse': 'Straße',
  'verkehr': 'Straße',
  'radweg': 'Straße',
  'parkplatz': 'Straße',
  'freianlagen': 'Straße',
  'wasser': 'Wasser',
  'entwässerung': 'Wasser',
  'entwaesserung': 'Wasser',
  'kanal': 'Wasser',
  'regen': 'Wasser',
  'altlast': 'RA',
  'umwelt': 'RA',
  'entflechtung': 'RA',
  'rückbau': 'RA',
  'rueckbau': 'RA',
  'vermessung': 'Vermessung',
  'geodäsie': 'Vermessung',
  'geodaesie': 'Vermessung',
  'kataster': 'Vermessung',
}

function inferDiscipline(offer: Offer): Discipline {
  const text = `${offer.title} ${offer.notes ?? ''}`.toLowerCase()
  for (const [keyword, discipline] of Object.entries(disciplineKeywords)) {
    if (text.includes(keyword)) return discipline
  }
  return null
}

function findClientProjects(client: string, projects: Project[]): Project[] {
  const clientLower = client.toLowerCase()
  return projects.filter(p => p.title.toLowerCase().includes(clientLower))
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function disciplineLabel(d: Discipline): string {
  if (!d) return '?'
  const lang = getLang()
  return t(`discipline.${d}`, lang)
}

// --- Category Calculations ---

function scoreStrategicFit(offer: Offer, allProjects: Project[]): ScreeningCategory {
  const lang = getLang()
  let score = 50
  const reasons: string[] = []

  const clientProjects = findClientProjects(offer.client, allProjects)
  if (clientProjects.length > 0) {
    score += 25
    reasons.push(lang === 'de'
      ? `Bestandskunde mit ${clientProjects.length} Projekt(en)`
      : `Existing client with ${clientProjects.length} project(s)`)
  } else {
    score -= 10
    reasons.push(lang === 'de'
      ? 'Neukunde ohne bestehende Projekte'
      : 'New client without existing projects')
  }

  const discipline = inferDiscipline(offer)
  if (discipline) {
    const ownerDisciplineProjects = allProjects.filter(
      p => p.projectManager === offer.owner && p.discipline === discipline
    )
    if (ownerDisciplineProjects.length > 0) {
      score += 15
      reasons.push(lang === 'de'
        ? `${offer.owner} hat Erfahrung im Bereich ${disciplineLabel(discipline)}`
        : `${offer.owner} has experience in ${disciplineLabel(discipline)}`)
    }
  }

  return {
    id: 'strategic',
    name: t('screening.strategicFit', lang),
    score: clamp(score, 0, 100),
    color: getAmpelColor(clamp(score, 0, 100)),
    explanation: reasons.join('. ') + '.',
  }
}

function scoreCapacity(offer: Offer, allProjects: Project[], allOffers: Offer[]): ScreeningCategory {
  const lang = getLang()
  const activeProjects = allProjects.filter(
    p => p.projectManager === offer.owner && (p.status === 'In Bearbeitung' || p.status === 'Warten' || p.status === 'Nicht begonnen')
  )
  const pipelineOffers = allOffers.filter(
    o => o.owner === offer.owner && o.id !== offer.id && (o.phase === 'Anfrage' || o.phase === 'Analyse' || o.phase === 'Vorbereitung')
  )

  const load = activeProjects.length + pipelineOffers.length
  let score: number
  if (load <= 2) score = 90
  else if (load === 3) score = 75
  else if (load === 4) score = 55
  else if (load === 5) score = 40
  else score = 25

  const pipelinePT = pipelineOffers.reduce((sum, o) => sum + o.effortDays, 0)
  if (pipelinePT > 60) {
    score -= 15
  }

  score = clamp(score, 0, 100)

  const explanation = lang === 'de'
    ? `${offer.owner} hat ${activeProjects.length} aktive Projekte und ${pipelineOffers.length} Angebote in der Pipeline (${pipelinePT} PT).`
    : `${offer.owner} has ${activeProjects.length} active projects and ${pipelineOffers.length} offers in the pipeline (${pipelinePT} PD).`

  return {
    id: 'capacity',
    name: t('screening.capacity', lang),
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

function scoreProfitability(offer: Offer): ScreeningCategory {
  const lang = getLang()
  const pt = offer.effortDays
  let score: number
  let explanation: string

  if (pt >= 15 && pt <= 40) {
    score = 85
    explanation = lang === 'de'
      ? `${pt} PT liegt im optimalen Aufwandsbereich (15–40 PT).`
      : `${pt} PD is within the optimal effort range (15–40 PD).`
  } else if (pt < 5) {
    score = 35
    explanation = lang === 'de'
      ? `${pt} PT ist sehr gering – hoher relativer Verwaltungsaufwand.`
      : `${pt} PD is very low – high relative admin overhead.`
  } else if (pt < 15) {
    score = 55
    explanation = lang === 'de'
      ? `${pt} PT liegt unter dem optimalen Bereich, aber noch akzeptabel.`
      : `${pt} PD is below optimal range but still acceptable.`
  } else if (pt <= 60) {
    score = 75
    explanation = lang === 'de'
      ? `${pt} PT liegt leicht über dem Sweetspot, aber wirtschaftlich vertretbar.`
      : `${pt} PD is slightly above the sweet spot but economically viable.`
  } else {
    score = 65
    explanation = lang === 'de'
      ? `${pt} PT ist ein Großprojekt – höheres Risiko bei Aufwandsschätzung.`
      : `${pt} PD is a large project – higher risk in effort estimation.`
  }

  return {
    id: 'profitability',
    name: t('screening.profitability', lang),
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

function scoreDeadlineRisk(offer: Offer): ScreeningCategory {
  const lang = getLang()
  const now = new Date()
  const deadline = new Date(offer.dueDate)
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const ratio = offer.effortDays > 0 ? diffDays / offer.effortDays : 0

  let score: number
  let explanation: string

  if (diffDays < 0) {
    score = 10
    explanation = lang === 'de'
      ? `Abgabefrist ist bereits überschritten (${Math.abs(diffDays)} Tage überfällig).`
      : `Due date has already passed (${Math.abs(diffDays)} days overdue).`
  } else if (diffDays <= 7) {
    score = 25
    explanation = lang === 'de'
      ? `Nur noch ${diffDays} Tage bis zur Abgabe – sehr enger Zeitrahmen.`
      : `Only ${diffDays} days until submission – very tight timeframe.`
  } else if (diffDays <= 14) {
    score = 45
    explanation = lang === 'de'
      ? `${diffDays} Tage bis zur Abgabe, Zeitrahmen ist knapp.`
      : `${diffDays} days until submission, timeframe is tight.`
  } else if (diffDays <= 30) {
    if (ratio < 1.5) {
      score = 55
      explanation = lang === 'de'
        ? `${diffDays} Tage bei ${offer.effortDays} PT Aufwand – Verhältnis ist eng (${ratio.toFixed(1)}).`
        : `${diffDays} days for ${offer.effortDays} PD effort – ratio is tight (${ratio.toFixed(1)}).`
    } else {
      score = 70
      explanation = lang === 'de'
        ? `${diffDays} Tage bei ${offer.effortDays} PT Aufwand – ausreichend Zeit.`
        : `${diffDays} days for ${offer.effortDays} PD effort – sufficient time.`
    }
  } else {
    score = 90
    explanation = lang === 'de'
      ? `${diffDays} Tage bis zur Abgabe – komfortabler Zeitrahmen.`
      : `${diffDays} days until submission – comfortable timeframe.`
  }

  return {
    id: 'deadline',
    name: t('screening.deadlineRisk', lang),
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

function scoreExpertise(offer: Offer, allProjects: Project[]): ScreeningCategory {
  const lang = getLang()
  const discipline = inferDiscipline(offer)

  if (!discipline) {
    return {
      id: 'expertise',
      name: t('screening.expertise', lang),
      score: 50,
      color: getAmpelColor(50),
      explanation: lang === 'de'
        ? 'Fachgebiet konnte nicht eindeutig ermittelt werden. Manuelle Prüfung empfohlen.'
        : 'Discipline could not be clearly determined. Manual review recommended.',
    }
  }

  const ownerProjects = allProjects.filter(p => p.projectManager === offer.owner)
  const relevantProjects = ownerProjects.filter(p => p.discipline === discipline)

  let score: number
  if (relevantProjects.length >= 3) score = 90
  else if (relevantProjects.length === 2) score = 75
  else if (relevantProjects.length === 1) score = 55
  else score = 30

  const dLabel = disciplineLabel(discipline)
  const explanation = relevantProjects.length > 0
    ? (lang === 'de'
        ? `${offer.owner} hat ${relevantProjects.length} Projekt(e) im Bereich ${dLabel}.`
        : `${offer.owner} has ${relevantProjects.length} project(s) in ${dLabel}.`)
    : (lang === 'de'
        ? `${offer.owner} hat keine Projekte im Bereich ${dLabel}. Einarbeitung nötig.`
        : `${offer.owner} has no projects in ${dLabel}. Onboarding needed.`)

  return {
    id: 'expertise',
    name: t('screening.expertise', lang),
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

function scoreClientRelationship(offer: Offer, allProjects: Project[]): ScreeningCategory {
  const lang = getLang()
  const clientProjects = findClientProjects(offer.client, allProjects)

  if (clientProjects.length === 0) {
    return {
      id: 'relationship',
      name: t('screening.clientRelationship', lang),
      score: 40,
      color: getAmpelColor(40),
      explanation: lang === 'de'
        ? 'Neuer Kunde ohne bestehende Projekthistorie.'
        : 'New client without existing project history.',
    }
  }

  let score = 60 + clientProjects.length * 10

  const overdueCount = clientProjects.filter(p => p.status === 'Überfällig').length
  if (overdueCount > 0) {
    score -= overdueCount * 10
  }

  const completedCount = clientProjects.filter(p => p.status === 'Abgeschlossen').length
  if (completedCount > 0) {
    score += 5
  }

  score = clamp(score, 0, 100)

  const overdueNote = overdueCount > 0
    ? (lang === 'de' ? `, davon ${overdueCount} überfällig` : `, ${overdueCount} overdue`)
    : ''

  const explanation = lang === 'de'
    ? `${clientProjects.length} bestehende(s) Projekt(e) mit ${offer.client}${overdueNote}.`
    : `${clientProjects.length} existing project(s) with ${offer.client}${overdueNote}.`

  return {
    id: 'relationship',
    name: t('screening.clientRelationship', lang),
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

// --- Summary ---

function generateSummary(categories: ScreeningCategory[], overallLabel: string): string {
  const lang = getLang()
  const sorted = [...categories].sort((a, b) => b.score - a.score)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  if (lang === 'de') {
    return `Gesamtbewertung: ${overallLabel}. Stärke: ${best.name} (${best.score} Punkte). Handlungsbedarf: ${worst.name} (${worst.score} Punkte).`
  }
  return `Overall rating: ${overallLabel}. Strength: ${best.name} (${best.score} points). Action needed: ${worst.name} (${worst.score} points).`
}

// --- Main Function ---

const weights: Record<string, number> = {
  strategic: 0.15,
  capacity: 0.20,
  profitability: 0.20,
  deadline: 0.20,
  expertise: 0.15,
  relationship: 0.10,
}

export function calculateScreening(offer: Offer, allProjects: Project[], allOffers: Offer[]): ScreeningResult {
  const categories: ScreeningCategory[] = [
    scoreStrategicFit(offer, allProjects),
    scoreCapacity(offer, allProjects, allOffers),
    scoreProfitability(offer),
    scoreDeadlineRisk(offer),
    scoreExpertise(offer, allProjects),
    scoreClientRelationship(offer, allProjects),
  ]

  const overallScore = Math.round(
    categories.reduce((sum, cat) => sum + cat.score * (weights[cat.id] ?? 0), 0)
  )

  const overallColor = getAmpelColor(overallScore)
  const overallLabel = getAmpelLabel(overallColor)
  const summary = generateSummary(categories, overallLabel)

  return {
    offerId: offer.id,
    overallScore,
    overallColor,
    overallLabel,
    summary,
    categories,
  }
}
