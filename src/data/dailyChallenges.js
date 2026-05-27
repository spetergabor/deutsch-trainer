export const dailyChallenges = [
  {
    id: "passiv-news-traffic",
    title: "Passiv in einer Nachricht",
    subtitle: "Verkehrsmaßnahmen in der Innenstadt",
    focus: "Passiv",
    level: "B1/B2",
    icon: "🗞️",
    estimatedMinutes: 12,
    steps: [
      {
        id: "reading",
        type: "reading",
        title: "Nachricht lesen",
        instruction:
          "Lies die Nachricht und achte darauf, wie das Passiv natürlich verwendet wird.",
        highlightTitle: "Passivformen im Text",
        text: [
          "In der Innenstadt wurden am Montag neue Verkehrsmaßnahmen vorgestellt. Nach Angaben der Stadtverwaltung sollen mehrere stark belastete Straßen entlastet werden. Dafür wurden in den letzten Monaten Verkehrsdaten gesammelt und ausgewertet.",
          "Besonders rund um den Hauptbahnhof wurden häufig Staus gemeldet. Deshalb wird dort ab nächster Woche eine Busspur eingerichtet. Außerdem werden zwei Kreuzungen umgebaut, damit Fußgänger und Radfahrer sicherer unterwegs sein können.",
          "Während der Bauarbeiten werden einige Straßenabschnitte gesperrt. Die betroffenen Anwohner wurden bereits per Brief informiert. Auch die Buslinien werden vorübergehend umgeleitet. Die Stadt betont, dass die Maßnahmen regelmäßig überprüft und bei Bedarf angepasst werden.",
        ],
        highlights: [
          "wurden vorgestellt",
          "sollen entlastet werden",
          "wurden gesammelt und ausgewertet",
          "wurden gemeldet",
          "wird eingerichtet",
          "werden umgebaut",
          "werden gesperrt",
          "wurden informiert",
          "werden umgeleitet",
          "werden überprüft und angepasst",
        ],
      },
      {
        id: "comprehension",
        type: "choice",
        title: "Leseverstehen",
        instruction: "Beantworte die Fragen zum Inhalt der Nachricht.",
        questions: [
          {
            prompt: "Warum führt die Stadt neue Maßnahmen ein?",
            options: [
              "Weil mehrere Straßen entlastet werden sollen.",
              "Weil der Hauptbahnhof geschlossen wird.",
              "Weil weniger Busse fahren sollen.",
            ],
            answer: "Weil mehrere Straßen entlastet werden sollen.",
            explanation:
              "A szöveg szerint több erősen terhelt utcát szeretnének tehermentesíteni.",
          },
          {
            prompt: "Wo wurden häufig Staus gemeldet?",
            options: [
              "Rund um den Hauptbahnhof.",
              "Neben dem Flughafen.",
              "Im Park der Altstadt.",
            ],
            answer: "Rund um den Hauptbahnhof.",
            explanation: "A hírben ez áll: rund um den Hauptbahnhof.",
          },
          {
            prompt: "Was passiert mit den Buslinien während der Bauarbeiten?",
            options: [
              "Sie werden vorübergehend umgeleitet.",
              "Sie werden vollständig eingestellt.",
              "Sie fahren nur am Wochenende.",
            ],
            answer: "Sie werden vorübergehend umgeleitet.",
            explanation: "A szövegben: Die Buslinien werden vorübergehend umgeleitet.",
          },
          {
            prompt: "Wie wurden die betroffenen Anwohner informiert?",
            options: [
              "Per Brief.",
              "Telefonisch.",
              "In einer Radiosendung.",
            ],
            answer: "Per Brief.",
            explanation: "A szöveg szerint az érintetteket levélben informálták.",
          },
        ],
      },
      {
        id: "passiv-focus",
        type: "choice",
        title: "Passiv erkennen",
        instruction: "Wähle die richtige Analyse oder die richtige Passivform.",
        questions: [
          {
            prompt: "In welcher Zeitform steht der Satz? „Die Maßnahmen wurden vorgestellt.”",
            options: ["Präteritum Passiv", "Präsens Passiv", "Perfekt Passiv"],
            answer: "Präteritum Passiv",
            explanation: "wurden + Partizip II = Präteritum Passiv többes számban.",
          },
          {
            prompt: "Welche Passivform passt zu „Die Stadt sammelt Verkehrsdaten”?",
            options: [
              "Verkehrsdaten werden gesammelt.",
              "Verkehrsdaten wurden sammeln.",
              "Verkehrsdaten ist gesammelt.",
            ],
            answer: "Verkehrsdaten werden gesammelt.",
            explanation: "Präsens Passiv: werden + Partizip II.",
          },
          {
            prompt: "Welcher Satz enthält eine Passivform?",
            options: [
              "Die Straßenabschnitte werden gesperrt.",
              "Die Stadt plant neue Maßnahmen.",
              "Viele Menschen fahren mit dem Bus.",
            ],
            answer: "Die Straßenabschnitte werden gesperrt.",
            explanation: "werden + gesperrt = Präsens Passiv.",
          },
          {
            prompt: "Was bedeutet „werden überprüft und angepasst” im Kontext?",
            options: [
              "Die Maßnahmen werden kontrolliert und bei Bedarf verändert.",
              "Die Maßnahmen werden besprochen und danach vergessen.",
              "Die Maßnahmen wurden kontrolliert und abgeschlossen.",
            ],
            answer: "Die Maßnahmen werden kontrolliert und bei Bedarf verändert.",
            explanation: "Präsens Passiv: a folyamat/eljárás van előtérben.",
          },
          {
            prompt: "Was ist die Passivstruktur in „Die Buslinien werden umgeleitet”?",
            options: ["werden umgeleitet", "die Buslinien", "umgeleitet werden"],
            answer: "werden umgeleitet",
            explanation: "A ragozott werden és a Partizip II együtt alkotja a passzívot.",
          },
        ],
      },
      {
        id: "vocabulary",
        type: "input",
        title: "Wortschatz aus der Nachricht",
        instruction: "Írd be németül névelővel a hír fontos szavait.",
        questions: [
          {
            prompt: "intézkedés",
            answer: "die Maßnahme",
            alternatives: ["die Massnahme"],
            explanation: "die Maßnahme = intézkedés.",
          },
          {
            prompt: "forgalom",
            answer: "der Verkehr",
            alternatives: [],
            explanation: "der Verkehr = forgalom, közlekedés.",
          },
          {
            prompt: "építési munkálatok",
            answer: "die Bauarbeiten",
            alternatives: [],
            explanation: "die Bauarbeiten = építési munkálatok.",
          },
          {
            prompt: "kereszteződés",
            answer: "die Kreuzung",
            alternatives: [],
            explanation: "die Kreuzung = kereszteződés.",
          },
          {
            prompt: "lakó",
            answer: "der Anwohner",
            alternatives: ["die Anwohnerin"],
            explanation: "der Anwohner = helyi lakó, érintett lakos.",
          },
          {
            prompt: "elterelés",
            answer: "die Umleitung",
            alternatives: [],
            explanation: "die Umleitung = elterelés.",
          },
        ],
      },
      {
        id: "transformation",
        type: "input",
        title: "Aktiv zu Passiv",
        instruction: "Forme den Satz ins Passiv um. Achte auf die Zeitform.",
        questions: [
          {
            prompt: "Die Stadt sammelt Verkehrsdaten.",
            answer: "Verkehrsdaten werden gesammelt.",
            alternatives: ["Die Verkehrsdaten werden gesammelt"],
            explanation: "Präsens Passiv: werden + gesammelt.",
          },
          {
            prompt: "Die Verwaltung informierte die Anwohner.",
            answer: "Die Anwohner wurden informiert.",
            alternatives: ["Anwohner wurden informiert"],
            explanation: "Präteritum Passiv: wurden + informiert.",
          },
          {
            prompt: "Die Arbeiter sperren mehrere Straßenabschnitte.",
            answer: "Mehrere Straßenabschnitte werden gesperrt.",
            alternatives: ["Die Straßenabschnitte werden gesperrt"],
            explanation: "A tárgyból lesz az új alany.",
          },
          {
            prompt: "Die Stadt überprüft die Maßnahmen regelmäßig.",
            answer: "Die Maßnahmen werden regelmäßig überprüft.",
            alternatives: ["Maßnahmen werden regelmäßig überprüft"],
            explanation: "Präsens Passiv: werden + überprüft.",
          },
        ],
      },
    ],
  },
  {
    id: "adjektiv-apartment-viewing",
    title: "Adjektivdeklination bei einer Wohnungsbesichtigung",
    subtitle: "Eine Besichtigung mit vielen Beschreibungen",
    focus: "Adjektivdeklination",
    level: "A2/B1",
    icon: "🎨",
    estimatedMinutes: 14,
    steps: [
      {
        id: "reading",
        type: "reading",
        title: "Text lesen",
        instruction:
          "Lies den Text und achte darauf, wie die Adjektive nach der, ein und ohne Artikel verändert werden.",
        highlightTitle: "Adjektivendungen im Text",
        text: [
          "Am Samstag besichtigte Lara eine helle Wohnung in einem ruhigen Viertel. Schon im kleinen Flur bemerkte sie den schönen Holzboden und die hohen weißen Wände. Die freundliche Maklerin erklärte, dass die Wohnung vor zwei Monaten renoviert wurde.",
          "Im Wohnzimmer standen ein großer runder Tisch, zwei bequeme Sessel und eine moderne graue Lampe. Durch die breiten Fenster kam warmes Licht herein. Lara gefiel besonders der offene Balkon, von dem man einen grünen Innenhof sehen konnte.",
          "Die Küche war klein, aber praktisch. Es gab neue Schränke, eine helle Arbeitsfläche und genug Platz für frisches Gemüse, gutes Brot und heißen Kaffee. Im Schlafzimmer lag ein weicher Teppich neben dem alten Bett. Lara wusste: Diese gemütliche Wohnung könnte ihr neues Zuhause werden.",
        ],
        highlights: [
          "eine helle Wohnung",
          "einem ruhigen Viertel",
          "den schönen Holzboden",
          "die hohen weißen Wände",
          "die freundliche Maklerin",
          "ein großer runder Tisch",
          "zwei bequeme Sessel",
          "eine moderne graue Lampe",
          "die breiten Fenster",
          "einen grünen Innenhof",
          "neue Schränke",
          "frisches Gemüse",
          "gutes Brot",
          "heißen Kaffee",
          "ein weicher Teppich",
          "diese gemütliche Wohnung",
        ],
      },
      {
        id: "comprehension",
        type: "choice",
        title: "Leseverstehen",
        instruction: "Beantworte die Fragen zum Inhalt des Textes.",
        questions: [
          {
            prompt: "Was besichtigt Lara am Samstag?",
            options: [
              "Eine helle Wohnung in einem ruhigen Viertel.",
              "Ein altes Haus auf dem Land.",
              "Ein kleines Zimmer im Studentenheim.",
            ],
            answer: "Eine helle Wohnung in einem ruhigen Viertel.",
            explanation:
              "A szöveg első mondata mondja: eine helle Wohnung in einem ruhigen Viertel.",
          },
          {
            prompt: "Was gefällt Lara besonders?",
            options: [
              "Der offene Balkon.",
              "Der dunkle Keller.",
              "Die laute Straße.",
            ],
            answer: "Der offene Balkon.",
            explanation: "A szövegben ez áll: Lara gefiel besonders der offene Balkon.",
          },
          {
            prompt: "Wie wird die Küche beschrieben?",
            options: [
              "Klein, aber praktisch.",
              "Groß, aber dunkel.",
              "Modern, aber sehr teuer.",
            ],
            answer: "Klein, aber praktisch.",
            explanation: "A mondat: Die Küche war klein, aber praktisch.",
          },
          {
            prompt: "Was könnte die Wohnung für Lara werden?",
            options: [
              "Ihr neues Zuhause.",
              "Ihr neues Büro.",
              "Ihr neues Klassenzimmer.",
            ],
            answer: "Ihr neues Zuhause.",
            explanation: "A zárómondat szerint: ihr neues Zuhause.",
          },
        ],
      },
      {
        id: "adjektiv-focus",
        type: "choice",
        title: "Endungen erkennen",
        instruction: "Wähle die richtige Adjektivendung oder Analyse.",
        questions: [
          {
            prompt: "Welche Form ist richtig?",
            options: [
              "die freundliche Maklerin",
              "die freundlicher Maklerin",
              "die freundlichen Maklerin",
            ],
            answer: "die freundliche Maklerin",
            explanation:
              "Határozott névelő után Nominativ femininben a melléknév végződése: -e.",
          },
          {
            prompt: "Warum heißt es „einem ruhigen Viertel”?",
            options: [
              "Weil nach einem im Dativ Neutrum die Endung -en steht.",
              "Weil jedes Adjektiv nach ein immer -en bekommt.",
              "Weil Viertel maskulin ist.",
            ],
            answer: "Weil nach einem im Dativ Neutrum die Endung -en steht.",
            explanation: "Dativban szinte mindig -en jön: in einem ruhigen Viertel.",
          },
          {
            prompt: "Welche Form passt zu „Ich sehe ... Innenhof”?",
            options: [
              "einen grünen Innenhof",
              "einen grüner Innenhof",
              "ein grünes Innenhof",
            ],
            answer: "einen grünen Innenhof",
            explanation:
              "Akkusativ maskulin: einen + melléknév -en + főnév.",
          },
          {
            prompt: "Welche Wortgruppe hat keinen Artikel?",
            options: ["frisches Gemüse", "die breiten Fenster", "eine moderne Lampe"],
            answer: "frisches Gemüse",
            explanation:
              "Névelő nélkül az erős végződés viszi az információt: frisches Gemüse.",
          },
          {
            prompt: "Welche Form ist Dativ?",
            options: [
              "in einem ruhigen Viertel",
              "eine helle Wohnung",
              "den schönen Holzboden",
            ],
            answer: "in einem ruhigen Viertel",
            explanation:
              "Az in itt helyet jelöl, ezért Dativ: in einem ruhigen Viertel.",
          },
        ],
      },
      {
        id: "vocabulary",
        type: "input",
        title: "Wortschatz aus dem Text",
        instruction: "Írd be németül névelővel a szöveg fontos szavait.",
        questions: [
          {
            prompt: "lakás",
            answer: "die Wohnung",
            alternatives: [],
            explanation: "die Wohnung = lakás.",
          },
          {
            prompt: "folyosó / előszoba",
            answer: "der Flur",
            alternatives: [],
            explanation: "der Flur = folyosó, előszoba.",
          },
          {
            prompt: "ingatlanos / közvetítőnő",
            answer: "die Maklerin",
            alternatives: ["der Makler"],
            explanation: "die Maklerin = női ingatlanközvetítő.",
          },
          {
            prompt: "belső udvar",
            answer: "der Innenhof",
            alternatives: [],
            explanation: "der Innenhof = belső udvar.",
          },
          {
            prompt: "munkafelület",
            answer: "die Arbeitsfläche",
            alternatives: ["die Arbeitsflaeche"],
            explanation: "die Arbeitsfläche = munkapult, munkafelület.",
          },
          {
            prompt: "szőnyeg",
            answer: "der Teppich",
            alternatives: [],
            explanation: "der Teppich = szőnyeg.",
          },
        ],
      },
      {
        id: "declension",
        type: "input",
        title: "Endungen einsetzen",
        instruction: "Ergänze die richtige Adjektivendung.",
        questions: [
          {
            prompt: "Lara besichtigt eine hell___ Wohnung.",
            answer: "helle",
            alternatives: ["e"],
            explanation:
              "eine + feminin Nominativ/Akkusativ: helle Wohnung.",
          },
          {
            prompt: "Sie steht in einem ruhig___ Viertel.",
            answer: "ruhigen",
            alternatives: ["en"],
            explanation: "Dativ Neutrum nach einem: ruhigen.",
          },
          {
            prompt: "Sie sieht den schön___ Holzboden.",
            answer: "schönen",
            alternatives: ["en"],
            explanation: "Akkusativ maskulin nach den: schönen.",
          },
          {
            prompt: "Im Wohnzimmer steht ein groß___ Tisch.",
            answer: "großer",
            alternatives: ["er"],
            explanation: "ein + maskulin Nominativ: großer Tisch.",
          },
          {
            prompt: "In der Küche gibt es frisch___ Gemüse.",
            answer: "frisches",
            alternatives: ["es"],
            explanation: "Névelő nélkül Neutrum Akkusativ: frisches Gemüse.",
          },
          {
            prompt: "Lara trinkt heiß___ Kaffee.",
            answer: "heißen",
            alternatives: ["en"],
            explanation: "Névelő nélkül maskulin Akkusativ: heißen Kaffee.",
          },
        ],
      },
    ],
  },
  {
    id: "konjunktiv-ii-career-decision",
    title: "Konjunktiv II in einer Entscheidung",
    subtitle: "Ein Gespräch über Wünsche, Möglichkeiten und verpasste Chancen",
    focus: "Konjunktiv II",
    level: "B1/B2",
    icon: "💭",
    estimatedMinutes: 15,
    steps: [
      {
        id: "reading",
        type: "reading",
        title: "Dialog lesen",
        instruction:
          "Lies den Dialog und achte darauf, wie Konjunktiv II für Wünsche, höfliche Fragen und irreale Vergangenheit verwendet wird.",
        highlightTitle: "Konjunktiv-II-Formen im Text",
        text: [
          "Mara arbeitet seit drei Jahren in einer kleinen Agentur. Eigentlich wäre sie gern Projektleiterin, aber sie traut sich nicht, mit ihrem Chef darüber zu sprechen. In der Mittagspause sagt sie zu ihrem Kollegen Jonas: „Wenn ich mutiger wäre, würde ich um ein Gespräch bitten.”",
          "Jonas antwortet: „Du könntest zuerst eine kurze E-Mail schreiben. Du könntest fragen, ob er diese Woche Zeit hätte. Ich würde an deiner Stelle klar erklären, welche Aufgaben du übernehmen möchtest.” Mara nickt. „Das wäre vielleicht wirklich besser. Ich hätte schon vor Monaten fragen sollen.”",
          "Am Nachmittag denkt Mara über die letzten Monate nach. Wenn sie früher mit ihrem Chef gesprochen hätte, hätte sie vielleicht schon ein eigenes Projekt bekommen. Trotzdem entscheidet sie sich, jetzt aktiv zu werden. Sie schreibt: „Könnten wir diese Woche über meine Entwicklung sprechen? Ich würde mich sehr über einen Termin freuen.”",
        ],
        highlights: [
          "wäre sie gern Projektleiterin",
          "Wenn ich mutiger wäre",
          "würde ich um ein Gespräch bitten",
          "Du könntest",
          "Zeit hätte",
          "Ich würde an deiner Stelle",
          "Das wäre",
          "Ich hätte ... fragen sollen",
          "Wenn sie früher ... gesprochen hätte",
          "hätte sie ... bekommen",
          "Könnten wir",
          "Ich würde mich ... freuen",
        ],
      },
      {
        id: "comprehension",
        type: "choice",
        title: "Leseverstehen",
        instruction: "Beantworte die Fragen zum Dialog.",
        questions: [
          {
            prompt: "Was wäre Mara gern?",
            options: [
              "Projektleiterin.",
              "Deutschlehrerin.",
              "Kollegin in einer anderen Firma.",
            ],
            answer: "Projektleiterin.",
            explanation:
              "A szövegben ez áll: Eigentlich wäre sie gern Projektleiterin.",
          },
          {
            prompt: "Warum hat Mara noch nicht mit ihrem Chef gesprochen?",
            options: [
              "Weil sie sich nicht traut.",
              "Weil ihr Chef im Urlaub ist.",
              "Weil sie keine E-Mail schreiben kann.",
            ],
            answer: "Weil sie sich nicht traut.",
            explanation:
              "Mara nem elég bátor hozzá: sie traut sich nicht.",
          },
          {
            prompt: "Was empfiehlt Jonas?",
            options: [
              "Sie könnte zuerst eine kurze E-Mail schreiben.",
              "Sie sollte sofort kündigen.",
              "Sie müsste das Projekt allein beginnen.",
            ],
            answer: "Sie könnte zuerst eine kurze E-Mail schreiben.",
            explanation:
              "Jonas óvatos, udvarias javaslatot ad: Du könntest zuerst eine kurze E-Mail schreiben.",
          },
          {
            prompt: "Was schreibt Mara am Ende?",
            options: [
              "Sie bittet um ein Gespräch über ihre Entwicklung.",
              "Sie sagt den Termin ab.",
              "Sie beschwert sich über Jonas.",
            ],
            answer: "Sie bittet um ein Gespräch über ihre Entwicklung.",
            explanation:
              "Az utolsó mondatban időpontot kér a fejlődéséről szóló beszélgetéshez.",
          },
        ],
      },
      {
        id: "konjunktiv-focus",
        type: "choice",
        title: "Formen erkennen",
        instruction: "Wähle die richtige Konjunktiv-II-Form oder Analyse.",
        questions: [
          {
            prompt: "Welche Form ist höflich?",
            options: [
              "Könnten wir diese Woche sprechen?",
              "Wir sprechen diese Woche.",
              "Sprich diese Woche mit mir.",
            ],
            answer: "Könnten wir diese Woche sprechen?",
            explanation:
              "Könnten macht die Frage höflicher und weniger direkt.",
          },
          {
            prompt: "Welche Form beschreibt eine irreale Gegenwart?",
            options: [
              "Wenn ich mutiger wäre, würde ich fragen.",
              "Wenn ich gefragt habe, bekomme ich Antwort.",
              "Ich habe gestern gefragt.",
            ],
            answer: "Wenn ich mutiger wäre, würde ich fragen.",
            explanation:
              "wäre + würde zeigt: most nem ez a valós helyzet, csak elképzelt.",
          },
          {
            prompt: "Welche Form beschreibt eine irreale Vergangenheit?",
            options: [
              "Wenn sie früher gesprochen hätte, hätte sie ein Projekt bekommen.",
              "Wenn sie früher spricht, bekommt sie ein Projekt.",
              "Sie spricht früher mit dem Chef.",
            ],
            answer:
              "Wenn sie früher gesprochen hätte, hätte sie ein Projekt bekommen.",
            explanation:
              "Múltbeli nem teljesült feltétel: hätte + Partizip II.",
          },
          {
            prompt: "Was ist die richtige Form von „haben” im Konjunktiv II Präsens?",
            options: ["hätte", "habe", "hatte"],
            answer: "hätte",
            explanation: "haben saját Konjunktiv-II alakja: hätte.",
          },
          {
            prompt: "Welche Struktur passt zur Vergangenheit?",
            options: [
              "hätte/wäre + Partizip II",
              "würde + Partizip II",
              "hat + Infinitiv",
            ],
            answer: "hätte/wäre + Partizip II",
            explanation:
              "Konjunktiv II múlt: hätte/wäre + Partizip II.",
          },
        ],
      },
      {
        id: "vocabulary",
        type: "input",
        title: "Wortschatz aus dem Dialog",
        instruction: "Írd be németül névelővel a szöveg fontos szavait.",
        questions: [
          {
            prompt: "ügynökség",
            answer: "die Agentur",
            alternatives: [],
            explanation: "die Agentur = ügynökség.",
          },
          {
            prompt: "projektvezetőnő",
            answer: "die Projektleiterin",
            alternatives: ["der Projektleiter"],
            explanation: "die Projektleiterin = projektvezetőnő.",
          },
          {
            prompt: "ebédszünet",
            answer: "die Mittagspause",
            alternatives: [],
            explanation: "die Mittagspause = ebédszünet.",
          },
          {
            prompt: "feladat",
            answer: "die Aufgabe",
            alternatives: ["die Aufgaben"],
            explanation: "die Aufgabe = feladat.",
          },
          {
            prompt: "fejlődés",
            answer: "die Entwicklung",
            alternatives: [],
            explanation: "die Entwicklung = fejlődés.",
          },
          {
            prompt: "időpont / találkozó",
            answer: "der Termin",
            alternatives: [],
            explanation: "der Termin = időpont, megbeszélés.",
          },
        ],
      },
      {
        id: "konjunktiv-writing",
        type: "input",
        title: "Konjunktiv II bilden",
        instruction:
          "Bilde die passende Konjunktiv-II-Form. Achte darauf, ob es Gegenwart oder Vergangenheit ist.",
        questions: [
          {
            prompt: "Ich habe mehr Zeit. → Wenn ich mehr Zeit ___, würde ich mehr lernen.",
            answer: "hätte",
            alternatives: [],
            explanation: "Irreális jelen: haben → hätte.",
          },
          {
            prompt: "Sie ist mutiger. → Wenn sie mutiger ___, würde sie fragen.",
            answer: "wäre",
            alternatives: [],
            explanation: "Irreális jelen: sein → wäre.",
          },
          {
            prompt: "Kannst du mir helfen? → ___ du mir helfen?",
            answer: "Könntest",
            alternatives: ["koenntest"],
            explanation: "Udvarias kérés: könntest.",
          },
          {
            prompt: "Ich lerne mehr. → Ich ___ mehr lernen.",
            answer: "würde",
            alternatives: ["wuerde"],
            explanation: "Általános jelen idejű forma: würde + Infinitiv.",
          },
          {
            prompt: "Sie hat früher gefragt. → Wenn sie früher gefragt ___, hätte sie eine Antwort bekommen.",
            answer: "hätte",
            alternatives: [],
            explanation: "Irreális múlt: hätte + Partizip II.",
          },
          {
            prompt: "Wir sind früher gekommen. → Wenn wir früher gekommen ___, hätten wir den Chef getroffen.",
            answer: "wären",
            alternatives: ["waeren"],
            explanation: "kommen mozgásige, ezért wäre/wären + Partizip II.",
          },
        ],
      },
    ],
  },
];
