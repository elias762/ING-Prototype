import { type Offer, type Project } from './mockData'

// --- Typen ---

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

// --- Hilfsfunktionen ---

function getAmpelColor(score: number): AmpelColor {
  if (score >= 70) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

function getAmpelLabel(color: AmpelColor): string {
  switch (color) {
    case 'green': return 'Empfohlen'
    case 'yellow': return 'Prüfung empfohlen'
    case 'red': return 'Kritisch'
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

// --- Kategorie-Berechnungen ---

function scoreStrategicFit(offer: Offer, allProjects: Project[]): ScreeningCategory {
  let score = 50
  const reasons: string[] = []

  // Bestandskunde?
  const clientProjects = findClientProjects(offer.client, allProjects)
  if (clientProjects.length > 0) {
    score += 25
    reasons.push(`Bestandskunde mit ${clientProjects.length} Projekt(en)`)
  } else {
    score -= 10
    reasons.push('Neukunde ohne bestehende Projekte')
  }

  // Disziplin-Passung
  const discipline = inferDiscipline(offer)
  if (discipline) {
    const ownerDisciplineProjects = allProjects.filter(
      p => p.projectManager === offer.owner && p.discipline === discipline
    )
    if (ownerDisciplineProjects.length > 0) {
      score += 15
      reasons.push(`${offer.owner} hat Erfahrung im Bereich ${discipline}`)
    }
  }

  return {
    id: 'strategic',
    name: 'Strategische Passung',
    score: clamp(score, 0, 100),
    color: getAmpelColor(clamp(score, 0, 100)),
    explanation: reasons.join('. ') + '.',
  }
}

function scoreCapacity(offer: Offer, allProjects: Project[], allOffers: Offer[]): ScreeningCategory {
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

  // Malus bei hoher Pipeline-PT
  const pipelinePT = pipelineOffers.reduce((sum, o) => sum + o.effortDays, 0)
  if (pipelinePT > 60) {
    score -= 15
  }

  score = clamp(score, 0, 100)

  const explanation = `${offer.owner} hat ${activeProjects.length} aktive Projekte und ${pipelineOffers.length} Angebote in der Pipeline (${pipelinePT} PT).`

  return {
    id: 'capacity',
    name: 'Kapazität/Ressourcen',
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

function scoreProfitability(offer: Offer): ScreeningCategory {
  const pt = offer.effortDays
  let score: number
  let explanation: string

  if (pt >= 15 && pt <= 40) {
    score = 85
    explanation = `${pt} PT liegt im optimalen Aufwandsbereich (15–40 PT).`
  } else if (pt < 5) {
    score = 35
    explanation = `${pt} PT ist sehr gering – hoher relativer Verwaltungsaufwand.`
  } else if (pt < 15) {
    score = 55
    explanation = `${pt} PT liegt unter dem optimalen Bereich, aber noch akzeptabel.`
  } else if (pt <= 60) {
    score = 75
    explanation = `${pt} PT liegt leicht über dem Sweetspot, aber wirtschaftlich vertretbar.`
  } else {
    score = 65
    explanation = `${pt} PT ist ein Großprojekt – höheres Risiko bei Aufwandsschätzung.`
  }

  return {
    id: 'profitability',
    name: 'Wirtschaftlichkeit',
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

function scoreDeadlineRisk(offer: Offer): ScreeningCategory {
  const now = new Date()
  const deadline = new Date(offer.dueDate)
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const ratio = offer.effortDays > 0 ? diffDays / offer.effortDays : 0

  let score: number
  let explanation: string

  if (diffDays < 0) {
    score = 10
    explanation = `Abgabefrist ist bereits überschritten (${Math.abs(diffDays)} Tage überfällig).`
  } else if (diffDays <= 7) {
    score = 25
    explanation = `Nur noch ${diffDays} Tage bis zur Abgabe – sehr enger Zeitrahmen.`
  } else if (diffDays <= 14) {
    score = 45
    explanation = `${diffDays} Tage bis zur Abgabe, Zeitrahmen ist knapp.`
  } else if (diffDays <= 30) {
    if (ratio < 1.5) {
      score = 55
      explanation = `${diffDays} Tage bei ${offer.effortDays} PT Aufwand – Verhältnis ist eng (${ratio.toFixed(1)}).`
    } else {
      score = 70
      explanation = `${diffDays} Tage bei ${offer.effortDays} PT Aufwand – ausreichend Zeit.`
    }
  } else {
    score = 90
    explanation = `${diffDays} Tage bis zur Abgabe – komfortabler Zeitrahmen.`
  }

  return {
    id: 'deadline',
    name: 'Terminrisiko',
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

function scoreExpertise(offer: Offer, allProjects: Project[]): ScreeningCategory {
  const discipline = inferDiscipline(offer)

  if (!discipline) {
    return {
      id: 'expertise',
      name: 'Fachliche Kompetenz',
      score: 50,
      color: getAmpelColor(50),
      explanation: `Fachgebiet konnte nicht eindeutig ermittelt werden. Manuelle Prüfung empfohlen.`,
    }
  }

  const ownerProjects = allProjects.filter(p => p.projectManager === offer.owner)
  const relevantProjects = ownerProjects.filter(p => p.discipline === discipline)

  let score: number
  if (relevantProjects.length >= 3) score = 90
  else if (relevantProjects.length === 2) score = 75
  else if (relevantProjects.length === 1) score = 55
  else score = 30

  const explanation = relevantProjects.length > 0
    ? `${offer.owner} hat ${relevantProjects.length} Projekt(e) im Bereich ${discipline}.`
    : `${offer.owner} hat keine Projekte im Bereich ${discipline}. Einarbeitung nötig.`

  return {
    id: 'expertise',
    name: 'Fachliche Kompetenz',
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

function scoreClientRelationship(offer: Offer, allProjects: Project[]): ScreeningCategory {
  const clientProjects = findClientProjects(offer.client, allProjects)

  if (clientProjects.length === 0) {
    return {
      id: 'relationship',
      name: 'Kundenbeziehung',
      score: 40,
      color: getAmpelColor(40),
      explanation: 'Neuer Kunde ohne bestehende Projekthistorie.',
    }
  }

  let score = 60 + clientProjects.length * 10

  // Malus für überfällige Projekte beim Kunden
  const overdueCount = clientProjects.filter(p => p.status === 'Überfällig').length
  if (overdueCount > 0) {
    score -= overdueCount * 10
  }

  // Bonus für abgeschlossene Projekte
  const completedCount = clientProjects.filter(p => p.status === 'Abgeschlossen').length
  if (completedCount > 0) {
    score += 5
  }

  score = clamp(score, 0, 100)

  const explanation = `${clientProjects.length} bestehende(s) Projekt(e) mit ${offer.client}${overdueCount > 0 ? `, davon ${overdueCount} überfällig` : ''}.`

  return {
    id: 'relationship',
    name: 'Kundenbeziehung',
    score,
    color: getAmpelColor(score),
    explanation,
  }
}

// --- Zusammenfassung ---

function generateSummary(categories: ScreeningCategory[], overallLabel: string): string {
  const sorted = [...categories].sort((a, b) => b.score - a.score)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  let summary = `Gesamtbewertung: ${overallLabel}. `
  summary += `Stärke: ${best.name} (${best.score} Punkte). `
  summary += `Handlungsbedarf: ${worst.name} (${worst.score} Punkte).`

  return summary
}

// --- Hauptfunktion ---

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
