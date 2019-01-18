import {kursHinzufuegen, kursInsDOM, kursLoeschen, kursAendern} from "./kurs";
import {message, ausDOMentfernen} from "./app";

export function Sektor(name, punkte, kurse, benotet) {
    this.name = name;
    this.punkteZiel = Number(punkte) || NaN;
    this.kurseZiel = Number(kurse) || NaN;
    this.kurseBenotet = Number(benotet) || this.kurseZiel;
    if (0 < this.kurseBenotet && this.kurseBenotet < kurse)
        this.besteKurse = [];
    this.kurse = [];
    this.punkte = 0;
    this.notenSumme = 0.0;
}

export function holSektoren() {
    var sectorArray = localStorage.getItem('sectorArray');
    if (!sectorArray) {
        sectorArray = [];
        localStorage.setItem('sectorArray', JSON.stringify(sectorArray));
    } else {
        sectorArray = JSON.parse(sectorArray);
    }
    return sectorArray;
}

export function neuerSektor(){
    var sektorName = $('#sektorEingabe').val();
    var pZiel = $('#AnzahlPunkte').val();
    var kZiel = $('#AnzahlKurse').val();
    var kbenotet = $('#BenoteteKurse').val();
    var sektorArray = holSektoren();

    /* Error handling */
    if (sektorName == "") return message("Please insert a sector name.");
    if (sektorArray.indexOf(sektorName) > -1) return message("Error: Sector name is taken.");
    if (kbenotet > kZiel)
        return message("Error: You cannot have more graded courses than target courses");

    var sektor = new Sektor(sektorName, pZiel, kZiel, kbenotet);
    localStorage.setItem(sektor.name, JSON.stringify(sektor));
    sektorArray.push(sektor.name);
    localStorage.setItem('sectorArray', JSON.stringify(sektorArray));
    sektorInTabelle(sektor, neueTabelle(sektorName));

    $('#sektorEingabe').val('');
    $('#AnzahlPunkte').val('');
    $('#AnzahlKurse').val('');
    $('#BenoteteKurse').val('');
    $('#KursSektor').append("<option>"+sektorName+"</option>");
}

export function kopfAktualisieren(sektorName) {
    var sektor = JSON.parse(localStorage.getItem(sektorName));
    var thName = $('#'+sektorName).find('th').first();
    var thPunkte = $(thName).next();
    var thNote = $(thPunkte).next();

    /* Calculations */
    var kurseBruch = (sektor.kurseZiel) ?
        sektor.kurse.length+"/"+sektor.kurseZiel : sektor.kurse.length;
    $(thName).text(kurseBruch+" Courses");

    var punkteBruch = (sektor.punkteZiel) ?
        sektor.punkte+"/"+sektor.punkteZiel : sektor.punkte;
    $(thPunkte).text(punkteBruch);

    var notenSchnitt = 0;
    if (sektor.besteKurse) {
        var punkteSumme = 0;
        for (var i = 0; i < sektor.besteKurse.length; i++) {
            punkteSumme += sektor.besteKurse[i][1];
        }
        notenSchnitt = (sektor.notenSumme/punkteSumme).toFixed(2);
    } else {
        notenSchnitt = (sektor.notenSumme/sektor.punkte).toFixed(2);
    }

    /* Ergebnisse speichern */
    if (notenSchnitt == NaN) notenSchnitt = "Grade";
    $(thNote).text(notenSchnitt);
    if (sektor.kurseBenotet = 0) $(thNote).css({'color': "grey"});
}

export function neueTabelle(sektorName) {
    var tabelle = document.createElement('table');
    $(tabelle).attr({'id': sektorName,
                     'class': "pure-table pure-table-horizontal"});

    /* Tabelle in Spalte 1 oder 2? */
    var c1 = $('#c1');
    var c2 = $('#c2');
    var spalte = (c1.find('tr').length <= c2.find('tr').length)
        ? c1 : c2;
    spalte.append(tabelle);

    return tabelle;
}

export function sektorInTabelle(sektor, tabelle) {
    var kurse = sektor.kurse;
    var titel = document.createElement('caption');
    var aendern = document.createElement('button');
    var kopf = document.createElement('thead');
    var kopfzeile = document.createElement('tr');
    var thKurse = document.createElement('th');
    var thPunkte = document.createElement('th');
    var thNote = document.createElement('th');
    var koerper = document.createElement('tbody');

    $(titel).text(sektor.name);
    $(aendern)
        .attr({'class': "aenderButton tooltip"})
        .text('\u{1f589}')
        .click(function() { aenderungsModus(sektor.name); })
        .append("<span class=\"tooltiptext\">change sector</span>");

    $(tabelle).append(titel, kopf, koerper);
    titel.appendChild(aendern);
    kopf.appendChild(kopfzeile);
    $(kopfzeile).append(thKurse, thPunkte, thNote);
    for (var i = 0; i < kurse.length; i++) {
        var kursName = kurse[i];
        var kurs = JSON.parse(localStorage[kursName]);
        kursInsDOM(sektor.name, kurs);
    }
    kopfAktualisieren(sektor.name);
}

