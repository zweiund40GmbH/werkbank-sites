/* =====================================================================================
   Design-Generator · Seitenskript (Formular, Vorschau, Kopieren, Speichern)
   ------------------------------------------------------------------------------------
   Needs: window.CANVA_MARKENKITS (data file) and window.DesignGeneratorLogik (logic file).
   Form state is kept in localStorage ("portal-design-generator"), every access in try/catch.
   Only fields that are visible go into the prompt; hidden sections keep their values for later.
   No external requests, no dependencies.
   ===================================================================================== */
(function () {
  "use strict";

  var L = window.DesignGeneratorLogik;
  var SPEICHER = "portal-design-generator";
  var MARKEN = Array.isArray(window.CANVA_MARKENKITS) ? window.CANVA_MARKENKITS.filter(Boolean) : null;

  function $(id) { return document.getElementById(id); }
  var formular = $("dg-formular");

  if (!L || !MARKEN) {
    $("dg-daten-fehler").hidden = false;
    formular.hidden = true;
    $("dg-kopieren").disabled = true;
    return;
  }

  /* ---------- helpers ---------- */
  function option(wert, text) {
    var o = document.createElement("option");
    o.value = wert;
    o.textContent = text;
    return o;
  }

  function fuelleAuswahl(select, werte, leerText) {
    select.textContent = "";
    if (leerText) select.appendChild(option("", leerText));
    werte.forEach(function (w) { select.appendChild(option(w, w)); });
  }

  function radioWert(name) {
    var r = formular.querySelector('input[name="' + name + '"]:checked');
    return r ? r.value : "";
  }

  function setzeRadio(name, wert) {
    Array.prototype.forEach.call(formular.querySelectorAll('input[name="' + name + '"]'), function (r) {
      r.checked = r.value === wert;
    });
  }

  function markeNachName(name) {
    for (var i = 0; i < MARKEN.length; i++) if (MARKEN[i].name === name) return MARKEN[i];
    return null;
  }

  /* ---------- brand list: grouped, filterable, selected brand always stays in the list ---------- */
  function sortiert(gruppe) {
    var liste = MARKEN.filter(function (m) { return m.gruppe === gruppe; });
    if (gruppe === "kunde") liste.sort(function (a, b) { return a.name.localeCompare(b.name, "de"); });
    return liste;
  }

  function baueBrandListe() {
    var select = $("dg-brand");
    var gewaehlt = select.value;
    var suche = $("dg-brand-suche").value.trim().toLocaleLowerCase("de");
    var treffer = 0;

    select.textContent = "";
    select.appendChild(option("", "Bitte wählen"));
    function passt(m) { return !suche || m.name.toLocaleLowerCase("de").indexOf(suche) >= 0; }
    L.GRUPPEN.forEach(function (g) {
      var passend = sortiert(g.id).filter(function (m) { return passt(m) || m.name === gewaehlt; });
      if (!passend.length) return;
      var gruppe = document.createElement("optgroup");
      gruppe.label = g.label;
      passend.forEach(function (m) {
        gruppe.appendChild(option(m.name, m.name));
        if (passt(m)) treffer++;
      });
      select.appendChild(gruppe);
    });
    select.value = markeNachName(gewaehlt) ? gewaehlt : "";
    $("dg-brand-treffer").textContent = suche ? treffer + " von " + MARKEN.length + " Brands passen." : MARKEN.length + " Brands.";
  }

  function zeigeBrandInfo() {
    var m = markeNachName($("dg-brand").value);
    var info = "";
    if (m) {
      var gruppe = L.GRUPPEN.filter(function (g) { return g.id === m.gruppe; })[0];
      info = (gruppe ? gruppe.label : m.gruppe) + " · Branche " + m.branche + " · Skill " + (m.skill || "keiner");
      if (m.branche === "unklar") info += " · Der Chef fragt beim Auftrag nach der Branche.";
    }
    $("dg-brand-info").textContent = info;
  }

  /* ---------- dependent sections ---------- */
  function baueFormatListe() {
    var select = $("dg-format");
    var vorher = select.value;
    select.textContent = "";
    select.appendChild(option("", "Bitte wählen"));
    L.formateFuer(radioWert("medium")).forEach(function (f) { select.appendChild(option(f.id, f.label)); });
    var format = L.formatNachId(vorher);
    select.value = format && format.medium === radioWert("medium") ? vorher : "";
  }

  function aktualisiereSichtbarkeit() {
    var medium = radioWert("medium");
    var format = L.formatNachId($("dg-format").value);
    var anzahl = parseInt($("dg-farbanzahl").value, 10) || 1;

    $("dg-bereich-format").hidden = !medium;
    $("dg-format-info").textContent = format ? "Zielmaß " + format.zielmass + " · Canva-Typ " + format.canvaTyp : "";
    $("dg-bereich-slides").hidden = !(format && format.carousel);
    $("dg-bereich-frei").hidden = radioWert("farbgebung") !== "frei";
    $("dg-bereich-farbe2").hidden = anzahl < 2;
    $("dg-bereich-farbe3").hidden = anzahl < 3;
    $("dg-bereich-caption").hidden = medium !== "online";
    $("dg-bereich-person").hidden = radioWert("person") !== "ja";
    [1, 2, 3].forEach(function (i) { $("dg-farbe" + i + "-wert").textContent = $("dg-farbe" + i).value.toUpperCase(); });
  }

  /* ---------- state ---------- */
  var TEXTFELDER = ["brand", "format", "slides", "farbanzahl", "farbe1", "farbe2", "farbe3", "stimmung", "thema",
    "beschreibung", "headline", "kerntext", "cta", "alter", "geschlecht", "stil", "situation", "zusatz"];
  var HAKEN = ["caption", "markenpruefung"];
  var RADIOS = ["medium", "farbgebung", "person"];

  function zustand() {
    var z = {};
    TEXTFELDER.forEach(function (k) { z[k] = $("dg-" + k).value; });
    HAKEN.forEach(function (k) { z[k] = $("dg-" + k).checked; });
    RADIOS.forEach(function (k) { z[k] = radioWert(k); });
    z.farben = [z.farbe1, z.farbe2, z.farbe3];
    return z;
  }

  function speichere() {
    try { window.localStorage.setItem(SPEICHER, JSON.stringify(zustand())); } catch (fehler) { /* storage unavailable */ }
  }

  function lade() {
    var z = null;
    try { z = JSON.parse(window.localStorage.getItem(SPEICHER) || "null"); } catch (fehler) { z = null; }
    if (!z || typeof z !== "object") return;
    RADIOS.forEach(function (k) { if (typeof z[k] === "string" && z[k]) setzeRadio(k, z[k]); });
    baueFormatListe();
    TEXTFELDER.forEach(function (k) {
      if (typeof z[k] !== "string") return;
      if (k === "brand" && !markeNachName(z[k])) return;
      $("dg-" + k).value = z[k];
    });
    HAKEN.forEach(function (k) { $("dg-" + k).checked = z[k] === true; });
  }

  /* ---------- errors ---------- */
  function feldElement(feld) {
    if (feld === "medium") return formular.querySelector('input[name="medium"]');
    return $("dg-" + feld);
  }

  function zeigeFehler(liste) {
    Array.prototype.forEach.call(formular.querySelectorAll(".z40-field__error"), function (p) {
      p.hidden = true;
      p.textContent = "";
    });
    Array.prototype.forEach.call(formular.querySelectorAll('[aria-invalid="true"]'), function (e) {
      e.removeAttribute("aria-invalid");
    });
    liste.forEach(function (f) {
      var meldung = $("dg-" + f.feld + "-fehler");
      if (meldung) {
        meldung.textContent = f.meldung;
        meldung.hidden = false;
      }
      var ziel = f.feld === "medium" ? $("dg-medium") : $("dg-" + f.feld);
      if (ziel) ziel.setAttribute("aria-invalid", "true");
    });
  }

  var fehlerSichtbar = false;

  /* ---------- preview ---------- */
  function aktualisiere() {
    aktualisiereSichtbarkeit();
    zeigeBrandInfo();
    var z = zustand();
    var marke = markeNachName(z.brand);
    $("dg-prompt").textContent = L.baueAuftrag(z, marke);
    /* after a failed copy attempt, errors follow the input live */
    if (fehlerSichtbar) zeigeFehler(L.pruefe(z, marke));
    speichere();
  }

  /* ---------- copy ---------- */
  function status(text) {
    var s = $("dg-status");
    s.textContent = "";
    window.setTimeout(function () { s.textContent = text; }, 50);
  }

  function kopiereAlt(text) {
    var feld = document.createElement("textarea");
    feld.value = text;
    feld.setAttribute("readonly", "");
    feld.style.position = "fixed";
    feld.style.opacity = "0";
    document.body.appendChild(feld);
    feld.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (fehler) { ok = false; }
    feld.remove();
    return ok;
  }

  function markiereVorschau() {
    var auswahl = window.getSelection();
    var bereich = document.createRange();
    bereich.selectNodeContents($("dg-prompt"));
    auswahl.removeAllRanges();
    auswahl.addRange(bereich);
    $("dg-prompt").focus();
  }

  function fertig(ok) {
    if (ok) status("Prompt kopiert. Jetzt im Chat einfügen.");
    else {
      markiereVorschau();
      status("Kopieren nicht möglich. Der Prompt ist markiert: bitte mit Cmd+C kopieren.");
    }
  }

  function kopiere() {
    var z = zustand();
    var marke = markeNachName(z.brand);
    var fehler = L.pruefe(z, marke);
    fehlerSichtbar = fehler.length > 0;
    zeigeFehler(fehler);
    if (fehler.length) {
      var erstes = feldElement(fehler[0].feld);
      if (erstes) erstes.focus();
      status(fehler.length === 1 ? "1 Angabe fehlt oder ist ungültig. Bitte am markierten Feld ergänzen."
        : fehler.length + " Angaben fehlen oder sind ungültig. Bitte an den markierten Feldern ergänzen.");
      return;
    }
    var text = L.baueAuftrag(z, marke);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { fertig(true); }, function () { fertig(kopiereAlt(text)); });
    } else {
      fertig(kopiereAlt(text));
    }
  }

  function leere() {
    formular.reset();
    $("dg-brand-suche").value = "";
    $("dg-slides").value = String(L.SLIDES_STANDARD);
    fehlerSichtbar = false;
    zeigeFehler([]);
    baueBrandListe();
    baueFormatListe();
    aktualisiere();
    try { window.localStorage.removeItem(SPEICHER); } catch (fehler) { /* storage unavailable */ }
    $("dg-brand-suche").focus();
    status("Formular geleert.");
  }

  /* ---------- start ---------- */
  fuelleAuswahl($("dg-alter"), L.ALTER, "Bitte wählen");
  fuelleAuswahl($("dg-geschlecht"), L.GESCHLECHT);
  fuelleAuswahl($("dg-stil"), L.STIL);
  baueBrandListe();
  lade();
  baueBrandListe();

  $("dg-brand-suche").addEventListener("input", function () { baueBrandListe(); aktualisiere(); });
  formular.addEventListener("change", function (e) {
    if (e.target.name === "medium") baueFormatListe();
    aktualisiere();
  });
  formular.addEventListener("input", aktualisiere);
  formular.addEventListener("submit", function (e) { e.preventDefault(); });
  $("dg-kopieren").addEventListener("click", kopiere);
  $("dg-leeren").addEventListener("click", leere);

  aktualisiere();
})();
