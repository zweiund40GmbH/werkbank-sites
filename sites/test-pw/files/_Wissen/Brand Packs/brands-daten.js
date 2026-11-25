/*
 * Brands-Übersicht für das lokale Portal (Seite _Agenten-Team/brands.html)
 * Stand 28.10.2026 · angelegt vom Chef auf Patricks Auftrag · Pflege: Assistenz Anja
 *
 * Hier stehen NUR die eigenen Marken. Kunden-Brands gehören in brands-kunden.js
 * (die Seite lädt sie im Vorführmodus für Seminare gar nicht erst).
 *
 * Eine Brand ergänzen: einen Eintrag in die Liste unten kopieren und anpassen.
 * Am HTML muss nichts geändert werden.
 *
 * Felder:
 *   id         eindeutig, klein, ohne Leerzeichen (z. B. "bigcash")
 *   name       Anzeigename
 *   gruppe     "eigen" (in dieser Datei immer) bzw. "kunde" (nur in brands-kunden.js)
 *   logo       Pfad zur Logo-Datei, relativ zum Ordner "Dev PW" (Kopie im Web-Template, nie das Original bearbeiten)
 *   logoGrund  "hell" oder "dunkel" – Hintergrund, auf dem das Logo stehen darf
 *   logoAlt    Alternativtext des Logos
 *   hinweis    ein bis zwei kurze Sätze: das Wichtigste vor jedem Auftrag
 *   merkmale   kurze Stichpunkte (Anrede, Präfix, Pflichthinweise …)
 *   muster     Pfad zur muster.html, relativ zum Ordner "Dev PW"; null, wenn es noch kein Web-Template gibt
 *   stand      Version und Stand des Web-Templates (oder null)
 *
 * Pfade relativ zu "Dev PW", damit die Seite per Doppelklick (file://) und später
 * über einen lokalen Server mit Wurzel "Dev PW" gleich funktioniert.
 * Diese Datei und brands-kunden.js liegen bewusst außerhalb von Git.
 */
window.PORTAL_BRANDS = [
  {
    id: "zwei40",
    name: "zwei&40",
    gruppe: "eigen",
    logo: "_Wissen/Brand Packs/zwei&40/Web-Template/assets/logo/zweiund40-logo-petrol-1000.png",
    logoGrund: "hell",
    logoAlt: "Logo zwei&40",
    hinweis: "Die Marketing-Zentrale im deutschen Glücksspiel. Patricks Stimme: direkt, locker, praxisnah.",
    merkmale: ["Anrede: Du", "Präfix z40-", "Skill marke-zwei40"],
    muster: "_Wissen/Brand Packs/zwei&40/Web-Template/muster.html",
    stand: "1.0.0 · 26.10.2026"
  },
  {
    id: "shj",
    name: "Spielhallen-Jobs.de",
    gruppe: "eigen",
    logo: "_Wissen/Brand Packs/SHJ/Web-Template/assets/logo/spielhallen-jobs-logo-schwarz-petrol.png",
    logoGrund: "hell",
    logoAlt: "Logo Spielhallen-Jobs.de",
    hinweis: "B2B-Recruiting für Spielhallen und Wettbüros. Standard ist die Ansprache der Betreiber; Bewerberansprache nur auf Auftrag.",
    merkmale: ["Betreiber: Sie", "Präfix shj-", "Skill marke-spielhallen-jobs"],
    muster: "_Wissen/Brand Packs/SHJ/Web-Template/muster.html",
    stand: "1.1.0 · 10.11.2026"
  },
  {
    id: "merlato",
    name: "Merlato",
    gruppe: "eigen",
    logo: "_Wissen/Brand Packs/Merlato/Web-Template/assets/logo/merlato-web-logo-2026-dekra.png",
    logoGrund: "hell",
    logoAlt: "Merlato GmbH – Zertifizierte Schulungseinrichtung. DEKRA-Siegel: Zertifiziert, Qualitätsmanagement ISO 9001",
    hinweis: "DEKRA-zertifizierte Schulungen für Spielerschutz und Prävention. Seriös und ruhig; Logo 2026 und DEKRA-Siegel immer zusammen sichtbar.",
    merkmale: ["Anrede: Sie", "Präfix mer-", "Skill marke-merlato"],
    muster: "_Wissen/Brand Packs/Merlato/Web-Template/muster.html",
    stand: "1.3.0 · 04.11.2026"
  },
  {
    id: "bigcash",
    name: "BIG CASH",
    gruppe: "eigen",
    logo: "_Wissen/Brand Packs/BIG_CASH/Web-Template/assets/logo/bigcash-logo-muenzstapel.png",
    logoGrund: "dunkel",
    logoAlt: "Logo BIG CASH",
    hinweis: "„Hier spielt das Leben.“ Glamourös, humorvoll, 18+. Vor jedem Auftrag klären: BIG CASH oder BIG STAR?",
    merkmale: ["Anrede: Du", "18+", "Präfix bc-", "Skill marke-bigcash"],
    muster: "_Wissen/Brand Packs/BIG_CASH/Web-Template/muster.html",
    stand: "1.1.0 · 10.11.2026"
  },
  {
    id: "bigstar",
    name: "BIG STAR",
    gruppe: "eigen",
    logo: "_Wissen/Brand Packs/BIG_CASH/Web-Template/assets/logo/bigstar-logo.png",
    logoGrund: "dunkel",
    logoAlt: "Logo BIG STAR",
    hinweis: "Schwestermarke von BIG CASH mit denselben Regeln und eigenem Logo. Vor jedem Auftrag klären: BIG CASH oder BIG STAR?",
    merkmale: ["Anrede: Du", "18+", "Präfix bc-", "Skill marke-bigcash"],
    muster: "_Wissen/Brand Packs/BIG_CASH/Web-Template/muster.html",
    stand: "1.1.0 · 10.11.2026"
  },
  {
    id: "ot91",
    name: "OT91 – Old Tablers 91 Delmenhorst",
    gruppe: "eigen",
    logo: "_Wissen/Brand Packs/OT91/Web-Template/assets/logo/ot91-logo-rund-blau-1000.png",
    logoGrund: "hell",
    logoAlt: "Logo Old Tablers 91 Delmenhorst",
    hinweis: "Patricks Service-Club (Old Tablers Deutschland, Distrikt D3), privat und branchenfremd. OT91-Design geht vor OT Deutschland.",
    merkmale: ["Anrede: Du", "Präfix ot91-", "Skill marke-ot91"],
    muster: "_Wissen/Brand Packs/OT91/Web-Template/muster.html",
    stand: "1.1.0 · 09.11.2026"
  }
];