function aenderungsModus(sektorName) {
    var tabelle = document.getElementById(sektorName);
    var titel = tabelle.firstChild;
    var zeilen = $(tabelle.lastChild).children();
    var th = document.createElement('th');
    var td2 = document.createElement('td');
    var abbruch = titel.lastChild;
    var fertig = document.createElement('button');
    var loeschAll = document.createElement('button');
    var loeschen = document.createElement('button');
    var changed = [];
    var nameChanged = [];

    /* Buttons */
    $(loeschen)
        .attr({'class': "loeschButton", 'title':"remove course"})
        .text('\u{2715}')
        .click(function(event) {
            var kursID = event.target.parentNode.parentNode.id;
            kursLoeschen(kursID, sektorName);
        });
    $(fertig)
        .attr({'class': "fertigButton tooltip"})
        .text('\u{2713}')
        .click(function() { aenderungSpeichern(); })
        .append("<span class=\"tooltiptext\">save changes</span>");
    $(abbruch)
        .text('\u{2715}')
        .click(function() { tabelleAktualisieren(); })
        .append("<span class=\"tooltiptext\">discard changes</span>");
    $(loeschAll)
        .attr({'class': "loeschAllButton tooltip"})
        .text('\u{2715}')
        .click(function() { sektorLoeschen(sektorName); })
        .append("<span class=\"tooltiptext\">remove entire sector</span>");

    /* Inhalte werden veränderlich */
    for (var i = 0; i < zeilen.length; i++) {
        var zellen = zeilen[i].childNodes;
        for (var j = 0; j < zellen.length; j++) {
            var input = document.createElement('input');
            var inhalt = $(zellen[j]).text();
            $(input).attr({"class": "kursAendern",
                           "type": "text",
                           "value": inhalt,
                           "size": inhalt.length})
                    .change(function(event) {
                        var kursName = event.target.parentNode.parentNode.id;
                        if (event.target.value.search(/^\d+(.\d)?$/) > -1) {
                            if (changed.indexOf(kursName) < 0)
                                changed.push(kursName);
                        } else {
                            if (nameChanged.indexOf(kursName) < 0)
                                nameChanged.push(kursName);
                        }
                    });
            $(zellen[j]).empty().append(input);
        }
    }

    $(titel).prepend(loeschAll).append(fertig);
    titel.nextSibling.firstChild.appendChild(th);
    td2.appendChild(loeschen);
    zeilen.append(td2);

    function aenderungSpeichern() {
        for (var i = 0; i < zeilen.length; i++) {
            var zellen = zeilen[i].childNodes;
            if (nameChanged.indexOf(zeilen[i].id) > -1) {
                /* umbenannte Kurse überschreiben */
                var kursName = zellen[0].firstChild.value;
                var punkte = zellen[1].firstChild.value;
                var note = zellen[2].firstChild.value;
                kursLoeschen(zeilen[i].id, sektorName);
                // console.log("kursHinzufuegen("+name+", "+sektorName+", "+punkte+", "+note+")");
                kursHinzufuegen(kursName, sektorName, punkte, note);
            }
            else if (changed.indexOf(zeilen[i].id) > -1) {
                /* einfache Änderung speichern */
                var punkte = zellen[1].firstChild.value;
                var note   = zellen[2].firstChild.value;
                kursAendern(zeilen[i].id, punkte, note);
            }
        }
        tabelleAktualisieren()
    }

    function tabelleAktualisieren() {
        var sektor = JSON.parse(localStorage[sektorName]);
        $('#'+sektorName).empty();
        sektorInTabelle(sektor, tabelle);
    }
}

function sektorLoeschen(sektorName) {
    /* Kurse löschen */
    var sektor = JSON.parse(localStorage[sektorName]);
    for (var i = 0; i < sektor.kurse.length; i++) {
        localStorage.removeItem(sektor.kurse[i]);
    }
    /* Sektor löschen */
    localStorage.removeItem(sektorName);
    ausDOMentfernen(sektorName);
    /* Sektor aus Liste entfernen */
    var sektorArray = holSektoren();
    var index = sektorArray.indexOf(sektorName);
    sektorArray.splice(index, 1);
}
