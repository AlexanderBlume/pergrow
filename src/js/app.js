require('purecss/build/pure-min.css');
require('purecss/build/grids-responsive-min.css');
require('purecss/build/buttons-min.css');
import '../css/main.css';
import 'jquery';
import {holSektoren,
        neuerSektor,
        neueTabelle,
        sektorInTabelle,
        kopfAktualisieren
} from './sector.js';
import {kursHinzufuegen} from './kurs.js';


$(init);  // when DOM ready: init()
function init() {
    $('.acc-head').click(function(event) {
        var name = event.target.id;
        $('#'+name+'Form').slideToggle("fast");
    });
    $('#NeuerSector').click(neuerSektor);
    $('#NeuerKurs').click(function() {
        var name = $('#KursEingabe');
        var sektorName = $('#KursSektor');
        var punkte = $('#KursPunkte');
        var note = $('#Note');
        kursHinzufuegen(name.val(), sektorName.val(), punkte.val(), note.val());
        name.val('');
        sektorName.val('');
        punkte.val('');
        note.val('');
    });

    var sektorArray = holSektoren();
    for (var i = 0; i < sektorArray.length; i++) {
        var sektorName = sektorArray[i];
        $('#KursSektor').append("<option>"+sektorName+"</option>");
        var sektor = JSON.parse(localStorage.getItem(sektorName));
        sektorInTabelle(sektor, neueTabelle(sektorName));
    }
    zusammenfassung();
}


export function message(msg) {
    console.log(msg);
    var div = document.createElement('div');
    $(div).text(msg).attr({'class': "pure-u-1 pure-u-md-1-2"});
    $('#messages').prepend(div);
    setTimeout(function () {
        $(div).fadeOut(2000, function(){ $(this).remove(); })
    }, 10000);
}

export function zusammenfassung() {
    var notenSumme = 0.0;
    var gesPunkte = 0;
    var gesKurse = 0;
    var kurseZiel = 0;
    var sektorArray = holSektoren();
    for (var i = 0; i < sektorArray.length; i++) {
        var sektor = JSON.parse(localStorage.getItem(sektorArray[i]));

        var bestenliste = 0 < sektor.kurseBenotet &&
                              sektor.kurseBenotet < sektor.kurseZiel;
        /* SektorWerte aktualisieren */
        sektor.notenSumme = 0;
        sektor.punkte = 0;
        var kurse = sektor.kurse;
        for (var j = 0; j < kurse.length; j++) {
            var kurs = JSON.parse(localStorage.getItem(kurse[j]));
            sektor.punkte += Number(kurs.punkte);
            sektor.notenSumme += kurs.note * kurs.punkte;
        }
        if (bestenliste) {
            sektor.notenSumme = 0;
            var beste = sektor.besteKurse;
            for (var j = 0; j < beste.length; j++) {
                sektor.notenSumme += beste[j][0] * beste[j][1];
            }
        }

        /* neu speichern */
        localStorage.setItem(sektor.name, JSON.stringify(sektor));
        notenSumme += sektor.notenSumme;
        gesPunkte += sektor.punkte;
        kurseZiel += Number(sektor.kurseZiel);
        gesKurse += sektor.kurse.length;
        kopfAktualisieren(sektor.name);
    }
    $('#GesamtKurse').text(gesKurse+"/"+kurseZiel);
    $('#GesamtPunkte').text(gesPunkte);
    $('#GesamtNote').text((notenSumme/gesPunkte).toFixed(2));
}


export function ausDOMentfernen(elemId) {
    $('#'+elemId).fadeOut("fast", function(){ $(this).remove(); });
}

function allesLoeschen() {
    localStorage.clear();
    $('#content').empty();
}
