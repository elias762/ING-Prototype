export type Language = 'de' | 'en'

const translations = {
  // Navigation
  'nav.dashboard': { de: 'Dashboard', en: 'Dashboard' },
  'nav.projects': { de: 'Projekte', en: 'Projects' },
  'nav.offers': { de: 'Angebote', en: 'Offers' },
  'nav.projectManager': { de: 'Projektleiter', en: 'Project Manager' },

  // Topbar
  'topbar.search': { de: 'Suchen...', en: 'Search...' },

  // Disciplines (display names)
  'discipline.Straße': { de: 'Straße', en: 'Road' },
  'discipline.Wasser': { de: 'Wasser', en: 'Water' },
  'discipline.RA': { de: 'RA', en: 'Env.' },
  'discipline.Vermessung': { de: 'Vermessung', en: 'Surveying' },

  // Statuses (display names)
  'status.In Bearbeitung': { de: 'In Bearbeitung', en: 'In Progress' },
  'status.Warten': { de: 'Warten', en: 'On Hold' },
  'status.Überfällig': { de: 'Überfällig', en: 'Overdue' },
  'status.Nicht begonnen': { de: 'Nicht begonnen', en: 'Not Started' },
  'status.Abgeschlossen': { de: 'Abgeschlossen', en: 'Completed' },

  // Offer phases (display names)
  'phase.Anfrage': { de: 'Anfrage', en: 'Request' },
  'phase.Analyse': { de: 'Analyse', en: 'Analysis' },
  'phase.Vorbereitung': { de: 'Vorbereitung', en: 'Preparation' },
  'phase.Abgabe': { de: 'Abgabe', en: 'Submission' },

  // Deadline badges
  'deadline.overdue': { de: 'Überfällig', en: 'Overdue' },
  'deadline.urgent': { de: 'Dringend', en: 'Urgent' },
  'deadline.soon': { de: 'Bald fällig', en: 'Due Soon' },
  'deadline.onTrack': { de: 'Im Plan', en: 'On Track' },
  'deadline.noDefined': { de: 'Keine Frist definiert', en: 'No deadline set' },

  // Dashboard - KPIs
  'dashboard.projectVolume': { de: 'Projektvolumen', en: 'Project Volume' },
  'dashboard.sumAllProjects': { de: 'Summe aller Projekte', en: 'Total of all projects' },
  'dashboard.invoiced': { de: 'Abgerechnet', en: 'Invoiced' },
  'dashboard.ofVolume': { de: 'des Volumens', en: 'of volume' },
  'dashboard.activeProjects': { de: 'Laufende Projekte', en: 'Active Projects' },
  'dashboard.ofTotal': { de: 'gesamt', en: 'total' },
  'dashboard.offerPipeline': { de: 'Angebots-Pipeline', en: 'Offer Pipeline' },
  'dashboard.openOffers': { de: 'offene Angebote', en: 'open offers' },
  'dashboard.critical': { de: 'Kritisch', en: 'Critical' },
  'dashboard.deadlinesLess14': { de: 'Deadlines < 14 Tage', en: 'Deadlines < 14 days' },
  'dashboard.avgProgress': { de: 'Ø Fortschritt', en: 'Avg. Progress' },

  // Dashboard - Quick Filters
  'dashboard.quickFilter': { de: 'Schnellfilter', en: 'Quick Filter' },
  'dashboard.allProjects': { de: 'Alle Projekte', en: 'All Projects' },
  'dashboard.myProjects': { de: 'Meine Projekte', en: 'My Projects' },
  'dashboard.criticalOnly': { de: 'Nur kritische', en: 'Critical Only' },
  'dashboard.projectsCount': { de: 'Projekte', en: 'Projects' },
  'dashboard.offersCount': { de: 'Angebote', en: 'Offers' },

  // Dashboard - Charts
  'dashboard.projectStatusDistribution': { de: 'Projektstatus Verteilung', en: 'Project Status Distribution' },
  'dashboard.billingOverview': { de: 'Abrechnungsübersicht', en: 'Billing Overview' },
  'dashboard.projectsByDiscipline': { de: 'Projekte nach Disziplin', en: 'Projects by Discipline' },
  'dashboard.viewAll': { de: 'Alle anzeigen', en: 'View All' },
  'dashboard.offerPipelineStatus': { de: 'Angebots-Pipeline Status', en: 'Offer Pipeline Status' },
  'dashboard.openPipeline': { de: 'Pipeline öffnen', en: 'Open Pipeline' },
  'dashboard.totalEffort': { de: 'Gesamt Aufwand', en: 'Total Effort' },

  // Dashboard - Deadline & Offer lists
  'dashboard.upcomingDeadlines': { de: 'Nächste Projekt-Deadlines', en: 'Upcoming Project Deadlines' },
  'dashboard.all': { de: 'Alle', en: 'All' },
  'dashboard.noDeadlines': { de: 'Keine anstehenden Deadlines', en: 'No upcoming deadlines' },
  'dashboard.criticalOffers': { de: 'Kritische Angebotsanfragen', en: 'Critical Offer Requests' },
  'dashboard.pipeline': { de: 'Pipeline', en: 'Pipeline' },
  'dashboard.noCriticalOffers': { de: 'Keine kritischen Angebote', en: 'No critical offers' },

  // Dashboard - Financial Footer
  'dashboard.totalProjectVolume': { de: 'Projektvolumen Gesamt', en: 'Total Project Volume' },
  'dashboard.alreadyInvoiced': { de: 'Bereits abgerechnet', en: 'Already Invoiced' },
  'dashboard.stillOpen': { de: 'Noch offen', en: 'Still Open' },
  'dashboard.billingRate': { de: 'Abrechnungsquote', en: 'Billing Rate' },

  // Projects page
  'projects.projects': { de: 'Projekte', en: 'Projects' },
  'projects.totalVolume': { de: 'Gesamtvolumen', en: 'Total Volume' },
  'projects.avgBilling': { de: 'Ø Abrechnung', en: 'Avg. Billing' },
  'projects.overdue': { de: 'Überfällig', en: 'Overdue' },
  'projects.searchPlaceholder': { de: 'Suche nach Projektnummer, Projektname, Projektleiter oder Disziplin...', en: 'Search by project number, name, manager or discipline...' },
  'projects.allDisciplines': { de: 'Alle Disziplinen', en: 'All Disciplines' },
  'projects.allStatus': { de: 'Alle Status', en: 'All Statuses' },
  'projects.deadlineAsc': { de: 'Deadline aufsteigend', en: 'Deadline ascending' },
  'projects.deadlineDesc': { de: 'Deadline absteigend', en: 'Deadline descending' },
  'projects.volumeDesc': { de: 'Projektvolumen absteigend', en: 'Volume descending' },
  'projects.billingDesc': { de: 'Abrechnungsstand absteigend', en: 'Billing descending' },
  'projects.progressDesc': { de: 'Fortschritt absteigend', en: 'Progress descending' },
  'projects.resetFilters': { de: 'Filter zurücksetzen', en: 'Reset Filters' },
  'projects.ofProjects': { de: 'von', en: 'of' },
  'projects.projectsLabel': { de: 'Projekten', en: 'projects' },

  // Projects table headers
  'projects.colProjectNo': { de: 'Projekt-Nr.', en: 'Project No.' },
  'projects.colProjectName': { de: 'Projektname', en: 'Project Name' },
  'projects.colDiscipline': { de: 'Disziplin', en: 'Discipline' },
  'projects.colPM': { de: 'PL', en: 'PM' },
  'projects.colStatus': { de: 'Status', en: 'Status' },
  'projects.colDeadline': { de: 'Deadline', en: 'Deadline' },
  'projects.colProgress': { de: 'Fortschritt', en: 'Progress' },
  'projects.colVolume': { de: 'Volumen', en: 'Volume' },
  'projects.colInvoiced': { de: 'Abgerechnet', en: 'Invoiced' },
  'projects.colBilling': { de: 'Abrechnungsstand', en: 'Billing Status' },
  'projects.overBudget': { de: 'Über Budget', en: 'Over Budget' },

  // Projects empty state
  'projects.noProjectsFound': { de: 'Keine Projekte gefunden', en: 'No projects found' },
  'projects.tryAdjustFilters': { de: 'Versuche die Filter anzupassen oder setze sie zurück.', en: 'Try adjusting or resetting the filters.' },

  // Project detail
  'projectDetail.backToList': { de: 'Zurück zur Projektliste', en: 'Back to Project List' },
  'projectDetail.operationalStatus': { de: 'Operativer Projektstatus', en: 'Operational Project Status' },
  'projectDetail.currentStatus': { de: 'Aktueller Status', en: 'Current Status' },
  'projectDetail.deadline': { de: 'Deadline', en: 'Deadline' },
  'projectDetail.projectProgress': { de: 'Projektfortschritt', en: 'Project Progress' },
  'projectDetail.projectControlling': { de: 'Projektcontrolling', en: 'Project Controlling' },
  'projectDetail.projectVolume': { de: 'Projektvolumen', en: 'Project Volume' },
  'projectDetail.alreadyInvoiced': { de: 'Bereits abgerechnet', en: 'Already Invoiced' },
  'projectDetail.remainingBudget': { de: 'Verbleibendes Budget', en: 'Remaining Budget' },
  'projectDetail.billingStatus': { de: 'Abrechnungsstand', en: 'Billing Status' },
  'projectDetail.noBudget': { de: 'Noch kein Budget hinterlegt', en: 'No budget set yet' },
  'projectDetail.descriptionNotes': { de: 'Projektbeschreibung & Notizen', en: 'Project Description & Notes' },
  'projectDetail.noInfo': { de: 'Keine weiteren Informationen vorhanden', en: 'No additional information available' },
  'projectDetail.projectNotFound': { de: 'Projekt nicht gefunden', en: 'Project not found' },
  'projectDetail.projectManager': { de: 'Projektleiter', en: 'Project Manager' },

  // Project detail - Demo Actions
  'projectDetail.demoActions': { de: 'Demo Quick Actions', en: 'Demo Quick Actions' },
  'projectDetail.demoDescription': { de: 'Diese Aktionen dienen zur Demonstration und ändern die lokalen Daten.', en: 'These actions are for demonstration and modify local data.' },
  'projectDetail.completeProject': { de: 'Projekt abschließen', en: 'Complete Project' },
  'projectDetail.extendDeadline': { de: 'Deadline +7 Tage', en: 'Deadline +7 Days' },
  'projectDetail.addInvoice': { de: 'Rechnung hinzufügen', en: 'Add Invoice' },
  'projectDetail.amountEur': { de: 'Betrag in €', en: 'Amount in €' },
  'projectDetail.add': { de: 'Hinzufügen', en: 'Add' },
  'projectDetail.projectCompleted': { de: 'Dieses Projekt wurde erfolgreich abgeschlossen.', en: 'This project has been successfully completed.' },
  'projectDetail.overBudget': { de: 'Über Budget', en: 'Over Budget' },

  // Offers page
  'offers.total': { de: 'Gesamt', en: 'Total' },
  'offers.inAnalysis': { de: 'In Analyse', en: 'In Analysis' },
  'offers.preparation': { de: 'Vorbereitung', en: 'Preparation' },
  'offers.urgent': { de: 'Dringend (<14d)', en: 'Urgent (<14d)' },
  'offers.effortPT': { de: 'Aufwand (PT)', en: 'Effort (PD)' },
  'offers.pipeline': { de: 'Angebots-Pipeline', en: 'Offer Pipeline' },
  'offers.dragHint': { de: 'Ziehe Karten zwischen Spalten, um den Status zu ändern', en: 'Drag cards between columns to change status' },
  'offers.newRequest': { de: 'Neue Angebotsanfrage', en: 'New Offer Request' },
  'offers.offerRequest': { de: 'Angebotsanfrage', en: 'Offer Request' },
  'offers.dropHere': { de: 'Hier ablegen', en: 'Drop here' },
  'offers.noOffers': { de: 'Keine Angebote', en: 'No offers' },
  'offers.ptEffort': { de: 'PT Aufwand', en: 'PD effort' },

  // Project Detail Modal
  'modal.projectManager': { de: 'Projektleiter', en: 'Project Manager' },
  'modal.teamMembers': { de: 'Teammitglieder', en: 'Team Members' },
  'modal.progress': { de: 'Fortschritt', en: 'Progress' },
  'modal.volume': { de: 'Volumen', en: 'Volume' },
  'modal.projectProgress': { de: 'Projektfortschritt', en: 'Project Progress' },
  'modal.billingStatus': { de: 'Abrechnungsstand', en: 'Billing Status' },
  'modal.overBudget': { de: 'Über Budget', en: 'Over Budget' },
  'modal.financials': { de: 'Finanzdaten', en: 'Financial Data' },
  'modal.projectVolume': { de: 'Projektvolumen', en: 'Project Volume' },
  'modal.invoiced': { de: 'Abgerechnet', en: 'Invoiced' },
  'modal.open': { de: 'Offen', en: 'Open' },
  'modal.notes': { de: 'Notizen', en: 'Notes' },
  'modal.close': { de: 'Schließen', en: 'Close' },
  'modal.edit': { de: 'Bearbeiten', en: 'Edit' },
  'modal.projectDetails': { de: 'Projektdaten', en: 'Project Details' },
  'modal.save': { de: 'Speichern', en: 'Save' },
  'modal.cancel': { de: 'Abbrechen', en: 'Cancel' },
  'modal.title': { de: 'Bezeichnung', en: 'Title' },
  'modal.discipline': { de: 'Disziplin', en: 'Discipline' },
  'modal.status': { de: 'Status', en: 'Status' },
  'modal.deadline': { de: 'Deadline', en: 'Deadline' },
  'modal.invoicedAmount': { de: 'Abgerechnet', en: 'Invoiced' },

  // Offer Detail Modal
  'offerModal.client': { de: 'Auftraggeber', en: 'Client' },
  'offerModal.projectManager': { de: 'Projektleiter', en: 'Project Manager' },
  'offerModal.dueDate': { de: 'Abgabefrist', en: 'Due Date' },
  'offerModal.estimatedEffort': { de: 'Geschätzter Aufwand', en: 'Estimated Effort' },
  'offerModal.personDays': { de: 'Personentage', en: 'Person-days' },
  'offerModal.changePhase': { de: 'Phase ändern', en: 'Change Phase' },
  'offerModal.notes': { de: 'Notizen', en: 'Notes' },
  'offerModal.noNotes': { de: 'Keine Notizen vorhanden', en: 'No notes available' },
  'offerModal.confirmDelete': { de: 'Angebot wirklich löschen?', en: 'Really delete this offer?' },
  'offerModal.delete': { de: 'Löschen', en: 'Delete' },
  'offerModal.close': { de: 'Schließen', en: 'Close' },

  // New Offer Modal
  'newOffer.title': { de: 'Neue Angebotsanfrage', en: 'New Offer Request' },
  'newOffer.client': { de: 'Auftraggeber', en: 'Client' },
  'newOffer.clientPlaceholder': { de: 'z.B. Stadt Bocholt', en: 'e.g. City of Bocholt' },
  'newOffer.offerTitle': { de: 'Angebotsbezeichnung', en: 'Offer Title' },
  'newOffer.offerTitlePlaceholder': { de: 'z.B. Erschließung Neubaugebiet Nord', en: 'e.g. Development of new residential area North' },
  'newOffer.projectManager': { de: 'Projektleiter', en: 'Project Manager' },
  'newOffer.select': { de: 'Auswählen...', en: 'Select...' },
  'newOffer.dueDate': { de: 'Abgabefrist', en: 'Due Date' },
  'newOffer.effortPT': { de: 'Aufwand (PT)', en: 'Effort (PD)' },
  'newOffer.effortPlaceholder': { de: 'z.B. 15', en: 'e.g. 15' },
  'newOffer.notes': { de: 'Notizen', en: 'Notes' },
  'newOffer.optional': { de: 'optional', en: 'optional' },
  'newOffer.notesPlaceholder': { de: 'Zusätzliche Informationen zum Angebot...', en: 'Additional information about the offer...' },
  'newOffer.cancel': { de: 'Abbrechen', en: 'Cancel' },
  'newOffer.createRequest': { de: 'Anfrage erstellen', en: 'Create Request' },
  'newOffer.clientRequired': { de: 'Auftraggeber ist erforderlich', en: 'Client is required' },
  'newOffer.titleRequired': { de: 'Bezeichnung ist erforderlich', en: 'Title is required' },
  'newOffer.pmRequired': { de: 'Projektleiter ist erforderlich', en: 'Project manager is required' },
  'newOffer.dueDateRequired': { de: 'Abgabefrist ist erforderlich', en: 'Due date is required' },
  'newOffer.effortRequired': { de: 'Gültiger Aufwand erforderlich', en: 'Valid effort required' },

  // Screening
  'screening.title': { de: 'KI-Screening', en: 'AI Screening' },
  'screening.ruleBasedAnalysis': { de: 'Regelbasierte Analyse', en: 'Rule-based Analysis' },
  'screening.totalScore': { de: 'Gesamtscore von 100', en: 'Total score out of 100' },

  // Screening labels
  'screening.recommended': { de: 'Empfohlen', en: 'Recommended' },
  'screening.reviewRecommended': { de: 'Prüfung empfohlen', en: 'Review Recommended' },
  'screening.critical': { de: 'Kritisch', en: 'Critical' },

  // Screening categories
  'screening.strategicFit': { de: 'Strategische Passung', en: 'Strategic Fit' },
  'screening.capacity': { de: 'Kapazität/Ressourcen', en: 'Capacity/Resources' },
  'screening.profitability': { de: 'Wirtschaftlichkeit', en: 'Profitability' },
  'screening.deadlineRisk': { de: 'Terminrisiko', en: 'Deadline Risk' },
  'screening.expertise': { de: 'Fachliche Kompetenz', en: 'Expertise' },
  'screening.clientRelationship': { de: 'Kundenbeziehung', en: 'Client Relationship' },

  // New Project Modal
  'newProject.title': { de: 'Neues Projekt', en: 'New Project' },
  'newProject.projectNumber': { de: 'Projektnummer', en: 'Project Number' },
  'newProject.projectNumberPlaceholder': { de: 'z.B. IC25601.1', en: 'e.g. IC25601.1' },
  'newProject.client': { de: 'Auftraggeber', en: 'Client' },
  'newProject.clientPlaceholder': { de: 'z.B. Stadt Bocholt', en: 'e.g. City of Bocholt' },
  'newProject.projectTitle': { de: 'Projektbezeichnung', en: 'Project Title' },
  'newProject.projectTitlePlaceholder': { de: 'z.B. Erschließung Neubaugebiet Nord', en: 'e.g. Development of new residential area North' },
  'newProject.discipline': { de: 'Disziplin', en: 'Discipline' },
  'newProject.projectManager': { de: 'Projektleiter', en: 'Project Manager' },
  'newProject.projectVolume': { de: 'Projektvolumen (€)', en: 'Project Volume (€)' },
  'newProject.projectVolumePlaceholder': { de: 'z.B. 150000', en: 'e.g. 150000' },
  'newProject.serviceScope': { de: 'Leistungsumfang', en: 'Service Scope' },
  'newProject.serviceScopePlaceholder': { de: 'z.B. Verkehrsanlagen und Entwässerung', en: 'e.g. Traffic facilities and drainage' },
  'newProject.commissionedServices': { de: 'Beauftragte Leistungen', en: 'Commissioned Services' },
  'newProject.commissionedServicesPlaceholder': { de: 'z.B. LP1, LP2, LP3 (kommagetrennt)', en: 'e.g. LP1, LP2, LP3 (comma-separated)' },
  'newProject.teamMembers': { de: 'Projektteam', en: 'Team Members' },
  'newProject.plannedDuration': { de: 'Geplante Laufzeit (Tage)', en: 'Planned Duration (Days)' },
  'newProject.plannedDurationPlaceholder': { de: 'z.B. 180', en: 'e.g. 180' },
  'newProject.plannedEffort': { de: 'Geplanter Aufwand (PT)', en: 'Planned Effort (PD)' },
  'newProject.plannedEffortPlaceholder': { de: 'z.B. 45', en: 'e.g. 45' },
  'newProject.notesPlaceholder': { de: 'Zusätzliche Informationen zum Projekt...', en: 'Additional information about the project...' },
  'newProject.createProject': { de: 'Projekt anlegen', en: 'Create Project' },
  'newProject.optionalFields': { de: 'Optionale Angaben', en: 'Optional Fields' },
  'newProject.projectNumberRequired': { de: 'Projektnummer ist erforderlich', en: 'Project number is required' },
  'newProject.titleRequired': { de: 'Bezeichnung ist erforderlich', en: 'Title is required' },
  'newProject.clientRequired': { de: 'Auftraggeber ist erforderlich', en: 'Client is required' },
  'newProject.disciplineRequired': { de: 'Disziplin ist erforderlich', en: 'Discipline is required' },
  'newProject.pmRequired': { de: 'Projektleiter ist erforderlich', en: 'Project manager is required' },
  'newProject.deadlineRequired': { de: 'Deadline ist erforderlich', en: 'Deadline is required' },
  'newProject.volumeRequired': { de: 'Gültiges Projektvolumen erforderlich', en: 'Valid project volume required' },

  // View toggle
  'view.list': { de: 'Liste', en: 'List' },
  'view.kanban': { de: 'Kanban', en: 'Kanban' },

  // Projects kanban
  'projects.dragHint': { de: 'Ziehe Karten zwischen Spalten, um den Status zu ändern', en: 'Drag cards between columns to change status' },
  'projects.dropHere': { de: 'Hier ablegen', en: 'Drop here' },

  // Offers list
  'offers.colTitle': { de: 'Bezeichnung', en: 'Title' },
  'offers.colPhase': { de: 'Phase', en: 'Phase' },
  'offers.colEffort': { de: 'Aufwand', en: 'Effort' },
  'offers.noOffersFound': { de: 'Keine Angebote gefunden', en: 'No offers found' },

  // Language switch
  'language.label': { de: 'Sprache', en: 'Language' },

  // Auth
  'auth.login': { de: 'Anmelden', en: 'Sign In' },
  'auth.email': { de: 'E-Mail', en: 'Email' },
  'auth.emailPlaceholder': { de: 'name@firma.de', en: 'name@company.com' },
  'auth.password': { de: 'Passwort', en: 'Password' },
  'auth.passwordPlaceholder': { de: 'Passwort eingeben', en: 'Enter password' },
  'auth.submit': { de: 'Anmelden', en: 'Sign In' },
  'auth.signingIn': { de: 'Anmeldung...', en: 'Signing in...' },
  'auth.invalidCredentials': { de: 'Ungültige Anmeldedaten', en: 'Invalid credentials' },
  'auth.genericError': { de: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.', en: 'Sign in failed. Please try again.' },
  'auth.logout': { de: 'Abmelden', en: 'Sign Out' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] ?? key
}

export default translations
