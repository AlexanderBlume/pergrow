import {ausDOMentfernen, message} from "./app";
import {kopfAktualisieren} from "./sector";

export function Kurs(name, punkte, note) {  // Konstruktor
    this.name = name;
    this.punkte = punkte || 0;
    this.note = note || 0.0;
}

export function kursHinzufuegen(name, sektorName, punkte, note) {
    /* Error handling */
    if (!sektorName || !name || !punkte) {
        return message("Please insert all required fields.");
    }
    var test = localStorage.getItem(name);
    if (test) return message("Error! The Course already exists.");

    var sektor = JSON.parse(localStorage.getItem(sektorName));
    var kurs = new Kurs(name, punkte, note);
    localStorage.setItem(name, JSON.stringify(kurs));
    sektor.kurse.push(name);
    sektor.punkte = Number(sektor.punkte) + kurs.punkte;

    if (sektor.besteKurse && note) {
        // Wird die Note eingebracht?
        var best = sektor.besteKurse;
        function durchschnitt() {
            sektor.notenSumme = 0;
            for (var i = 0; i < best.length; i++) {
                sektor.notenSumme += best[i][0] * best[i][1];  // Note * Punkte
            }
        }
        if (best.length < sektor.kurseBenotet) {
            // Ja, denn noch sind es zu wenige eingebrachte Noten.
            best.push([note, punkte, name]);
            durchschnitt();
        } else {
            best.sort(function (a, b) { return b[0] - a[0] });
            if (note < best[0][0]) {
                // Ja, hiermit wird die Note verbessert.
                best[0] = [note, punkte, name];
                durchschnitt();
            }
        }
    } else {
        // Die Note wird auf jeden Fall eingebracht.
        sektor.notenSumme += kurs.note * kurs.punkte;
    }
    localStorage.setItem(sektorName, JSON.stringify(sektor));

    kursInsDOM(sektorName, kurs);
}

export function kursInsDOM(sektorName, kurs) {
    var zeile = document.createElement('tr');
    var tdname = document.createElement('td');
    var tdpunkte = document.createElement('td');
    var tdnote = document.createElement('td');
    zeile.setAttribute('id', kurs.name);
    tdname.innerHTML = kurs.name;
    tdpunkte.innerHTML = kurs.punkte;
    tdnote.innerHTML = kurs.note;
    $('#'+sektorName).append(zeile);
    $(zeile).append(tdname, tdpunkte, tdnote);
    kopfAktualisieren(sektorName);
}

export function kursAendern(kursName, punkte, note) {
    var test = localStorage.getItem(kursName);
    if (!test) message("Warning! The changed course did not exist yet in your localStorage.");

    /* Kurs überschreiben */
    var kurs = new Kurs(kursName, punkte, note);
    localStorage.setItem(kursName, JSON.stringify(kurs));
}

export function kursLoeschen(kursName, sektorName) {
    var sektor = JSON.parse(localStorage[sektorName]);
    var index = sektor.kurse.indexOf(kursName);
    sektor.kurse.splice(index, 1);
    localStorage.setItem(sektorName, JSON.stringify(sektor));

    localStorage.removeItem(kursName);

    ausDOMentfernen(kursName);
}