// Types
export interface Project {
  id: string
  projectNumber: string
  title: string
  discipline: 'Straße' | 'Wasser' | 'RA' | 'Vermessung'
  projectManager: string
  status: 'In Bearbeitung' | 'Warten' | 'Überfällig' | 'Nicht begonnen' | 'Abgeschlossen'
  deadline: string
  progress: number
  projectVolume: number
  invoicedAmount: number
  notes?: string
}

export interface Offer {
  id: string
  client: string
  title: string
  owner: string
  phase: 'Anfrage' | 'Analyse' | 'Vorbereitung' | 'Abgabe'
  dueDate: string
  effortDays: number
  notes?: string
}

// Projekt-Daten
export const initialProjects: Project[] = [
  {
    id: "p1",
    projectNumber: "IC21709.1",
    title: "Stadt Hamminkeln – Auf Stemmingholt",
    discipline: "Straße",
    projectManager: "Arne",
    status: "In Bearbeitung",
    deadline: "2026-12-10",
    progress: 60,
    projectVolume: 185000,
    invoicedAmount: 92500,
    notes: "LP6 erstellen"
  },
  {
    id: "p2",
    projectNumber: "IC22526.1",
    title: "Ten Brinke – Roederallee",
    discipline: "Straße",
    projectManager: "Arne",
    status: "In Bearbeitung",
    deadline: "2026-12-10",
    progress: 55,
    projectVolume: 320000,
    invoicedAmount: 160000,
    notes: "LP4 Berichte erstellen"
  },
  {
    id: "p3",
    projectNumber: "IC14019.4",
    title: "Stadt Gronau – Tieker Hook / Markenfort",
    discipline: "Straße",
    projectManager: "Arne",
    status: "Überfällig",
    deadline: "2025-11-15",
    progress: 80,
    projectVolume: 450000,
    invoicedAmount: 405000,
    notes: "Planung Lärmschutzwand, wartet auf Stadt"
  },
  {
    id: "p4",
    projectNumber: "IB3401.22_N12",
    title: "Auswertung KI T4 Gießerei",
    discipline: "Wasser",
    projectManager: "David",
    status: "Überfällig",
    deadline: "2025-09-01",
    progress: 70,
    projectVolume: 75000,
    invoicedAmount: 82500,
    notes: "Überfällig seit 2024"
  },
  {
    id: "p5",
    projectNumber: "IC25107.2",
    title: "Goldbeck – Bürogebäude Messe Düsseldorf",
    discipline: "Wasser",
    projectManager: "Florian",
    status: "Nicht begonnen",
    deadline: "2026-05-01",
    progress: 10,
    projectVolume: 890000,
    invoicedAmount: 0,
    notes: "Abschluss LP5 und LP6"
  },
  {
    id: "p6",
    projectNumber: "IC32101.1",
    title: "Oer-Erkenschwick – Kirchstraße & Umfeld",
    discipline: "Wasser",
    projectManager: "David",
    status: "Warten",
    deadline: "2026-02-01",
    progress: 40,
    projectVolume: 210000,
    invoicedAmount: 84000,
    notes: "Vergabegespräch bereits erfolgt"
  },
  {
    id: "p7",
    projectNumber: "IB3401.1",
    title: "Entflechtung Industriefläche",
    discipline: "RA",
    projectManager: "Thomas",
    status: "Warten",
    deadline: "2026-06-01",
    progress: 35,
    projectVolume: 125000,
    invoicedAmount: 37500,
    notes: "Abstimmung mit Umweltamt"
  },
  {
    id: "p8",
    projectNumber: "IC24801.1",
    title: "Gemeinde Südlohn – Eschlohner Straße",
    discipline: "Straße",
    projectManager: "Max",
    status: "In Bearbeitung",
    deadline: "2026-03-15",
    progress: 45,
    projectVolume: 156000,
    invoicedAmount: 62400,
    notes: "LP3 in Bearbeitung"
  },
  {
    id: "p9",
    projectNumber: "IC23105.2",
    title: "Kreis Borken – Radweg K24",
    discipline: "Vermessung",
    projectManager: "Stefan",
    status: "Abgeschlossen",
    deadline: "2025-12-01",
    progress: 100,
    projectVolume: 48000,
    invoicedAmount: 48000,
    notes: "Abgeschlossen und abgerechnet"
  },
  {
    id: "p10",
    projectNumber: "IC25402.1",
    title: "Stadt Bocholt – Innenstadtring",
    discipline: "Straße",
    projectManager: "Arne",
    status: "Nicht begonnen",
    deadline: "2026-08-01",
    progress: 0,
    projectVolume: 520000,
    invoicedAmount: 0,
    notes: "Kick-off steht noch aus"
  },
  {
    id: "p11",
    projectNumber: "IB3502.1",
    title: "Stadtwerke Rhede – Kanalinspektion",
    discipline: "Wasser",
    projectManager: "David",
    status: "In Bearbeitung",
    deadline: "2026-02-28",
    progress: 65,
    projectVolume: 95000,
    invoicedAmount: 71250,
    notes: "Drohnenbefliegung abgeschlossen"
  },
  {
    id: "p12",
    projectNumber: "IC24601.3",
    title: "Ten Brinke – Logistikzentrum Wesel",
    discipline: "RA",
    projectManager: "Thomas",
    status: "In Bearbeitung",
    deadline: "2026-04-30",
    progress: 30,
    projectVolume: 280000,
    invoicedAmount: 56000,
    notes: "Entwässerungskonzept in Abstimmung"
  }
]

