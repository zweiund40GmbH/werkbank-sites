/* =====================================================================================
   Design-Generator · Logik (ohne DOM)
   ------------------------------------------------------------------------------------
   Formattabelle, Prüfung der Eingaben und Aufbau des Prompts "CANVA-AUFTRAG (Design-Generator)".
   Quelle der Formattabelle: zwei&40/Canva-Design-Generator/Ablauf-Canva-Auftrag.md (Stand 09.11.2026).
   Ändert sich die Tabelle dort, wird NUR die Liste FORMATE unten angepasst.

   Läuft im Browser (window.DesignGeneratorLogik) und in Node (module.exports) für Selbsttests.
   Keine externen Requests, keine Abhängigkeiten.
   ===================================================================================== */
(function (root) {
  "use strict";

  var MEDIEN = [
    { id: "online", label: "Online" },
    { id: "druck", label: "Druck" },
    { id: "bildschirm", label: "Bildschirm (micast)" }
  ];

  /* One row per line of the format table. carousel: true enables the slide count. */
  var FORMATE = [
    { id: "ig-post-4-5", medium: "online", label: "Instagram Post 4:5", zielmass: "1080 × 1350 px", canvaTyp: "instagram_post" },
    { id: "ig-post-1-1", medium: "online", label: "Instagram Post 1:1", zielmass: "1080 × 1080 px", canvaTyp: "instagram_post" },
    { id: "ig-carousel-4-5", medium: "online", label: "Instagram Carousel 4:5", zielmass: "1080 × 1350 px je Slide", canvaTyp: "instagram_post × n", carousel: true },
    { id: "ig-story-9-16", medium: "online", label: "Instagram Story / Reel-Titel 9:16", zielmass: "1080 × 1920 px", canvaTyp: "your_story" },
    { id: "facebook-post", medium: "online", label: "Facebook Post", zielmass: "1080 × 1350 px [Annahme]", canvaTyp: "facebook_post" },
    { id: "linkedin-post", medium: "online", label: "LinkedIn Post", zielmass: "1080 × 1080 px [Annahme]", canvaTyp: "instagram_post" },
    { id: "whatsapp-kanal", medium: "online", label: "WhatsApp-Kanal", zielmass: "1080 × 1080 px [Annahme]", canvaTyp: "instagram_post" },
    { id: "youtube-thumbnail", medium: "online", label: "YouTube-Thumbnail", zielmass: "1280 × 720 px", canvaTyp: "youtube_thumbnail" },
    { id: "micast-quer", medium: "bildschirm", label: "micast quer", zielmass: "1920 × 1080 px", canvaTyp: "desktop_wallpaper" },
    { id: "micast-hochkant", medium: "bildschirm", label: "micast hochkant", zielmass: "1080 × 1920 px", canvaTyp: "your_story" },
    { id: "din-a4", medium: "druck", label: "DIN A4 hoch", zielmass: "210 × 297 mm", canvaTyp: "flyer" },
    { id: "din-a3", medium: "druck", label: "DIN A3 hoch", zielmass: "297 × 420 mm", canvaTyp: "poster" },
    { id: "din-a1", medium: "druck", label: "DIN A1 hoch", zielmass: "594 × 841 mm", canvaTyp: "poster" },
    { id: "flyer-din-lang", medium: "druck", label: "Flyer DIN lang", zielmass: "99 × 210 mm", canvaTyp: "flyer" },
    { id: "aufsteller", medium: "druck", label: "Aufsteller", zielmass: "[PLATZHALTER: Maß klären, Annahme DIN A1]", canvaTyp: "poster" }
  ];

  var GRUPPEN = [
    { id: "eigen", label: "Eigene Marken" },
    { id: "kunde", label: "Kunden" },
    { id: "privat", label: "Privat" }
  ];

  var ALTER = ["25–35", "35–50", "50–65", "65+"];
  var GESCHLECHT = ["egal", "weiblich", "männlich"];
  var STIL = ["egal", "elegant", "sportlich", "business", "casual"];

  var SLIDES_MIN = 2;
  var SLIDES_MAX = 10;
  var SLIDES_STANDARD = 5;
  var THEMA_MAX = 120;

  function formatNachId(id) {
    for (var i = 0; i < FORMATE.length; i++) if (FORMATE[i].id === id) return FORMATE[i];
    return null;
  }

  function formateFuer(medium) {
    return FORMATE.filter(function (f) { return f.medium === medium; });
  }

  function mediumLabel(id) {
    for (var i = 0; i < MEDIEN.length; i++) if (MEDIEN[i].id === id) return MEDIEN[i].label;
    return "";
  }

  /* Single-line value: trim, collapse all whitespace (incl. line breaks) */
  function zeile(wert) {
    return String(wert == null ? "" : wert).replace(/\s+/g, " ").trim();
  }

  /* Multi-line value in one prompt line: line breaks become " / ", empty lines dropped */
  function mehrzeilig(wert) {
    return String(wert == null ? "" : wert)
      .split(/\r?\n/)
      .map(zeile)
      .filter(function (t) { return t !== ""; })
      .join(" / ");
  }

  function istHexFarbe(wert) {
    return /^#[0-9a-fA-F]{6}$/.test(String(wert || ""));
  }

  /* Normalised view of the raw form state: only relevant fields survive */
  function bereinige(daten) {
    var d = daten || {};
    var format = formatNachId(d.format);
    if (format && format.medium !== d.medium) format = null;
    var frei = d.farbgebung === "frei";
    var anzahlFarben = Math.min(3, Math.max(1, parseInt(d.farbanzahl, 10) || 1));
    var person = d.person === "ja";
    return {
      medium: mediumLabel(d.medium) ? d.medium : "",
      format: format,
      slides: format && format.carousel ? String(d.slides == null || d.slides === "" ? SLIDES_STANDARD : d.slides).trim() : null,
      frei: frei,
      farben: frei ? (d.farben || []).slice(0, anzahlFarben).map(function (f) { return zeile(f).toUpperCase(); }) : [],
      stimmung: frei ? zeile(d.stimmung) : "",
      thema: zeile(d.thema),
      beschreibung: mehrzeilig(d.beschreibung),
      headline: zeile(d.headline),
      kerntext: mehrzeilig(d.kerntext),
      cta: zeile(d.cta),
      caption: Boolean(d.caption) && d.medium === "online",
      person: person,
      alter: person ? zeile(d.alter) : "",
      geschlecht: person ? zeile(d.geschlecht) : "",
      stil: person ? zeile(d.stil) : "",
      situation: person ? zeile(d.situation) : "",
      zusatz: person ? mehrzeilig(d.zusatz) : "",
      markenpruefung: Boolean(d.markenpruefung)
    };
  }

  /* Returns a list of { feld, meldung }. feld matches the field keys of the form state. */
  function pruefe(daten, marke) {
    var b = bereinige(daten);
    var fehler = [];
    function f(feld, meldung) { fehler.push({ feld: feld, meldung: meldung }); }

    if (!marke) f("brand", "Bitte eine Brand auswählen.");
    if (!b.medium) f("medium", "Bitte ein Medium wählen: Online, Druck oder Bildschirm.");
    else if (!b.format) f("format", "Bitte ein Format wählen.");
    if (b.format && b.format.carousel) {
      var n = Number(b.slides);
      if (!/^\d+$/.test(b.slides) || n < SLIDES_MIN || n > SLIDES_MAX) {
        f("slides", "Bitte eine ganze Zahl von " + SLIDES_MIN + " bis " + SLIDES_MAX + " eingeben.");
      }
    }
    if (b.frei) {
      b.farben.forEach(function (farbe, i) {
        if (!istHexFarbe(farbe)) f("farbe" + (i + 1), "Bitte eine Farbe im Format #RRGGBB wählen.");
      });
    }
    if (!b.thema) f("thema", "Bitte ein Thema eingeben, z. B. „Halloween“.");
    else if (b.thema.length > THEMA_MAX) f("thema", "Bitte das Thema auf höchstens " + THEMA_MAX + " Zeichen kürzen.");
    if (!b.beschreibung) f("beschreibung", "Bitte kurz beschreiben, was das Design zeigen soll.");
    if (b.person && ALTER.indexOf(b.alter) < 0) f("alter", "Bitte ein Alter für die Person wählen.");
    return fehler;
  }

  /* Builds the prompt. Missing required values appear as "[fehlt]" so the live preview stays readable. */
  function baueAuftrag(daten, marke) {
    var b = bereinige(daten);
    var FEHLT = "[fehlt]";
    var z = [];

    z.push("CANVA-AUFTRAG (Design-Generator)");
    z.push("Ablauf: zwei&40/Canva-Design-Generator/Ablauf-Canva-Auftrag.md");

    if (marke) {
      z.push("Brand: " + zeile(marke.name) + " · Kit " + zeile(marke.kit) + " · Gruppe " + zeile(marke.gruppe) +
        " · Branche " + zeile(marke.branche) + " · Skill " + (marke.skill ? zeile(marke.skill) : "keiner"));
      z.push("Maßgeblich: Marken-Skill vor Brand Pack vor Canva-Kit (Canva-Kits oft unvollständig)");
    } else {
      z.push("Brand: " + FEHLT);
    }

    var medium = "Medium: " + (b.medium ? mediumLabel(b.medium) : FEHLT);
    if (b.format) {
      medium += " · Format: " + b.format.label + " · Zielmaß: " + b.format.zielmass + " · Canva-Typ: " + b.format.canvaTyp;
      if (b.format.carousel) medium += " · Slides: " + (b.slides || FEHLT);
    } else {
      medium += " · Format: " + FEHLT;
    }
    z.push(medium);

    if (b.frei) {
      var farben = b.farben.filter(function (f) { return f !== ""; }).join(", ");
      z.push("Farbgebung: Frei: " + (farben || FEHLT) + (b.stimmung ? " · Stimmung: " + b.stimmung : ""));
    } else {
      z.push("Farbgebung: Marke (laut Skill/Brand Pack)");
    }

    z.push("Thema: " + (b.thema || FEHLT));
    z.push("Beschreibung: " + (b.beschreibung || FEHLT));
    if (b.headline) z.push("Headline-Vorgabe: " + b.headline);
    if (b.kerntext) z.push("Kerntext-Vorgabe: " + b.kerntext);
    if (b.cta) z.push("CTA-Vorgabe: " + b.cta);
    z.push("Texte: Tabea schreibt fehlende Texte" + (b.caption ? " · Caption mitliefern" : ""));

    if (b.person) {
      var p = ["Person: ja", "Alter " + (b.alter || FEHLT)];
      if (b.geschlecht) p.push("Geschlecht " + b.geschlecht);
      if (b.stil) p.push("Stil " + b.stil);
      if (b.situation) p.push("Situation " + b.situation);
      if (b.zusatz) p.push("Zusatz " + b.zusatz);
      z.push(p.join(" · "));
    } else {
      z.push("Person: nein");
    }

    z.push("Erweiterte Markenprüfung: " + (b.markenpruefung ? "ja" : "nein"));
    return z.join("\n");
  }

  var api = Object.freeze({
    MEDIEN: MEDIEN,
    FORMATE: FORMATE,
    GRUPPEN: GRUPPEN,
    ALTER: ALTER,
    GESCHLECHT: GESCHLECHT,
    STIL: STIL,
    SLIDES_MIN: SLIDES_MIN,
    SLIDES_MAX: SLIDES_MAX,
    SLIDES_STANDARD: SLIDES_STANDARD,
    THEMA_MAX: THEMA_MAX,
    formatNachId: formatNachId,
    formateFuer: formateFuer,
    pruefe: pruefe,
    baueAuftrag: baueAuftrag
  });

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DesignGeneratorLogik = api;
})(this);
