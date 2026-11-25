/* =====================================================================================
   Vorführmodus des Portals Agenten-Team (freigegeben von Patrick am 28.10.2026)
   ------------------------------------------------------------------------------------
   Eingebunden im <head> aller Portalseiten (index, agenten-team, leitstand, brands, design-generator)
   per <script src="portal/vorfuehrung.js"></script>, OHNE defer/async: Der Zustand steht so
   fest, bevor der Seiteninhalt gelesen wird, und nichts Geschütztes blitzt auf.

   Zustand
   - Adresse:  ?vorfuehrung=an bzw. ?vorfuehrung=aus setzt den Zustand (und merkt ihn).
   - Speicher: localStorage, Schlüssel "portal-vorfuehrung", Wert "an" (aus = Schlüssel entfernt).
               Jeder Zugriff in try/catch (file://, gesperrter Speicher).
   - Im Vorführmodus hängen alle Links auf die Portalseiten "?vorfuehrung=an" an. So bleibt
     der Zustand auch erhalten, wenn der Speicher nicht verfügbar ist.

   Was das Skript tut
   - <html> bekommt sofort die Klasse "portal-vorfuehrung-an" (CSS blendet damit geschützte
     Bereiche aus, bis sie entfernt sind).
   - window.PortalVorfuehrung.an (true/false) für die Seitenskripte (Brands, Kommandozentrale).
   - Nach dem Laden des Dokuments: Elemente mit data-vorfuehrung="entfernen" werden aus dem DOM
     entfernt; Schalter (data-vorfuehrung-schalter) und Anzeige (data-vorfuehrung-anzeige) werden
     gesetzt.
   - Umschalten lädt die Seite neu: Danach ist der DOM in jedem Fall vollständig bzw. bereinigt.
   - Wird der Modus in einem anderen Tab umgeschaltet, zieht dieser Tab nach (storage-Ereignis),
     ebenso beim Zurückblättern aus dem Browser-Cache (pageshow).

   Keine externen Requests, kein fetch, keine Abhängigkeiten.
   ===================================================================================== */
(function () {
  "use strict";

  var SCHLUESSEL = "portal-vorfuehrung";
  var PARAMETER = "vorfuehrung";
  var KLASSE = "portal-vorfuehrung-an";
  var SEITEN = ["index.html", "agenten-team.html", "leitstand.html", "brands.html", "design-generator.html"];

  /* true/false aus dem Speicher; null, wenn der Speicher nicht lesbar ist */
  function ausSpeicher() {
    try {
      return window.localStorage.getItem(SCHLUESSEL) === "an";
    } catch (fehler) {
      return null;
    }
  }

  function inSpeicher(an) {
    try {
      if (an) window.localStorage.setItem(SCHLUESSEL, "an");
      else window.localStorage.removeItem(SCHLUESSEL);
      return true;
    } catch (fehler) {
      return false;
    }
  }

  /* true/false aus ?vorfuehrung=an|aus; null, wenn nicht angegeben */
  function ausAdresse() {
    var wert = null;
    try {
      wert = new URLSearchParams(window.location.search).get(PARAMETER);
    } catch (fehler) {
      return null;
    }
    if (wert === "an") return true;
    if (wert === "aus") return false;
    return null;
  }

  /* Adresse mit passendem Parameter: an → ?vorfuehrung=an, aus → Parameter entfernt */
  function adresseFuer(an, basis) {
    var url = new URL(basis || window.location.href);
    if (an) url.searchParams.set(PARAMETER, "an");
    else url.searchParams.delete(PARAMETER);
    return url.href;
  }

  /* ---------- Zustand sofort festlegen ---------- */
  var ausDerAdresse = ausAdresse();
  var an;
  if (ausDerAdresse !== null) {
    an = ausDerAdresse;
    inSpeicher(an);
  } else {
    an = ausSpeicher() === true;
  }

  if (an) document.documentElement.classList.add(KLASSE);

  window.PortalVorfuehrung = Object.freeze({ an: an });

  /* ---------- Umschalten: merken und Seite neu laden ---------- */
  function wechsle(zielAn) {
    inSpeicher(zielAn);
    window.location.replace(adresseFuer(zielAn));
  }

  /* Zustand aus einem anderen Tab übernehmen */
  function gleicheAb() {
    var soll = ausSpeicher();
    if (soll !== null && soll !== an) window.location.replace(adresseFuer(soll));
  }

  window.addEventListener("storage", function (ereignis) {
    if (ereignis.key === SCHLUESSEL || ereignis.key === null) gleicheAb();
  });

  window.addEventListener("pageshow", function (ereignis) {
    if (ereignis.persisted) gleicheAb();
  });

  /* ---------- Link auf eine Portalseite im selben Ordner? (keine reinen Sprungmarken) ---------- */
  function istPortalLink(link) {
    var roh = link.getAttribute("href") || "";
    if (roh === "" || roh.charAt(0) === "#") return false;
    var ziel;
    try {
      ziel = new URL(link.href);
    } catch (fehler) {
      return false;
    }
    var ordner = new URL(".", window.location.href).href;
    var datei = ziel.pathname.split("/").pop();
    return new URL(".", ziel.href).href === ordner && SEITEN.indexOf(datei) >= 0;
  }

  /* Relativen Link um ?vorfuehrung=an ergänzen und relativ lassen (keine absoluten Dateipfade im DOM) */
  function mitParameter(roh) {
    var raute = roh.indexOf("#");
    var sprung = raute >= 0 ? roh.slice(raute) : "";
    var ohneSprung = raute >= 0 ? roh.slice(0, raute) : roh;
    var frage = ohneSprung.indexOf("?");
    var pfad = frage >= 0 ? ohneSprung.slice(0, frage) : ohneSprung;
    var parameter = new URLSearchParams(frage >= 0 ? ohneSprung.slice(frage + 1) : "");
    parameter.set(PARAMETER, "an");
    return pfad + "?" + parameter.toString() + sprung;
  }

  /* ---------- nach dem Laden des Dokuments ---------- */
  function einrichten() {
    if (an) {
      /* Geschützte Bereiche aus dem DOM entfernen, nicht nur verstecken */
      Array.prototype.forEach.call(document.querySelectorAll('[data-vorfuehrung="entfernen"]'), function (knoten) {
        knoten.remove();
      });

      /* Links auf die Portalseiten tragen den Zustand weiter */
      Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (link) {
        if (istPortalLink(link)) link.setAttribute("href", mitParameter(link.getAttribute("href")));
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-vorfuehrung-schalter]"), function (knopf) {
      knopf.setAttribute("aria-pressed", String(an));
      var icon = knopf.querySelector(".z40-icon");
      if (icon) {
        icon.classList.toggle("z40-icon--check", an);
        icon.classList.toggle("z40-icon--circle", !an);
      }
      knopf.addEventListener("click", function () { wechsle(!an); });
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-vorfuehrung-anzeige]"), function (anzeige) {
      anzeige.hidden = !an;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einrichten);
  else einrichten();
})();