// Angebots-Daten
export const initialOffers: Offer[] = [
  {
    id: "b1",
    client: "Ten Brinke",
    title: "Eitelstraße",
    owner: "Arne",
    phase: "Anfrage",
    dueDate: "2026-03-01",
    effortDays: 25,
    notes: "Freianlagen und Entwässerung"
  },
  {
    id: "b2",
    client: "Knappmann",
    title: "Parkplatz Düsseldorf Süd",
    owner: "Arne",
    phase: "Analyse",
    dueDate: "2026-02-15",
    effortDays: 18,
    notes: "Verkehrs- und Entwässerungsplanung"
  },
  {
    id: "b3",
    client: "Gemeinde Heiden",
    title: "Rathausplatz",
    owner: "Max",
    phase: "Vorbereitung",
    dueDate: "2026-04-01",
    effortDays: 30,
    notes: "LP1–LP6 Planung"
  },
  {
    id: "b4",
    client: "PB+C",
    title: "Neubau Boix Emsbüren",
    owner: "Max",
    phase: "Abgabe",
    dueDate: "2026-01-20",
    effortDays: 22,
    notes: "Verkehrsanlagen und Entwässerung"
  },
  {
    id: "b5",
    client: "Stadt Leer",
    title: "Conrebbersweg",
    owner: "Max",
    phase: "Abgabe",
    dueDate: "2025-12-31",
    effortDays: 15,
    notes: "LP1–LP3 bis Ende 2025"
  }
]

// localStorage Helpers
const PROJECTS_KEY = 'ing-plan-projects'
const OFFERS_KEY = 'ing-plan-offers'

export function getProjects(): Project[] {
  const stored = localStorage.getItem(PROJECTS_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  // Speichere initiale Daten beim ersten Laden
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects))
  return initialProjects
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function getOffers(): Offer[] {
  const stored = localStorage.getItem(OFFERS_KEY)
  return stored ? JSON.parse(stored) : initialOffers
}

export function saveOffers(offers: Offer[]): void {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers))
}

// Reset to initial data
export function resetData(): void {
  localStorage.removeItem(PROJECTS_KEY)
  localStorage.removeItem(OFFERS_KEY)
}

// Helper: Berechne Abrechnungsfortschritt
export function calculateBillingProgress(project: Project): number {
  if (project.projectVolume === 0) return 0
  return (project.invoicedAmount / project.projectVolume) * 100
}

// Helper: Formatiere Euro-Wert
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Helper: Deadline Status berechnen
export type DeadlineStatus = 'overdue' | 'urgent' | 'soon' | 'ok'

export function getDeadlineStatus(deadline: string): DeadlineStatus {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'urgent'
  if (diffDays <= 30) return 'soon'
  return 'ok'
}
