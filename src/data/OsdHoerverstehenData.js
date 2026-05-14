// OsdHoerverstehenData.js

export const hoerenAufgabe1 = [
    { id: 1, text: "Eine Umfrage hat ergeben, dass sich vor allem junge Menschen immer mehr für Sport interessieren.", correct: "F" },
    { id: 2, text: "Laut Aussage von Otmar Weiss stärkt Sport das Selbstbewusstsein.", correct: "R" },
    { id: 3, text: "Sportliche Leistungen sind leichter und klarer sichtbar als Leistungen im Alltag.", correct: "R" },
    { id: 4, text: "Profisportler finden sich üblicherweise am Ende ihrer Karriere leicht im Alltag zurecht.", correct: "F" },
    { id: 5, text: "Die Gründe, warum Menschen Sport ausüben, werden immer vielfältiger.", correct: "R" },
    { id: 6, text: "Schwimmen, Radfahren und Skifahren sind die beliebtesten Sportarten in Österreich.", correct: "R" },
    { id: 7, text: "Sowohl Männer als auch Frauen betreiben Sport in erster Linie aus gesundheitlichen Gründen.", correct: "F" },
    { id: 8, text: "Männer sind beim Sporttreiben leistungsorientierter als Frauen.", correct: "R" },
    { id: 9, text: "Viele Menschen nutzen den Sport dazu, Freunde zu treffen.", correct: "F" },
    { id: 10, text: "Warum sich manche Sportarten besser durchsetzen als andere, ist bis heute ungeklärt.", correct: "R" }
];

// Az Aufgabe 2 egy komplex mátrix, ezért a megoldókulcsot oszloponként és soronként tároljuk
export const hoerenAufgabe2Keys = {
    uni: {
        schwerpunkt_allg: true, schwerpunkt_fach: false,
        kosten: "27", ermaessigung: "50", dauer: "2",
        ausleihe_post: false, ausleihe_fern: true,
        anmeldung_amt: true, anmeldung_adresse: false,
        service_lesung: true, service_cafe: true, service_lounge: true,
        zusatz_wlan: true, zusatz_fuehrung: false,
        max_buch: "40", zeit_von: "8:00", zeit_bis: "20:00"
    },
    zb: {
        schwerpunkt_allg: true, schwerpunkt_fach: true,
        kosten: "35", ermaessigung: "35", dauer: "3",
        ausleihe_post: true, ausleihe_fern: true,
        anmeldung_amt: true, anmeldung_adresse: false,
        service_lesung: true, service_cafe: true, service_lounge: false,
        zusatz_wlan: true, zusatz_fuehrung: true,
        max_buch: "35", zeit_von: "8:00", zeit_bis: "19:00"
    },
    lit: {
        schwerpunkt_allg: false, schwerpunkt_fach: true,
        kosten: "42", ermaessigung: "10", dauer: "3",
        ausleihe_post: false, ausleihe_fern: false,
        anmeldung_amt: true, anmeldung_adresse: true,
        service_lesung: true, service_cafe: true, service_lounge: false,
        zusatz_wlan: true, zusatz_fuehrung: false,
        max_buch: "3", zeit_von: "10:00", zeit_bis: "16:00"
    }
};