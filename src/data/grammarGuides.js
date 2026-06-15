export const grammarGuides = [
  {
    id: "passiv-alle-zeiten",
    mode: "grammar-guide-passiv",
    title: "Passiv in allen Zeiten",
    subtitle: "Werden + Partizip II, Zustandspassiv és időformák",
    level: "B1/B2",
    icon: "🛠️",
    practice: {
      available: true,
      mode: "passiv",
      label: "Passiv gyakorlása",
      type: "choice-writing",
    },
    sections: [
      {
        title: "Mikor használjuk a Passivot?",
        body:
          "A Passiv akkor fontos, amikor nem az a lényeg, ki csinál valamit, hanem maga a cselekvés vagy annak eredménye. Magyarul gyakran úgy fordítjuk: valami meg van csinálva, valamit elvégeznek, valakit megvizsgálnak.",
        examples: [
          {
            de: "Der Brief wird geschrieben.",
            hu: "A levelet megírják.",
          },
          {
            de: "Das Auto wurde repariert.",
            hu: "Az autót megjavították.",
          },
        ],
      },
      {
        title: "Alapképlet: werden + Partizip II",
        body:
          "A Vorgangspassiv, vagyis a folyamatot kifejező passzív szerkezet alapja a werden megfelelő alakja és a főige Partizip II alakja.",
        formula: "Subjekt + werden + Partizip II",
        examples: [
          {
            de: "Die Tür wird geöffnet.",
            hu: "Az ajtót kinyitják.",
          },
          {
            de: "Die Aufgaben werden kontrolliert.",
            hu: "A feladatokat ellenőrzik.",
          },
        ],
      },
      {
        title: "Passiv az időkben",
        body:
          "Az időt mindig a werden segédige mutatja. A főige Partizip II alakban marad.",
        table: [
          {
            tense: "Präsens",
            form: "wird + Partizip II",
            example: "Der Text wird gelesen.",
          },
          {
            tense: "Präteritum",
            form: "wurde + Partizip II",
            example: "Der Text wurde gelesen.",
          },
          {
            tense: "Perfekt",
            form: "ist + Partizip II + worden",
            example: "Der Text ist gelesen worden.",
          },
          {
            tense: "Plusquamperfekt",
            form: "war + Partizip II + worden",
            example: "Der Text war gelesen worden.",
          },
          {
            tense: "Futur I",
            form: "wird + Partizip II + werden",
            example: "Der Text wird gelesen werden.",
          },
        ],
      },
      {
        title: "A cselekvő: von vagy durch?",
        body:
          "Ha mégis meg akarjuk nevezni, ki vagy mi végzi a cselekvést, gyakran von vagy durch szerkezetet használunk. Személynél többnyire von, eszköznél vagy oknál gyakran durch áll.",
        examples: [
          {
            de: "Der Patient wird von der Ärztin untersucht.",
            hu: "A pácienst az orvosnő vizsgálja meg.",
          },
          {
            de: "Das Fenster wurde durch den Sturm zerstört.",
            hu: "Az ablakot a vihar tette tönkre.",
          },
        ],
      },
      {
        title: "Zustandspassiv: sein + Partizip II",
        body:
          "A Zustandspassiv nem a folyamatot, hanem az eredményt írja le. Itt nem werden, hanem sein áll.",
        formula: "Subjekt + sein + Partizip II",
        examples: [
          {
            de: "Die Tür ist geöffnet.",
            hu: "Az ajtó nyitva van.",
          },
          {
            de: "Die Aufgabe ist erledigt.",
            hu: "A feladat el van intézve.",
          },
        ],
      },
    ],
    quickRules: [
      "Vorgangspassiv: werden + Partizip II",
      "Perfektben: ist + Partizip II + worden",
      "Zustandspassiv: sein + Partizip II",
      "A cselekvő nem mindig fontos.",
      "von + Dativ gyakori személyeknél.",
    ],
  },
  {
    id: "indirekte-rede",
    mode: "grammar-guide-indirekte-rede",
    title: "Indirekte Rede",
    subtitle: "Konjunktiv I, dass-Satz és idézett beszéd",
    level: "B2",
    icon: "💬",
    practice: {
      available: false,
      label: "Gyakorló hamarosan",
      type: "planned",
    },
    sections: [
      {
        title: "Mikor használjuk az Indirekte Redét?",
        body:
          "Az Indirekte Rede akkor kell, amikor valakinek a szavait nem szó szerint idézzük, hanem beszámolunk róla. Gyakori hírekben, hivatalos szövegekben, vizsgafeladatokban és összefoglalókban.",
        examples: [
          {
            de: "Anna sagt, sie habe keine Zeit.",
            hu: "Anna azt mondja, hogy nincs ideje.",
          },
          {
            de: "Der Lehrer erklärt, die Prüfung beginne um acht Uhr.",
            hu: "A tanár elmagyarázza, hogy a vizsga nyolckor kezdődik.",
          },
        ],
      },
      {
        title: "Alapképlet: bevezető ige + Konjunktiv I",
        body:
          "A klasszikus indirekt beszédben gyakran Konjunktiv I áll. Ezzel jelezzük, hogy nem saját állítást teszünk, hanem valaki más kijelentését adjuk vissza.",
        formula: "sagen/erklären/behaupten + Subjekt + Konjunktiv I",
        examples: [
          {
            de: "Er sagt, er sei krank.",
            hu: "Azt mondja, hogy beteg.",
          },
          {
            de: "Sie meint, das Problem sei gelöst.",
            hu: "Úgy véli, hogy a probléma megoldódott.",
          },
        ],
      },
      {
        title: "Konjunktiv I alakok",
        body:
          "A Konjunktiv I főleg az egyes szám harmadik személyben látványos. A sein különösen fontos, mert nagyon gyakran előfordul indirekt beszédben.",
        table: [
          {
            tense: "sein",
            form: "ich sei, du seiest, er/sie/es sei",
            example: "Er sagt, sie sei müde.",
          },
          {
            tense: "haben",
            form: "ich habe, du habest, er/sie/es habe",
            example: "Sie erklärt, er habe Recht.",
          },
          {
            tense: "werden",
            form: "ich werde, du werdest, er/sie/es werde",
            example: "Man berichtet, es werde kälter.",
          },
          {
            tense: "machen",
            form: "ich mache, du machest, er/sie/es mache",
            example: "Er sagt, sie mache die Aufgabe.",
          },
        ],
      },
      {
        title: "Ha a Konjunktiv I megegyezik a kijelentő móddal",
        body:
          "Ha a Konjunktiv I alak nem különbözik eléggé az Indikativtól, gyakran Konjunktiv II-t használunk. Ez főleg többes számnál fordul elő.",
        examples: [
          {
            de: "Sie sagen, sie hätten viel Arbeit.",
            hu: "Azt mondják, hogy sok munkájuk van.",
          },
          {
            de: "Die Schüler erklären, sie könnten den Text verstehen.",
            hu: "A diákok elmagyarázzák, hogy meg tudják érteni a szöveget.",
          },
        ],
      },
      {
        title: "Dass-Satz mint egyszerűbb megoldás",
        body:
          "Beszélt nyelvben és B1/B2 szinten gyakori a dass-os mondat is. Ilyenkor az ige a mellékmondat végére kerül, és sokszor Indikativot használunk.",
        formula: "sagen + dass + Subjekt + ... + Verb",
        examples: [
          {
            de: "Er sagt, dass er krank ist.",
            hu: "Azt mondja, hogy beteg.",
          },
          {
            de: "Sie erzählt, dass sie morgen nach Wien fährt.",
            hu: "Elmeséli, hogy holnap Bécsbe utazik.",
          },
        ],
      },
      {
        title: "Névmások és időhatározók változása",
        body:
          "Indirekt beszédben figyelni kell a névmásokra és az időhatározókra is. Az ich gyakran er/sie lesz, a heute helyett pedig a kontextustól függően an diesem Tag állhat.",
        examples: [
          {
            de: "Direkt: Ich komme heute. → Indirekt: Er sagt, er komme an diesem Tag.",
            hu: "Direkt: Ma jövök. → Indirekt: Azt mondja, hogy azon a napon jön.",
          },
          {
            de: "Direkt: Wir haben morgen frei. → Indirekt: Sie sagen, sie hätten am nächsten Tag frei.",
            hu: "Direkt: Holnap szabadnapunk van. → Indirekt: Azt mondják, hogy másnap szabadnapjuk van.",
          },
        ],
      },
    ],
    quickRules: [
      "Indirekte Rede = valaki más szavait adjuk vissza.",
      "Hivatalosabb stílusban: Konjunktiv I.",
      "sein: er/sie/es sei.",
      "Ha az alak nem egyértelmű, jöhet Konjunktiv II.",
      "Dass-Satzban az ige a mondat végére kerül.",
      "Névmások és időhatározók gyakran változnak.",
    ],
  },
  {
    id: "adjektivdeklination",
    mode: "grammar-guide-adjektivdeklination",
    title: "Adjektivdeklination",
    subtitle: "Melléknévragozás határozott, határozatlan és névelő nélküli alakokkal",
    level: "A2/B1",
    icon: "🎨",
    practice: {
      available: true,
      mode: "adjektiv",
      label: "Adjektivdeklination gyakorlása",
      type: "ending-choice",
    },
    sections: [
      {
        title: "Miért kell ragozni a melléknevet?",
        body:
          "A németben a főnév előtt álló melléknév majdnem mindig végződést kap. Ez a végződés nem dísz: információt hordoz a főnév neméről, számáról és esetéről. A magyarban ezt többnyire nem fordítjuk külön, ezért elsőre feleslegesnek tűnhet, de németül ettől lesz pontos a mondat.",
        examples: [
          {
            de: "Der alte Mann wartet.",
            hu: "Az idős férfi vár.",
          },
          {
            de: "Ich kaufe ein neues Handy.",
            hu: "Veszek egy új telefont.",
          },
        ],
      },
      {
        title: "Három fő típus",
        body:
          "Mindig azt nézd meg először, mi áll a melléknév előtt. Ha der/die/das típusú szó áll előtte, a névelő már sok információt megmutat, ezért a melléknév gyengébb végződést kap. Ha ein/kein/mein típusú szó áll előtte, néha a melléknévnek kell pótolnia a hiányzó információt. Ha nincs névelő, akkor a melléknév dolgozik a legtöbbet.",
        table: [
          {
            tense: "Gyenge ragozás",
            form: "der/die/das/dieser/jeder + Adjektiv",
            example: "der gute Film, die gute Idee, das gute Buch",
          },
          {
            tense: "Vegyes ragozás",
            form: "ein/eine/kein/mein/dein + Adjektiv",
            example: "ein guter Film, eine gute Idee, kein gutes Buch",
          },
          {
            tense: "Erős ragozás",
            form: "nincs névelő + Adjektiv",
            example: "guter Kaffee, frische Milch, kaltes Wasser",
          },
        ],
      },
      {
        title: "Döntési sorrend",
        body:
          "A leggyorsabb módszer: először keresd meg a főnevet, aztán nézd meg a nemét és esetét, végül nézd meg, milyen szó áll a melléknév előtt. Ez dönti el, hogy gyenge, vegyes vagy erős végződést használsz.",
        formula: "Nomen → nem + eset → előtte álló szó → melléknévvégződés",
        examples: [
          {
            de: "Ich sehe einen alten Freund.",
            hu: "Freund = hímnem, Akkusativ; einen után: alten.",
          },
          {
            de: "Mit gutem Kaffee beginnt der Tag besser.",
            hu: "Kaffee = hímnem, Dativ; névelő nélkül: gutem.",
          },
        ],
      },
      {
        title: "Gyenge ragozás: der, die, das után",
        body:
          "Ha a névelő már egyértelműen mutatja a nemet és esetet, a melléknév többnyire csak -e vagy -en végződést kap. Nominativban egyes számban gyakran -e áll, sok más helyzetben -en. Ezért ez a legkönnyebben megtanulható típus.",
        formula: "der/die/das + Adjektiv-e/-en + Nomen",
        table: [
          {
            tense: "Nominativ",
            form: "der gute Mann / die gute Frau / das gute Kind",
            example: "Der gute Mann hilft.",
          },
          {
            tense: "Akkusativ",
            form: "den guten Mann / die gute Frau / das gute Kind",
            example: "Ich sehe den guten Mann.",
          },
          {
            tense: "Dativ",
            form: "dem guten Mann / der guten Frau / dem guten Kind",
            example: "Ich helfe dem guten Mann.",
          },
          {
            tense: "Plural",
            form: "die guten Freunde / den guten Freunden",
            example: "Ich treffe die guten Freunde.",
          },
        ],
        examples: [
          {
            de: "der kleine Hund",
            hu: "a kis kutya",
          },
          {
            de: "die kleine Katze",
            hu: "a kis macska",
          },
          {
            de: "mit dem kleinen Kind",
            hu: "a kis gyerekkel",
          },
        ],
      },
      {
        title: "Vegyes ragozás: ein, kein, mein után",
        body:
          "Az ein típusú szavak néha nem mutatják teljesen a nemet. Például az ein lehet hímnem Nominativ vagy semleges Nominativ/Akkusativ is, ezért a melléknévnek kell pontosítania: hímnemben ein guter Mann, semlegesnemben ein gutes Kind. Ha a névelő már kapott erős végződést, a melléknév gyakran -en lesz.",
        formula: "ein/kein/mein + Adjektiv-végződés + Nomen",
        table: [
          {
            tense: "Nominativ",
            form: "ein guter Mann / eine gute Frau / ein gutes Kind",
            example: "Ein guter Lehrer erklärt klar.",
          },
          {
            tense: "Akkusativ",
            form: "einen guten Mann / eine gute Frau / ein gutes Kind",
            example: "Ich brauche einen neuen Laptop.",
          },
          {
            tense: "Dativ",
            form: "einem guten Mann / einer guten Frau / einem guten Kind",
            example: "Ich spreche mit einem netten Kollegen.",
          },
          {
            tense: "Plural",
            form: "keine guten Ideen / meinen guten Freunden",
            example: "Ich habe keine guten Ideen.",
          },
        ],
        examples: [
          {
            de: "ein guter Lehrer",
            hu: "egy jó tanár",
          },
          {
            de: "eine gute Idee",
            hu: "egy jó ötlet",
          },
          {
            de: "ein gutes Buch",
            hu: "egy jó könyv",
          },
        ],
      },
      {
        title: "Erős ragozás: névelő nélkül",
        body:
          "Ha nincs névelő, a melléknévnek kell megmutatnia a főnév nyelvtani adatait. Ezért az erős ragozás végződései hasonlítanak a der/die/das alakokra: der → guter, die → gute, das → gutes. Ezt gyakran használjuk anyagnevekkel, többes számmal és általános kijelentéseknél.",
        formula: "Adjektiv + Nomen",
        table: [
          {
            tense: "Nominativ",
            form: "guter Kaffee / frische Milch / kaltes Wasser",
            example: "Frischer Kaffee hilft am Morgen.",
          },
          {
            tense: "Akkusativ",
            form: "guten Kaffee / frische Milch / kaltes Wasser",
            example: "Ich trinke kaltes Wasser.",
          },
          {
            tense: "Dativ",
            form: "gutem Kaffee / frischer Milch / kaltem Wasser",
            example: "Mit gutem Kaffee lerne ich besser.",
          },
          {
            tense: "Plural",
            form: "gute Freunde / mit guten Freunden",
            example: "Gute Freunde sind wichtig.",
          },
        ],
        examples: [
          {
            de: "frischer Kaffee",
            hu: "friss kávé",
          },
          {
            de: "kaltes Wasser",
            hu: "hideg víz",
          },
          {
            de: "mit gutem Wein",
            hu: "jó borral",
          },
        ],
      },
      {
        title: "Összefoglaló táblázat: hímnemű főnév",
        body:
          "A hímnemű főnév jó teszt, mert itt látszik a legtöbb változás. Különösen az Akkusativ fontos: Nominativban der gute Mann vagy ein guter Mann áll, Akkusativban viszont den guten Mann vagy einen guten Mann.",
        table: [
          {
            tense: "Nominativ",
            form: "der gute Mann / ein guter Mann / guter Wein",
            example: "Der gute Mann hilft. Ein guter Wein ist teuer.",
          },
          {
            tense: "Akkusativ",
            form: "den guten Mann / einen guten Mann / guten Wein",
            example: "Ich sehe den guten Mann. Ich trinke guten Wein.",
          },
          {
            tense: "Dativ",
            form: "dem guten Mann / einem guten Mann / gutem Wein",
            example: "Ich helfe einem guten Mann. Mit gutem Wein kochen wir.",
          },
          {
            tense: "Genitiv",
            form: "des guten Mannes / eines guten Mannes / guten Weines",
            example: "Die Meinung eines guten Freundes zählt.",
          },
        ],
      },
      {
        title: "Tipikus hibák",
        body:
          "A legtöbb hiba abból jön, hogy a tanuló csak a névelőt nézi, de az esetet nem. Mindig kérdezd meg: ki/mi csinálja, kit/mit látok, kinek/mivel történik? Ez segít eldönteni, hogy Nominativ, Akkusativ vagy Dativ kell.",
        examples: [
          {
            de: "Falsch: Ich sehe ein guter Film. → Richtig: Ich sehe einen guten Film.",
            hu: "sehen után itt Akkusativ kell: einen guten Film.",
          },
          {
            de: "Falsch: mit ein guter Freund → Richtig: mit einem guten Freund",
            hu: "mit mindig Dativot kér: einem guten Freund.",
          },
        ],
      },
    ],
    quickRules: [
      "Először nézd meg, áll-e névelő a melléknév előtt.",
      "Der/die/das után a melléknév általában -e vagy -en végződést kap.",
      "Ein/kein/mein után a melléknév néha megmutatja a nemet: ein guter Mann, ein gutes Kind.",
      "Névelő nélkül a melléknév kapja az erős végződést: guter Kaffee, kaltes Wasser.",
      "Hímnem Akkusativban mindig figyelj az -en végződésre: den guten Mann, einen guten Mann.",
      "Dativban a melléknév szinte mindig -en: mit dem guten Freund, mit einem guten Freund.",
    ],
  },
  {
    id: "brief-schreiben-b1-b2",
    mode: "grammar-guide-brief-schreiben",
    title: "Brief schreiben B1/B2",
    subtitle: "Hasznos fordulatok hivatalos és félhivatalos levelekhez",
    level: "B1/B2",
    icon: "✉️",
    practice: {
      available: false,
      label: "Írásgyakorló hamarosan",
      type: "planned-writing",
    },
    sections: [
      {
        title: "Mire jó ez a segédlet?",
        body:
          "B1/B2 szinten a levélírásnál nem az a cél, hogy minden mondat teljesen egyedi legyen. Sokkal fontosabb, hogy legyenek biztos fordulataid: hogyan kezded a levelet, hogyan mondod el a célodat, hogyan kérsz információt, hogyan panaszkodsz udvariasan, és hogyan zárod le a szöveget.",
        examples: [
          {
            de: "Ich wende mich an Sie, weil ich eine Frage zu Ihrer Anzeige habe.",
            hu: "Azért fordulok Önhöz, mert kérdésem van a hirdetésével kapcsolatban.",
          },
          {
            de: "Ich würde mich sehr freuen, wenn Sie mir weiterhelfen könnten.",
            hu: "Nagyon örülnék, ha tudna nekem segíteni.",
          },
        ],
      },
      {
        title: "Megszólítás és nyitás",
        body:
          "Hivatalos levélben a Sehr geehrte... a legbiztonságosabb kezdés. Ha nem tudod a címzett nevét, használhatod a Sehr geehrte Damen und Herren formulát. A nyitómondatban rögtön meg lehet mondani, miért írsz.",
        table: [
          {
            tense: "Hivatalos",
            form: "Sehr geehrte Frau Müller, / Sehr geehrter Herr Schmidt,",
            example: "Sehr geehrte Damen und Herren,",
          },
          {
            tense: "Félhivatalos",
            form: "Liebe Frau Müller, / Lieber Herr Schmidt,",
            example: "Liebe Frau Müller, vielen Dank für Ihre Nachricht.",
          },
          {
            tense: "Nyitómondat",
            form: "Ich schreibe Ihnen, weil...",
            example: "Ich schreibe Ihnen, weil ich mich für den Kurs interessiere.",
          },
          {
            tense: "Kapcsolódás",
            form: "Vielen Dank für Ihre E-Mail / Ihr Schreiben.",
            example: "Vielen Dank für Ihre schnelle Antwort.",
          },
        ],
        examples: [
          {
            de: "Ich wende mich an Sie, weil ich weitere Informationen benötige.",
            hu: "Azért fordulok Önhöz, mert további információkra van szükségem.",
          },
          {
            de: "Mit großem Interesse habe ich Ihre Anzeige gelesen.",
            hu: "Nagy érdeklődéssel olvastam a hirdetését.",
          },
        ],
      },
      {
        title: "A levél céljának megfogalmazása",
        body:
          "Ezekkel a mondatokkal gyorsan és udvariasan meg tudod mondani, miért írsz. Vizsgán különösen hasznosak, mert rögtön rendezetté teszik a bevezetést.",
        examples: [
          {
            de: "Ich wende mich an Sie bezüglich Ihres Angebots.",
            hu: "Az ajánlatával kapcsolatban fordulok Önhöz.",
          },
          {
            de: "Ich schreibe Ihnen wegen des Deutschkurses.",
            hu: "A némettanfolyam miatt írok Önnek.",
          },
          {
            de: "Ich interessiere mich für Ihre Anzeige und hätte dazu einige Fragen.",
            hu: "Érdekel a hirdetése, és lenne hozzá néhány kérdésem.",
          },
          {
            de: "Der Grund meines Schreibens ist meine Anmeldung zum Kurs.",
            hu: "Levelem oka a tanfolyamra való jelentkezésem.",
          },
          {
            de: "Ich möchte mich erkundigen, ob noch Plätze frei sind.",
            hu: "Szeretnék érdeklődni, hogy vannak-e még szabad helyek.",
          },
        ],
      },
      {
        title: "Információkérés",
        body:
          "Információkérésnél a könnten/würden formák udvariasabbak. Ezek B1/B2 levelekben nagyon jól használhatók, mert természetesebbek, mint a túl direkt kérdések.",
        examples: [
          {
            de: "Könnten Sie mir bitte weitere Informationen zusenden?",
            hu: "El tudna küldeni nekem további információkat?",
          },
          {
            de: "Könnten Sie mir bitte mitteilen, wie viel der Kurs kostet?",
            hu: "Meg tudná írni, mennyibe kerül a tanfolyam?",
          },
          {
            de: "Ich würde gern wissen, wann der Kurs beginnt.",
            hu: "Szeretném tudni, mikor kezdődik a tanfolyam.",
          },
          {
            de: "Mich würde interessieren, ob die Teilnahme auch online möglich ist.",
            hu: "Érdekelne, hogy online is lehetséges-e a részvétel.",
          },
          {
            de: "Bitte informieren Sie mich über die Anmeldefrist.",
            hu: "Kérem, tájékoztasson a jelentkezési határidőről.",
          },
        ],
      },
      {
        title: "Kérés és udvarias felszólítás",
        body:
          "Ha kérsz valamit, a bitte önmagában nem mindig elég. A könnten Sie, würden Sie és ich wäre Ihnen dankbar szerkezetek sokkal udvariasabbá teszik a levelet.",
        examples: [
          {
            de: "Könnten Sie mir bitte bis Freitag antworten?",
            hu: "Tudna nekem péntekig válaszolni?",
          },
          {
            de: "Würden Sie mir bitte die Unterlagen per E-Mail schicken?",
            hu: "Elküldené nekem az iratokat e-mailben?",
          },
          {
            de: "Ich wäre Ihnen sehr dankbar, wenn Sie mir helfen könnten.",
            hu: "Nagyon hálás lennék, ha tudna segíteni.",
          },
          {
            de: "Bitte lassen Sie mich wissen, ob der Termin möglich ist.",
            hu: "Kérem, jelezze, hogy lehetséges-e az időpont.",
          },
          {
            de: "Ich bitte Sie um eine kurze Rückmeldung.",
            hu: "Kérem, küldjön rövid visszajelzést.",
          },
        ],
      },
      {
        title: "Panasz és probléma leírása",
        body:
          "Panaszlevélben fontos, hogy tárgyilagos maradj. Először írd le a problémát, utána mondd el, mit vársz megoldásként. A leider szó sokat segít abban, hogy a mondat természetes és udvarias legyen.",
        examples: [
          {
            de: "Leider muss ich Ihnen mitteilen, dass ich mit dem Service nicht zufrieden bin.",
            hu: "Sajnos közölnöm kell Önnel, hogy nem vagyok elégedett a szolgáltatással.",
          },
          {
            de: "Das Produkt ist beschädigt bei mir angekommen.",
            hu: "A termék sérülten érkezett meg hozzám.",
          },
          {
            de: "Obwohl ich rechtzeitig bezahlt habe, habe ich die Ware noch nicht erhalten.",
            hu: "Bár időben fizettem, még nem kaptam meg az árut.",
          },
          {
            de: "Ich bitte Sie daher um eine schnelle Lösung.",
            hu: "Ezért kérem Önt, hogy gyors megoldást találjon.",
          },
          {
            de: "Ich erwarte eine Erstattung des Kaufpreises.",
            hu: "A vételár visszatérítését várom.",
          },
        ],
      },
      {
        title: "Vélemény és érvelés",
        body:
          "B2 szinten gyakran kell véleményt írni vagy érvelni. Ezek a fordulatok segítenek abban, hogy ne csak egyszerű mondatokat írj, hanem kapcsolódjanak egymáshoz a gondolataid.",
        examples: [
          {
            de: "Meiner Meinung nach ist dieses Angebot sehr hilfreich.",
            hu: "Véleményem szerint ez az ajánlat nagyon hasznos.",
          },
          {
            de: "Ich bin der Ansicht, dass flexible Arbeitszeiten viele Vorteile haben.",
            hu: "Az a véleményem, hogy a rugalmas munkaidőnek sok előnye van.",
          },
          {
            de: "Ein wichtiger Vorteil ist, dass man Zeit sparen kann.",
            hu: "Fontos előny, hogy időt lehet megtakarítani.",
          },
          {
            de: "Auf der anderen Seite darf man nicht vergessen, dass es auch Nachteile gibt.",
            hu: "Másrészt nem szabad elfelejteni, hogy hátrányok is vannak.",
          },
          {
            de: "Zusammenfassend lässt sich sagen, dass beide Seiten wichtig sind.",
            hu: "Összefoglalva elmondható, hogy mindkét oldal fontos.",
          },
        ],
      },
      {
        title: "Időpont, lemondás, halasztás",
        body:
          "Hivatalos és félhivatalos levelekben gyakori, hogy időpontot kell kérni, módosítani vagy lemondani. Ilyenkor mindig adj rövid okot, és ajánlj alternatívát.",
        examples: [
          {
            de: "Leider kann ich den Termin am Montag nicht wahrnehmen.",
            hu: "Sajnos a hétfői időponton nem tudok részt venni.",
          },
          {
            de: "Wäre es möglich, den Termin auf nächste Woche zu verschieben?",
            hu: "Lehetséges lenne az időpontot a jövő hétre áttenni?",
          },
          {
            de: "Ich möchte den Termin gern absagen, da ich krank geworden bin.",
            hu: "Szeretném lemondani az időpontot, mert megbetegedtem.",
          },
          {
            de: "Als Alternative könnte ich Ihnen Dienstag oder Donnerstag anbieten.",
            hu: "Alternatívaként a keddet vagy a csütörtököt tudnám felajánlani.",
          },
          {
            de: "Bitte entschuldigen Sie die Umstände.",
            hu: "Elnézést kérek a kellemetlenségért.",
          },
        ],
      },
      {
        title: "Zárás és elköszönés",
        body:
          "A levél végén érdemes még egyszer udvariasan jelezni, hogy választ vársz. Hivatalos levélben a Mit freundlichen Grüßen a legbiztonságosabb zárás.",
        table: [
          {
            tense: "Válasz kérése",
            form: "Ich freue mich auf Ihre Antwort.",
            example: "Ich freue mich auf Ihre baldige Antwort.",
          },
          {
            tense: "Előre köszönet",
            form: "Vielen Dank im Voraus.",
            example: "Vielen Dank im Voraus für Ihre Hilfe.",
          },
          {
            tense: "Hivatalos zárás",
            form: "Mit freundlichen Grüßen",
            example: "Mit freundlichen Grüßen, Anna Nagy",
          },
          {
            tense: "Félhivatalos zárás",
            form: "Freundliche Grüße / Beste Grüße",
            example: "Beste Grüße, Anna",
          },
        ],
        examples: [
          {
            de: "Für eine schnelle Antwort wäre ich Ihnen sehr dankbar.",
            hu: "Nagyon hálás lennék egy gyors válaszért.",
          },
          {
            de: "Ich bedanke mich im Voraus für Ihre Unterstützung.",
            hu: "Előre is köszönöm a támogatását.",
          },
        ],
      },
      {
        title: "Mini vázlat vizsgalevélhez",
        body:
          "Ha vizsgán gyorsan kell levelet írni, ez a sorrend segít: megszólítás, miért írsz, részletek vagy kérdések, kérés vagy elvárás, zárás. Ne legyen túl bonyolult, inkább legyen világos és udvarias.",
        table: [
          {
            tense: "1. Kezdés",
            form: "Sehr geehrte Damen und Herren, ich wende mich an Sie...",
            example: "Ich wende mich an Sie bezüglich Ihres Angebots.",
          },
          {
            tense: "2. Részletek",
            form: "Ich hätte dazu einige Fragen...",
            example: "Ich würde gern wissen, wann der Kurs beginnt.",
          },
          {
            tense: "3. Kérés",
            form: "Könnten Sie mir bitte...",
            example: "Könnten Sie mir bitte weitere Informationen zusenden?",
          },
          {
            tense: "4. Zárás",
            form: "Vielen Dank im Voraus...",
            example: "Ich freue mich auf Ihre Antwort.",
          },
        ],
      },
    ],
    quickRules: [
      "Hivatalos kezdés: Sehr geehrte Damen und Herren,",
      "A levél célja: Ich wende mich an Sie, weil...",
      "Udvarias kérés: Könnten Sie mir bitte ...?",
      "Információkérés: Ich würde gern wissen, ob/wann/wie...",
      "Panasz: Leider muss ich Ihnen mitteilen, dass...",
      "Zárás: Ich freue mich auf Ihre Antwort.",
      "Biztonságos elköszönés: Mit freundlichen Grüßen",
    ],
  },
  {
    id: "pronominaladverbien",
    mode: "grammar-guide-pronominaladverbien",
    title: "Pronominaladverbien",
    subtitle: "da-, dar-, wo- és wor-alakok igés vonzatokkal",
    level: "B1/B2",
    icon: "🔎",
    practice: {
      available: true,
      mode: "pronominaladverb",
      label: "Pronominaladverbien gyakorlása",
      type: "choice-writing",
    },
    sections: [
      {
        title: "Mik azok a Pronominaladverbien?",
        body:
          "A Pronominaladverbien olyan alakok, amelyek egy prepozíciót és egy dologra, témára vagy egész mondatra való utalást kapcsolnak össze. Magyarul gyakran úgy fordítjuk őket: erre, arra, erről, arról, ezzel, azzal, amire, amiről.",
        examples: [
          {
            de: "Ich warte auf den Termin. → Ich warte darauf.",
            hu: "Várok az időpontra. → Arra várok.",
          },
          {
            de: "Wir sprechen über das Problem. → Wir sprechen darüber.",
            hu: "Beszélünk a problémáról. → Arról beszélünk.",
          },
        ],
      },
      {
        title: "Alapötlet: da + prepozíció",
        body:
          "Ha egy dologra vagy korábban említett témára utalsz vissza, da-alakot használsz. Ez főleg olyan igéknél fontos, amelyek fix prepozícióval állnak: warten auf, sprechen über, sich interessieren für, teilnehmen an.",
        formula: "da + Präposition = darauf, darüber, dafür, daran",
        examples: [
          {
            de: "Ich freue mich auf die Reise. → Ich freue mich darauf.",
            hu: "Örülök az utazásnak. → Örülök neki / annak.",
          },
          {
            de: "Sie interessiert sich für Musik. → Sie interessiert sich dafür.",
            hu: "Érdekli a zene. → Érdekli az.",
          },
        ],
      },
      {
        title: "Kérdésben: wo + prepozíció",
        body:
          "Ha dologra vagy témára kérdezel rá, wo-alakot használsz. Ez nem helyet jelent, hanem azt, hogy mire, miről, mivel, miben. A jelentést mindig az ige vonzata adja meg.",
        formula: "wo + Präposition = worauf, worüber, wofür, woran",
        examples: [
          {
            de: "Worauf wartest du?",
            hu: "Mire vársz?",
          },
          {
            de: "Worüber sprecht ihr?",
            hu: "Miről beszéltek?",
          },
          {
            de: "Wofür interessierst du dich?",
            hu: "Mi iránt érdeklődsz?",
          },
        ],
      },
      {
        title: "Mikor kerül bele az r?",
        body:
          "Ha a prepozíció magánhangzóval kezdődik, az alakba bekerül egy r. Ez kiejtés miatt történik: da + auf nem daauf, hanem darauf; wo + über nem woüber, hanem worüber.",
        table: [
          {
            tense: "auf",
            form: "darauf / worauf",
            example: "Ich warte darauf. / Worauf wartest du?",
          },
          {
            tense: "über",
            form: "darüber / worüber",
            example: "Wir sprechen darüber. / Worüber sprecht ihr?",
          },
          {
            tense: "an",
            form: "daran / woran",
            example: "Ich denke daran. / Woran denkst du?",
          },
          {
            tense: "in",
            form: "darin / worin",
            example: "Darin liegt das Problem. / Worin liegt das Problem?",
          },
        ],
      },
      {
        title: "Személyre nem így kérdezünk",
        body:
          "A legfontosabb szabály: Pronominaladverbien általában dolgokra, témákra vagy teljes mondatokra utalnak. Személyeknél a prepozíció + wen/wem szerkezetet használjuk.",
        examples: [
          {
            de: "Ich warte auf den Bus. → Worauf wartest du?",
            hu: "A buszra várok. → Mire vársz?",
          },
          {
            de: "Ich warte auf meinen Freund. → Auf wen wartest du?",
            hu: "A barátomra várok. → Kire vársz?",
          },
          {
            de: "Sie spricht mit dem Lehrer. → Mit wem spricht sie?",
            hu: "A tanárral beszél. → Kivel beszél?",
          },
        ],
      },
      {
        title: "Gyakori igés szerkezetek",
        body:
          "Ezeket érdemes párban tanulni: ige + prepozíció + pronominaladverb. Így nem külön szavakat tanulsz, hanem mondatban használható kész szerkezeteket.",
        table: [
          {
            tense: "warten auf",
            form: "darauf / worauf",
            example: "Ich warte darauf. / Worauf wartest du?",
          },
          {
            tense: "sprechen über",
            form: "darüber / worüber",
            example: "Wir sprechen darüber. / Worüber sprecht ihr?",
          },
          {
            tense: "sich freuen auf",
            form: "darauf / worauf",
            example: "Ich freue mich darauf. / Worauf freust du dich?",
          },
          {
            tense: "sich interessieren für",
            form: "dafür / wofür",
            example: "Sie interessiert sich dafür. / Wofür interessiert sie sich?",
          },
          {
            tense: "teilnehmen an",
            form: "daran / woran",
            example: "Ich nehme daran teil. / Woran nimmst du teil?",
          },
          {
            tense: "abhängen von",
            form: "davon / wovon",
            example: "Das hängt davon ab. / Wovon hängt das ab?",
          },
        ],
      },
      {
        title: "Egész mondatra is utalhat",
        body:
          "A da-alak nemcsak egy főnévre, hanem egy teljes gondolatra vagy mellékmondatra is utalhat. Ilyenkor magyarul gyakran azt mondjuk: arra, azon, attól, abban.",
        examples: [
          {
            de: "Ich freue mich darauf, dich wiederzusehen.",
            hu: "Örülök annak, hogy újra látlak.",
          },
          {
            de: "Er denkt daran, den Kurs zu wechseln.",
            hu: "Gondol arra, hogy kurzust váltson.",
          },
          {
            de: "Es hängt davon ab, ob wir genug Zeit haben.",
            hu: "Attól függ, hogy van-e elég időnk.",
          },
        ],
      },
    ],
    quickRules: [
      "Dologra/témára: da + prepozíció.",
      "Kérdésben dologra: wo + prepozíció.",
      "Magánhangzó előtt r kerül be: darauf, worüber.",
      "Személyre: auf wen, mit wem, für wen.",
      "Az ige vonzata dönti el a prepozíciót.",
      "Gyakori párok: warten auf → darauf/worauf.",
      "Egész mellékmondatra is utalhat: Ich freue mich darauf, dass...",
    ],
  },
  {
    id: "partizip-i-und-ii",
    mode: "grammar-guide-partizip-i-und-ii",
    title: "Partizip I und II",
    subtitle: "Folyamat, állapot, melléknévi használat és összetett igeidők",
    level: "B1/B2",
    icon: "🧩",
    practice: {
      available: false,
      label: "Gyakorló hamarosan",
      type: "planned",
    },
    sections: [
      {
        title: "Mi a Partizip I és a Partizip II?",
        body:
          "A Partizip I és Partizip II átmeneti alakok: igéből képződnek, de gyakran melléknévként viselkednek. A Partizip I általában folyamatot vagy egyidejű cselekvést fejez ki, a Partizip II pedig gyakran befejezettséget, eredményt vagy passzív jelentést.",
        examples: [
          {
            de: "der lachende Mann",
            hu: "a nevető férfi",
          },
          {
            de: "der geschriebene Brief",
            hu: "a megírt levél",
          },
        ],
      },
      {
        title: "Partizip I képzése",
        body:
          "A Partizip I képzése nagyon szabályos: az infinitív alakhoz hozzáadjuk a -d végződést. Melléknévként a főnév előtt áll, és ugyanúgy kap melléknévi végződést, mint más melléknevek.",
        formula: "Infinitiv + d = Partizip I",
        examples: [
          {
            de: "lachen → lachend → das lachende Kind",
            hu: "nevetni → nevető → a nevető gyerek",
          },
          {
            de: "warten → wartend → die wartenden Menschen",
            hu: "várni → várakozó → a várakozó emberek",
          },
          {
            de: "passen → passend → eine passende Lösung",
            hu: "illeni → megfelelő → egy megfelelő megoldás",
          },
        ],
      },
      {
        title: "Partizip I jelentése",
        body:
          "A Partizip I azt mutatja, hogy valaki vagy valami éppen csinál valamit, vagy valamilyen aktív tulajdonsága van. Magyarul gyakran -ó/-ő végű melléknévi igenévvel fordítjuk.",
        examples: [
          {
            de: "Die singende Frau steht auf der Bühne.",
            hu: "Az éneklő nő a színpadon áll.",
          },
          {
            de: "Das klingelnde Telefon nervt mich.",
            hu: "A csörgő telefon idegesít.",
          },
          {
            de: "Das ist ein überzeugendes Argument.",
            hu: "Ez egy meggyőző érv.",
          },
        ],
      },
      {
        title: "Partizip II képzése",
        body:
          "A Partizip II képzése attól függ, hogy szabályos vagy rendhagyó igéről van-e szó. Szabályos igéknél általában ge- + t, rendhagyó igéknél gyakran ge- + en a minta. Elváló igekötőnél a ge a két rész közé kerül.",
        table: [
          {
            tense: "szabályos",
            form: "ge- + igető + -t",
            example: "machen → gemacht",
          },
          {
            tense: "rendhagyó",
            form: "ge- + változott tő + -en",
            example: "schreiben → geschrieben",
          },
          {
            tense: "elváló igekötő",
            form: "igekötő + ge + ige",
            example: "aufmachen → aufgemacht",
          },
          {
            tense: "nem elváló / -ieren",
            form: "nincs ge-",
            example: "besuchen → besucht, studieren → studiert",
          },
        ],
      },
      {
        title: "Partizip II az összetett igeidőkben",
        body:
          "A Partizip II kell a Perfekt, Plusquamperfekt és bizonyos passzív szerkezetek képzéséhez. Ilyenkor nem melléknévként, hanem az igei szerkezet részeként használjuk.",
        table: [
          {
            tense: "Perfekt",
            form: "haben/sein + Partizip II",
            example: "Ich habe den Text gelesen.",
          },
          {
            tense: "Plusquamperfekt",
            form: "hatte/war + Partizip II",
            example: "Ich hatte den Text gelesen.",
          },
          {
            tense: "Vorgangspassiv",
            form: "werden + Partizip II",
            example: "Der Text wird gelesen.",
          },
          {
            tense: "Zustandspassiv",
            form: "sein + Partizip II",
            example: "Die Tür ist geöffnet.",
          },
        ],
      },
      {
        title: "Partizip II melléknévként",
        body:
          "A Partizip II főnév előtt gyakran olyan, mint egy melléknév. Ilyenkor azt fejezi ki, hogy valami már megtörtént, elkészült, befejeződött, vagy valami hatás érte az adott dolgot.",
        examples: [
          {
            de: "der geöffnete Brief",
            hu: "a kinyitott levél",
          },
          {
            de: "die bezahlte Rechnung",
            hu: "a kifizetett számla",
          },
          {
            de: "ein verlorener Schlüssel",
            hu: "egy elveszett kulcs",
          },
          {
            de: "die geschlossene Tür",
            hu: "a csukott / bezárt ajtó",
          },
        ],
      },
      {
        title: "Partizip I vagy Partizip II?",
        body:
          "A különbség lényege: a Partizip I aktív és folyamatban lévő jelentésű, a Partizip II gyakran passzív vagy befejezett jelentésű. Érdemes mindig megkérdezni: a főnév csinálja a cselekvést, vagy vele történik valami?",
        table: [
          {
            tense: "Partizip I",
            form: "aktív / folyamatban van",
            example: "der schreibende Schüler = a diák ír",
          },
          {
            tense: "Partizip II",
            form: "befejezett / passzív eredmény",
            example: "der geschriebene Text = a szöveget megírták",
          },
          {
            tense: "Partizip I",
            form: "valaki éppen olvas",
            example: "die lesende Frau",
          },
          {
            tense: "Partizip II",
            form: "valamit már elolvastak",
            example: "das gelesene Buch",
          },
        ],
      },
      {
        title: "Ragozás főnév előtt",
        body:
          "Ha a Partizip I vagy Partizip II főnév előtt áll, melléknévként ragozódik. Ez azt jelenti, hogy ugyanazokat a végződéseket kapja, mint az Adjektivdeklinationnál.",
        examples: [
          {
            de: "der wartende Mann",
            hu: "a várakozó férfi",
          },
          {
            de: "ein wartender Mann",
            hu: "egy várakozó férfi",
          },
          {
            de: "ich sehe den wartenden Mann",
            hu: "látom a várakozó férfit",
          },
          {
            de: "mit dem geöffneten Fenster",
            hu: "a nyitott ablakkal",
          },
        ],
      },
      {
        title: "Tipikus hibák",
        body:
          "A leggyakoribb hiba, hogy a tanuló Partizip I-et használ ott, ahol eredményről van szó, vagy Partizip II-t ott, ahol aktív cselekvés történik. A másik gyakori hiba a melléknévi végződés elhagyása.",
        examples: [
          {
            de: "richtig: die kochende Mutter",
            hu: "helyes: a főző anya, mert az anya főz",
          },
          {
            de: "richtig: das gekochte Essen",
            hu: "helyes: a megfőzött étel, mert az ételt megfőzték",
          },
          {
            de: "richtig: ein interessantes Thema",
            hu: "helyes: egy érdekes téma",
          },
          {
            de: "richtig: die vergessene Aufgabe",
            hu: "helyes: az elfelejtett feladat",
          },
        ],
      },
    ],
    quickRules: [
      "Partizip I: Infinitiv + d.",
      "Partizip I jelentése: aktív, folyamatban lévő.",
      "Partizip II: gyakran befejezett vagy passzív jelentés.",
      "Perfekt: haben/sein + Partizip II.",
      "Passiv: werden/sein + Partizip II.",
      "Főnév előtt mindkettő melléknévként ragozódik.",
      "Kérdés: a főnév csinálja, vagy vele történik?",
    ],
  },
  {
    id: "infinitivsaetze-vs-nebensaetze",
    mode: "grammar-guide-infinitivsaetze-vs-nebensaetze",
    title: "Infinitivsätze vs. Nebensätze",
    subtitle: "zu + Infinitiv, dass-Satz, damit, um zu és alanyi azonosság",
    level: "B1/B2",
    icon: "🧭",
    practice: {
      available: false,
      label: "Gyakorló hamarosan",
      type: "planned",
    },
    sections: [
      {
        title: "Mi a különbség?",
        body:
          "Az Infinitivsatz egy rövidebb mellékmondatszerű szerkezet zu + Infinitivvel. A Nebensatz teljes mellékmondat ragozott igével. A legfontosabb kérdés: ugyanaz-e az alany a két tagmondatban? Ha igen, gyakran használható zu + Infinitiv. Ha nem, általában teljes mellékmondat kell.",
        examples: [
          {
            de: "Ich hoffe, die Prüfung zu bestehen.",
            hu: "Remélem, hogy sikerül a vizsgám. Ugyanaz az alany: ich.",
          },
          {
            de: "Ich hoffe, dass du die Prüfung bestehst.",
            hu: "Remélem, hogy sikerül a vizsgád. Más az alany: ich és du.",
          },
        ],
      },
      {
        title: "Infinitivsatz: zu + Infinitiv",
        body:
          "Az Infinitivsatzban az ige nem ragozódik, hanem zu + Infinitiv alakban áll. A zu általában közvetlenül az infinitív előtt van. Elváló igekötős igéknél a zu az igekötő és az ige közé kerül.",
        formula: "Hauptsatz + Komma + zu + Infinitiv",
        examples: [
          {
            de: "Ich versuche, jeden Tag Deutsch zu lernen.",
            hu: "Megpróbálok minden nap németet tanulni.",
          },
          {
            de: "Er hat vor, früher aufzustehen.",
            hu: "Azt tervezi, hogy korábban kel fel.",
          },
          {
            de: "Es ist wichtig, regelmäßig zu üben.",
            hu: "Fontos rendszeresen gyakorolni.",
          },
        ],
      },
      {
        title: "Nebensatz: dass, weil, wenn, obwohl",
        body:
          "A Nebensatz teljes mellékmondat. Van saját alanya és ragozott igéje, amely általában a mondat végére kerül. Akkor különösen fontos, ha a két tagmondat alanya nem ugyanaz.",
        formula: "Kötőszó + Subjekt + ... + ragozott ige",
        examples: [
          {
            de: "Ich glaube, dass er heute kommt.",
            hu: "Azt hiszem, hogy ma jön.",
          },
          {
            de: "Ich bleibe zu Hause, weil ich krank bin.",
            hu: "Otthon maradok, mert beteg vagyok.",
          },
          {
            de: "Wenn ich Zeit habe, lerne ich Deutsch.",
            hu: "Ha van időm, németet tanulok.",
          },
        ],
      },
      {
        title: "Alanyi azonosság",
        body:
          "A zu + Infinitiv leggyakrabban akkor természetes, ha a főmondat és az infinitíves szerkezet alanya ugyanaz. Ha az alany különböző, dass-Satz vagy más Nebensatz kell.",
        table: [
          {
            tense: "Ugyanaz az alany",
            form: "zu + Infinitiv",
            example: "Ich plane, nach Wien zu fahren.",
          },
          {
            tense: "Más az alany",
            form: "dass + mellékmondat",
            example: "Ich plane, dass mein Sohn nach Wien fährt.",
          },
          {
            tense: "Általános állítás",
            form: "es ist + melléknév + zu + Infinitiv",
            example: "Es ist schwer, diese Regel zu erklären.",
          },
        ],
      },
      {
        title: "um ... zu vagy damit?",
        body:
          "Mindkettő célt fejez ki. Az um ... zu akkor használható, ha ugyanaz az alany. A damit akkor kell, ha más az alany, vagy ha teljes mellékmondatot akarunk használni.",
        table: [
          {
            tense: "um ... zu",
            form: "azonos alany",
            example: "Ich lerne Deutsch, um in Deutschland zu arbeiten.",
          },
          {
            tense: "damit",
            form: "különböző alany",
            example: "Ich helfe dir, damit du die Prüfung bestehst.",
          },
          {
            tense: "damit",
            form: "teljes mellékmondat",
            example: "Sie spricht langsam, damit alle sie verstehen.",
          },
        ],
      },
      {
        title: "Gyakori igék Infinitivsatz előtt",
        body:
          "Bizonyos igék után nagyon gyakori a zu + Infinitiv. Ezeket érdemes kész szerkezetként megtanulni, mert B1/B2 szinten írásban és beszédben is sokat segítenek.",
        table: [
          {
            tense: "versuchen",
            form: "megpróbálni",
            example: "Ich versuche, ruhig zu bleiben.",
          },
          {
            tense: "planen / vorhaben",
            form: "tervezni",
            example: "Wir haben vor, am Samstag zu lernen.",
          },
          {
            tense: "hoffen",
            form: "remélni",
            example: "Ich hoffe, bald eine Antwort zu bekommen.",
          },
          {
            tense: "vergessen",
            form: "elfelejteni",
            example: "Er hat vergessen, die E-Mail zu schicken.",
          },
          {
            tense: "sich freuen",
            form: "örülni valaminek",
            example: "Ich freue mich, dich zu sehen.",
          },
        ],
      },
      {
        title: "Es ist ... zu + Infinitiv",
        body:
          "Nagyon hasznos szerkezet véleményhez és általános állításokhoz. Ilyenkor nincs konkrét személy, hanem általánosságban mondjuk, hogy valami könnyű, nehéz, fontos, lehetséges vagy veszélyes.",
        examples: [
          {
            de: "Es ist wichtig, pünktlich zu sein.",
            hu: "Fontos pontosnak lenni.",
          },
          {
            de: "Es ist nicht leicht, fließend zu sprechen.",
            hu: "Nem könnyű folyékonyan beszélni.",
          },
          {
            de: "Es ist möglich, online zu lernen.",
            hu: "Lehetséges online tanulni.",
          },
        ],
      },
      {
        title: "Infinitivszólam vesszővel",
        body:
          "A hosszabb zu + Infinitiv szerkezeteket németül gyakran vessző választja el a főmondattól. A gyakorlatban B1/B2 írásban érdemes vesszőt tenni, főleg wenn um ... zu, ohne ... zu, anstatt ... zu szerkezeteket használsz.",
        examples: [
          {
            de: "Ich lerne jeden Tag, um bessere Chancen zu haben.",
            hu: "Minden nap tanulok, hogy jobb esélyeim legyenek.",
          },
          {
            de: "Er ging nach Hause, ohne sich zu verabschieden.",
            hu: "Hazament anélkül, hogy elköszönt volna.",
          },
          {
            de: "Sie sieht Serien, anstatt Vokabeln zu lernen.",
            hu: "Sorozatokat néz ahelyett, hogy szavakat tanulna.",
          },
        ],
      },
      {
        title: "Tipikus hibák",
        body:
          "A leggyakoribb hiba, hogy a tanuló zu + Infinitivet használ akkor is, amikor más az alany. A másik hiba, hogy a zu rossz helyre kerül elváló igekötős igéknél.",
        examples: [
          {
            de: "richtig: Ich möchte, dass du mir hilfst.",
            hu: "Helyes, mert más az alany: ich és du.",
          },
          {
            de: "richtig: Ich versuche, früher aufzustehen.",
            hu: "Helyes: aufstehen → aufzustehen.",
          },
          {
            de: "richtig: Ich lerne Deutsch, um eine Arbeit zu finden.",
            hu: "Helyes: cél, ugyanaz az alany.",
          },
          {
            de: "richtig: Ich erkläre es dir, damit du es verstehst.",
            hu: "Helyes: cél, más az alany.",
          },
        ],
      },
    ],
    quickRules: [
      "Ugyanaz az alany: gyakran zu + Infinitiv.",
      "Más az alany: általában dass/damit Nebensatz.",
      "Infinitivsatz: az ige nem ragozódik.",
      "Nebensatz: a ragozott ige a végére kerül.",
      "Cél azonos alannyal: um ... zu.",
      "Cél más alannyal: damit.",
      "Elváló igéknél: aufzustehen, einzukaufen.",
    ],
  },
  {
    id: "konjunktiv-ii",
    mode: "grammar-guide-konjunktiv-ii",
    title: "Konjunktiv II",
    subtitle: "Udvarias kérések, feltételek, kívánságok és múlt idejű irreális helyzetek",
    level: "B1/B2",
    icon: "💭",
    practice: {
      available: false,
      label: "Gyakorló hamarosan",
      type: "planned",
    },
    sections: [
      {
        title: "Mire jó a Konjunktiv II?",
        body:
          "A Konjunktiv II a németben nem csak nyelvtani forma, hanem nagyon fontos kommunikációs eszköz. Udvariasabbá teszi a kéréseket, óvatosabbá a véleményt, és segít olyan helyzetekről beszélni, amelyek nem valósak, csak elképzeltek vagy már nem megváltoztathatók.",
        examples: [
          {
            de: "Könnten Sie mir bitte helfen?",
            hu: "Tudna nekem segíteni?",
          },
          {
            de: "Wenn ich mehr Zeit hätte, würde ich mehr lesen.",
            hu: "Ha több időm lenne, többet olvasnék.",
          },
        ],
      },
      {
        title: "Jelen idejű Konjunktiv II: würde + Infinitiv",
        body:
          "A legtöbb igénél a legbiztonságosabb és leggyakoribb forma a würde + Infinitiv. Ez B1/B2 szinten különösen hasznos, mert szinte minden igével működik, és természetes beszélt nyelvben is.",
        formula: "Subjekt + würde + ... + Infinitiv",
        examples: [
          {
            de: "Ich würde gern in Deutschland arbeiten.",
            hu: "Szívesen dolgoznék Németországban.",
          },
          {
            de: "Wir würden am Wochenende kommen.",
            hu: "Eljönnénk hétvégén.",
          },
          {
            de: "Was würdest du machen?",
            hu: "Te mit csinálnál?",
          },
        ],
      },
      {
        title: "Fontos saját alakok",
        body:
          "Néhány gyakori igénél nem a würde-forma a legtermészetesebb, hanem a saját Konjunktiv II alak. Ezeket érdemes külön megtanulni, mert nagyon gyakran előfordulnak levelekben, beszédben és vizsgán.",
        table: [
          {
            tense: "sein",
            form: "wäre",
            example: "Es wäre schön, wenn du kommen könntest.",
          },
          {
            tense: "haben",
            form: "hätte",
            example: "Ich hätte gern einen Termin.",
          },
          {
            tense: "werden",
            form: "würde",
            example: "Ich würde das anders machen.",
          },
          {
            tense: "können",
            form: "könnte",
            example: "Könnten Sie das bitte wiederholen?",
          },
          {
            tense: "müssen",
            form: "müsste",
            example: "Ich müsste früher aufstehen.",
          },
          {
            tense: "dürfen",
            form: "dürfte",
            example: "Dürfte ich kurz etwas fragen?",
          },
          {
            tense: "sollen",
            form: "sollte",
            example: "Du solltest mehr üben.",
          },
          {
            tense: "wollen",
            form: "wollte",
            example: "Ich wollte fragen, ob Sie Zeit haben.",
          },
        ],
      },
      {
        title: "Udvarias kérés és hivatalos stílus",
        body:
          "A Konjunktiv II egyik legfontosabb gyakorlati szerepe az udvariasság. A können, dürfen, mögen és würde formákkal sokkal természetesebb és kevésbé direkt lesz a kérés.",
        examples: [
          {
            de: "Könnten Sie mir bitte die Unterlagen schicken?",
            hu: "El tudná küldeni nekem a dokumentumokat?",
          },
          {
            de: "Dürfte ich Sie etwas fragen?",
            hu: "Kérdezhetnék Öntől valamit?",
          },
          {
            de: "Ich hätte gern weitere Informationen.",
            hu: "Szeretnék további információkat.",
          },
          {
            de: "Ich würde mich über eine schnelle Antwort freuen.",
            hu: "Örülnék egy gyors válasznak.",
          },
        ],
      },
      {
        title: "Feltételes mondatok: wenn + Konjunktiv II",
        body:
          "Ha elképzelt, nem valós vagy bizonytalan helyzetről beszélünk, gyakran wenn-mondatot használunk. A wenn-mondatban a ragozott ige a végére kerül, a főmondatban pedig gyakran würde vagy egy saját Konjunktiv II alak áll.",
        formula: "Wenn + Subjekt + ... + Konjunktiv II, würde/Konjunktiv II + Subjekt + Infinitiv",
        examples: [
          {
            de: "Wenn ich mehr Geld hätte, würde ich eine Reise machen.",
            hu: "Ha több pénzem lenne, utaznék.",
          },
          {
            de: "Wenn das Wetter besser wäre, könnten wir spazieren gehen.",
            hu: "Ha jobb lenne az idő, elmehetnénk sétálni.",
          },
          {
            de: "Wenn ich du wäre, würde ich noch einmal nachfragen.",
            hu: "Ha a helyedben lennék, még egyszer rákérdeznék.",
          },
        ],
      },
      {
        title: "Kívánságok és irreális jelen",
        body:
          "A Konjunktiv II-vel kívánságokat is kifejezhetünk. Ilyenkor gyakran használjuk a wenn doch, wenn nur vagy ich wünschte szerkezeteket. Ezek azt mutatják, hogy a beszélő mást szeretne, mint ami valójában van.",
        examples: [
          {
            de: "Wenn ich doch mehr Zeit hätte!",
            hu: "Bárcsak több időm lenne!",
          },
          {
            de: "Wenn es nicht so teuer wäre!",
            hu: "Bárcsak ne lenne ilyen drága!",
          },
          {
            de: "Ich wünschte, ich könnte besser Deutsch sprechen.",
            hu: "Bárcsak jobban tudnék németül beszélni.",
          },
        ],
      },
      {
        title: "Múlt idejű Konjunktiv II",
        body:
          "Ha olyan dologról beszélünk, ami a múltban nem történt meg, vagy máshogy történt, akkor a Konjunktiv II múlt idejét használjuk. Ez nagyon fontos, mert itt már nem a jelenről fantáziálunk, hanem egy lezárt múltbeli helyzetet képzelünk el másképp.",
        formula: "hätte/wäre + Partizip II",
        examples: [
          {
            de: "Ich hätte mehr gelernt.",
            hu: "Többet tanultam volna.",
          },
          {
            de: "Wir wären früher gekommen.",
            hu: "Korábban jöttünk volna.",
          },
          {
            de: "Sie hätte den Termin nicht vergessen.",
            hu: "Nem felejtette volna el az időpontot.",
          },
        ],
      },
      {
        title: "Hätte vagy wäre?",
        body:
          "A múlt idejű Konjunktiv II ugyanúgy választja ki a segédigét, mint a Perfekt: a legtöbb igénél hätte áll, mozgást vagy állapotváltozást kifejező igéknél gyakran wäre. A főige Partizip II alakban áll.",
        table: [
          {
            tense: "hätte + Partizip II",
            form: "machen, lernen, kaufen, sehen, vergessen",
            example: "Ich hätte das früher gemacht.",
          },
          {
            tense: "wäre + Partizip II",
            form: "kommen, gehen, fahren, aufstehen, bleiben",
            example: "Ich wäre gern länger geblieben.",
          },
          {
            tense: "Modalverb múltban",
            form: "hätte + Infinitiv + Modalverb",
            example: "Ich hätte mehr lernen sollen.",
          },
        ],
      },
      {
        title: "Irreális múlt wenn-mondattal",
        body:
          "Ha múltbeli feltételről beszélünk, mindkét mondatrészben múlt idejű Konjunktiv II állhat. Ez azt jelenti: a feltétel nem teljesült, ezért az eredmény sem történt meg.",
        formula: "Wenn + Subjekt + ... + hätte/wäre + Partizip II, hätte/wäre + Subjekt + Partizip II",
        examples: [
          {
            de: "Wenn ich früher losgegangen wäre, hätte ich den Zug erreicht.",
            hu: "Ha korábban indultam volna, elértem volna a vonatot.",
          },
          {
            de: "Wenn sie mehr gelernt hätte, hätte sie die Prüfung bestanden.",
            hu: "Ha többet tanult volna, sikerült volna a vizsgája.",
          },
          {
            de: "Wenn wir das gewusst hätten, wären wir zu Hause geblieben.",
            hu: "Ha ezt tudtuk volna, otthon maradtunk volna.",
          },
        ],
      },
      {
        title: "Jelen vagy múlt?",
        body:
          "A gyors döntéshez nézd meg, hogy a mondat mostani elképzelt helyzetről vagy múltbeli, már lezárt helyzetről szól-e. Ha most szeretnél mást: hätte/wäre/würde/könnte. Ha a múltban történt volna másképp: hätte/wäre + Partizip II.",
        table: [
          {
            tense: "Irreális jelen",
            form: "hätte/wäre/würde/könnte",
            example: "Wenn ich Zeit hätte, würde ich kommen.",
          },
          {
            tense: "Irreális múlt",
            form: "hätte/wäre + Partizip II",
            example: "Wenn ich Zeit gehabt hätte, wäre ich gekommen.",
          },
          {
            tense: "Udvarias kérés",
            form: "könnte/würde/hätte",
            example: "Könnten Sie mir helfen?",
          },
        ],
      },
      {
        title: "Tipikus hibák",
        body:
          "A leggyakoribb hiba, hogy a tanuló múltbeli helyzetnél is jelen idejű würde-formát használ. A másik tipikus hiba a szórend: wenn-mondatban a ragozott ige a végére kerül, és múlt idejű Konjunktiv II-ben a hätte/wäre is a végén áll.",
        examples: [
          {
            de: "Falsch: Wenn ich mehr gelernt würde. → Richtig: Wenn ich mehr gelernt hätte.",
            hu: "Múltbeli feltételhez hätte + Partizip II kell.",
          },
          {
            de: "Falsch: Wenn ich hätte Zeit. → Richtig: Wenn ich Zeit hätte.",
            hu: "Wenn-mondatban a ragozott ige a végére kerül.",
          },
          {
            de: "Falsch: Ich würde gegangen. → Richtig: Ich wäre gegangen.",
            hu: "gehen mozgást fejez ki, ezért wäre + Partizip II.",
          },
        ],
      },
    ],
    quickRules: [
      "Udvarias kérés: könnten, würden, hätten.",
      "Általános jelen idejű forma: würde + Infinitiv.",
      "Gyakori saját alakok: wäre, hätte, könnte, müsste, sollte.",
      "Wenn-mondatban a ragozott ige a végére kerül.",
      "Irreális jelen: Wenn ich Zeit hätte, würde ich kommen.",
      "Irreális múlt: hätte/wäre + Partizip II.",
      "Múltban Perfekt-logika: hätte gemacht, wäre gekommen.",
      "Modalverb múltban: Ich hätte mehr lernen sollen.",
    ],
  },
  {
    id: "modalpartikel",
    mode: "grammar-guide-modalpartikel",
    title: "Modalpartikel",
    subtitle: "halt, doch, mal, ja, denn, wohl, bloß, nur és aber beszélt nyelvben",
    level: "B1/B2",
    icon: "🗣️",
    practice: {
      available: false,
      label: "Beszédárnyalat gyakorló hamarosan",
      type: "planned",
    },
    sections: [
      {
        title: "Mik azok a Modalpartikeln?",
        body:
          "A Modalpartikeln olyan kis módosító szavak, amelyek nélkül a mondat nyelvtanilag és tartalmilag teljes lenne, mégis sokat változtatnak a hangulaton. Nem új információt adnak hozzá, hanem azt mutatják meg, hogyan viszonyul a beszélő ahhoz, amit mond: beletörődik, csodálkozik, sürget, finomít, vagy közvetlenebbé teszi a mondatot.",
        examples: [
          {
            de: "Er ist so.",
            hu: "Ő ilyen.",
          },
          {
            de: "Er ist halt so.",
            hu: "Ő már csak ilyen.",
          },
          {
            de: "Warte!",
            hu: "Várj!",
          },
          {
            de: "Warte doch mal!",
            hu: "Várj már egy kicsit!",
          },
        ],
      },
      {
        title: "Általános jellemzők",
        body:
          "A Modalpartikeln főleg beszédben fordulnak elő, írásban inkább csak informális üzenetekben, chatben vagy párbeszédes stílusban. Többnyire nem hangsúlyosak, és általában az ige után állnak a mondat középső részében. Ha van személyes névmás, akkor gyakran a névmás után kerülnek.",
        formula: "Subjekt + Verb + Pronomen + Modalpartikel + ...",
        examples: [
          {
            de: "Du weißt ja, wie es geht.",
            hu: "Hiszen tudod, hogy megy ez.",
          },
          {
            de: "Ich kann das halt nicht ändern.",
            hu: "Ezen egyszerűen nem tudok változtatni.",
          },
          {
            de: "Kannst du mir mal helfen?",
            hu: "Tudnál segíteni egy kicsit?",
          },
        ],
      },
      {
        title: "Gyors áttekintés",
        body:
          "Ugyanaz a német mondat nagyon más hangulatot kaphat attól függően, melyik Modalpartikel kerül bele. A magyar fordítás sokszor nem egy konkrét szóval történik, hanem a mondat hangulatával: hát, csak, már, hiszen, ugyan, talán, egyszerűen.",
        table: [
          {
            tense: "halt / eben",
            form: "beletörődés, általános tény",
            example: "Er ist halt so.",
          },
          {
            tense: "doch",
            form: "megerősítés, emlékeztetés, enyhébb felszólítás",
            example: "Er war doch da.",
          },
          {
            tense: "mal",
            form: "barátságosabb kérés vagy felszólítás",
            example: "Guck mal!",
          },
          {
            tense: "ja",
            form: "nyilvánvaló vagy várható dolog",
            example: "Du weißt ja, wie es geht.",
          },
          {
            tense: "denn",
            form: "közvetlenebb kérdés, meglepetés",
            example: "Was machst du denn?",
          },
          {
            tense: "wohl",
            form: "bizonytalanság, feltételezés",
            example: "Er wird wohl gewinnen.",
          },
          {
            tense: "bloß / nur",
            form: "erős figyelmeztetés vagy sürgetés",
            example: "Hör bloß damit auf!",
          },
          {
            tense: "aber",
            form: "meglepetés, erős benyomás",
            example: "Du bist aber groß geworden!",
          },
        ],
      },
      {
        title: "halt és eben",
        body:
          "A halt és az eben azt fejezi ki, hogy valamit tényként elfogadunk. Gyakran van benne beletörődés: ez van, nem nagyon lehet rajta változtatni. Magyarul sokszor így adható vissza: már csak, egyszerűen, hát.",
        examples: [
          {
            de: "Das kann man halt nicht ändern.",
            hu: "Ezt már nem lehet megváltoztatni.",
          },
          {
            de: "Er ist halt so.",
            hu: "Ő már csak ilyen.",
          },
          {
            de: "Dann müssen wir eben warten.",
            hu: "Akkor egyszerűen várnunk kell.",
          },
        ],
      },
      {
        title: "doch",
        body:
          "A doch gyakran megerősít egy kijelentést, főleg akkor, ha a beszélő úgy érzi, a másik fél elfelejtett vagy vitat valamit. Felszólításban enyhíthet, bátoríthat vagy nyomatékosíthat.",
        examples: [
          {
            de: "Er war doch da.",
            hu: "De hát itt volt.",
          },
          {
            de: "Das weißt du doch.",
            hu: "Ezt hiszen tudod.",
          },
          {
            de: "Warte doch ein bisschen!",
            hu: "Várj csak egy kicsit!",
          },
          {
            de: "Komm doch rein!",
            hu: "Gyere csak be!",
          },
        ],
      },
      {
        title: "mal",
        body:
          "A mal a felszólítást vagy kérést barátságosabbá, hétköznapibbá teszi. Gyakran nem azt jelenti, hogy egyszer, hanem inkább azt: csak, már, egy kicsit, légyszi jelleggel.",
        examples: [
          {
            de: "Warte mal!",
            hu: "Várj már!",
          },
          {
            de: "Guck mal!",
            hu: "Nézd csak!",
          },
          {
            de: "Erzähl mal!",
            hu: "Na mesélj!",
          },
          {
            de: "Kannst du mir mal kurz helfen?",
            hu: "Tudnál nekem gyorsan segíteni?",
          },
        ],
      },
      {
        title: "ja",
        body:
          "A ja azt jelzi, hogy a beszélő szerint az információ ismert, nyilvánvaló vagy várható. Csodálkozásnál is erősítheti az érzést: hiszen, tényleg, hát ez aztán.",
        examples: [
          {
            de: "Du weißt ja, wie es geht.",
            hu: "Hiszen tudod, hogy megy ez.",
          },
          {
            de: "Das ist ja nicht zu glauben!",
            hu: "Hiszen ez hihetetlen!",
          },
          {
            de: "Hab ich ja gesagt.",
            hu: "Nem megmondtam.",
          },
          {
            de: "Das war ja klar.",
            hu: "Ez várható volt.",
          },
        ],
      },
      {
        title: "denn",
        body:
          "A denn kérdésekben nagyon gyakori. Közvetlenebbé, természetesebbé vagy érdeklődőbbé teszi a kérdést. Ha a kérdés negatív érzelmű, akkor meglepetést, rosszallást vagy értetlenséget is kifejezhet.",
        examples: [
          {
            de: "Wie spät ist es denn?",
            hu: "Mennyi az idő?",
          },
          {
            de: "Was machst du denn?",
            hu: "Mit csinálsz?",
          },
          {
            de: "Warum hast du denn das gemacht?",
            hu: "Ezt meg mégis miért csináltad?",
          },
          {
            de: "Wo bist du denn?",
            hu: "Hát te hol vagy?",
          },
        ],
      },
      {
        title: "wohl",
        body:
          "A wohl bizonytalanságot vagy feltételezést fejez ki. A beszélő nem teljesen biztos abban, amit mond, inkább valószínűnek tartja. Magyarul gyakran: valószínűleg, talán, lehet, hogy.",
        examples: [
          {
            de: "Es stimmt wohl nicht.",
            hu: "Ez valószínűleg nem stimmel.",
          },
          {
            de: "Er wird wohl gewinnen.",
            hu: "Lehet, hogy nyerni fog.",
          },
          {
            de: "Sie ist wohl schon zu Hause.",
            hu: "Valószínűleg már otthon van.",
          },
        ],
      },
      {
        title: "bloß és nur",
        body:
          "A bloß és a nur felszólításban vagy felkiáltásban erős figyelmeztetést, sürgetést vagy félelmet fejezhet ki. Ilyenkor a mondat sokkal erősebb lesz, mint a Modalpartikel nélkül.",
        examples: [
          {
            de: "Hör bloß damit auf!",
            hu: "Hagyd már abba!",
          },
          {
            de: "Komm bloß nie wieder!",
            hu: "Soha ne gyere többé!",
          },
          {
            de: "Mach nur keinen Fehler!",
            hu: "Csak nehogy hibázz!",
          },
          {
            de: "Was soll ich bloß machen?",
            hu: "Most mégis mit csináljak?",
          },
        ],
      },
      {
        title: "aber",
        body:
          "Az aber Modalpartikelként meglepetést vagy erős benyomást fejez ki. Nem ellentétet jelent, mint a kötőszóként használt aber, hanem azt, hogy a beszélő valamire rácsodálkozik.",
        examples: [
          {
            de: "Du bist aber groß geworden!",
            hu: "Te aztán jól megnőttél!",
          },
          {
            de: "Das ist aber teuer!",
            hu: "Ez aztán drága!",
          },
          {
            de: "Hier ist es aber kalt.",
            hu: "Itt aztán hideg van.",
          },
        ],
      },
      {
        title: "Szórend és kombinációk",
        body:
          "A Modalpartikeln általában a ragozott ige után, a mondat középső részében állnak. Több Modalpartikel is állhat egymás mellett, de ez már nagyon beszélt nyelvi árnyalat. Gyakori kombinációk: doch mal, ja wohl, denn bloß, doch einfach.",
        examples: [
          {
            de: "Komm doch mal vorbei!",
            hu: "Ugorj már be egyszer!",
          },
          {
            de: "Das kann ja wohl nicht wahr sein!",
            hu: "Ez egyszerűen nem lehet igaz!",
          },
          {
            de: "Was hast du denn bloß gemacht?",
            hu: "Mit műveltél te mégis?",
          },
        ],
      },
    ],
    quickRules: [
      "A mondat Modalpartikel nélkül is teljes.",
      "Nem új információt ad, hanem hangulatot és hozzáállást.",
      "Főleg beszédben és informális írásban használjuk.",
      "Általában az ige után, gyakran a névmás után áll.",
      "halt / eben: beletörődés, ez van.",
      "doch: megerősítés, emlékeztetés, enyhébb felszólítás.",
      "mal: barátságosabb kérés vagy felszólítás.",
      "ja: ismert vagy nyilvánvaló dolog.",
      "denn: természetesebb kérdés vagy meglepett rosszallás.",
      "wohl: bizonytalanság, feltételezés.",
      "bloß / nur: erős figyelmeztetés.",
      "aber: meglepetés, erős benyomás.",
    ],
  },
  {
    id: "vonatkozo-nevmas",
    mode: "grammar-guide-vonatkozo-nevmas",
    title: "Vonatkozó névmás",
    subtitle: "Relativpronomen, prepozíciós szerkezetek, wer/was és derjenige",
    level: "B1/B2",
    icon: "🔗",
    practice: {
      available: false,
      label: "Vonatkozó névmás gyakorló hamarosan",
      type: "planned",
    },
    sections: [
      {
        title: "Mi a vonatkozó névmás?",
        body:
          "A vonatkozó névmás egy főnévről ad újabb információt. Magyarul gyakran aki, ami, amit, akinek, aminek alakokkal fordítjuk. A németben a vonatkozó névmást számban és nemben ahhoz a főnévhez igazítjuk, amelyre visszautal, az esetét pedig a mellékmondatban betöltött szerepe dönti el.",
        examples: [
          {
            de: "Sie hat einen Bruder, der in München wohnt.",
            hu: "Van egy fiútestvére, aki Münchenben lakik.",
          },
          {
            de: "Sie hat eine Katze, die den ganzen Tag schläft.",
            hu: "Van egy macskája, amely egész nap alszik.",
          },
          {
            de: "Sie hat drei Kinder, die jetzt bei der Oma Urlaub machen.",
            hu: "Van három gyereke, akik most a nagyinál nyaralnak.",
          },
          {
            de: "Dort kommt Adam, dem meine Schwester gefällt.",
            hu: "Ott jön Adam, akinek tetszik a lánytestvérem.",
          },
        ],
      },
      {
        title: "Szórend: vessző és mellékmondat",
        body:
          "A vonatkozó mellékmondat legtöbbször közvetlenül a főnév után áll, vesszővel elválasztva. A szórend a KATI-szórendhez hasonlít: először a vonatkozó névmás áll, utána az alany, ha van, majd a többi mondatrész, végül a ragozott ige.",
        formula: "Főnév, Relativpronomen + alany + ... + ragozott ige",
        examples: [
          {
            de: "Das ist der Mann, der neben uns wohnt.",
            hu: "Ő az a férfi, aki mellettünk lakik.",
          },
          {
            de: "Ich kenne die Frau, die du gestern gesehen hast.",
            hu: "Ismerem azt a nőt, akit tegnap láttál.",
          },
          {
            de: "Das ist das Buch, das auf dem Tisch liegt.",
            hu: "Ez az a könyv, amely az asztalon fekszik.",
          },
        ],
      },
      {
        title: "Ragozás: der, die, das, die",
        body:
          "A vonatkozó névmás ragozása nagyon hasonlít a határozott névelő ragozásához. Két fontos eltérés van: részes eset többes számban denen áll, birtokos esetben pedig dessen vagy deren.",
        table: [
          {
            tense: "Nominativ",
            form: "der / die / das / die",
            example: "Der Mann, der dort steht, ist mein Lehrer.",
          },
          {
            tense: "Akkusativ",
            form: "den / die / das / die",
            example: "Der Mann, den ich kenne, ist Arzt.",
          },
          {
            tense: "Dativ",
            form: "dem / der / dem / denen",
            example: "Die Kinder, denen ich helfe, lernen Deutsch.",
          },
          {
            tense: "Genitiv",
            form: "dessen / deren / dessen / deren",
            example: "Der Mann, dessen Auto kaputt ist, wartet.",
          },
        ],
      },
      {
        title: "Hogyan választjuk ki az esetet?",
        body:
          "A névmás neme és száma attól a főnévtől függ, amelyre visszautal. Az esetet viszont nem ez a főnév, hanem a vonatkozó mellékmondatban betöltött szerep dönti el: alany, tárgy, részes esetű kiegészítő vagy birtokos szerkezet.",
        examples: [
          {
            de: "Das ist der Mann, der mir hilft.",
            hu: "Ő az a férfi, aki segít nekem. A der alany, ezért Nominativ.",
          },
          {
            de: "Das ist der Mann, den ich sehe.",
            hu: "Ő az a férfi, akit látok. A den tárgy, ezért Akkusativ.",
          },
          {
            de: "Das ist der Mann, dem ich helfe.",
            hu: "Ő az a férfi, akinek segítek. A dem Dativ.",
          },
        ],
      },
      {
        title: "Dativ többes szám: denen",
        body:
          "Többes szám részes esetben nem den, hanem denen áll. Ez az egyik legfontosabb eltérés a határozott névelőhöz képest, ezért külön érdemes megjegyezni.",
        examples: [
          {
            de: "Dort spielen die Kinder, denen ich immer Schokolade gebe.",
            hu: "Ott játszanak a gyerekek, akiknek mindig csokit adok.",
          },
          {
            de: "Das sind die Schüler, denen der Lehrer geholfen hat.",
            hu: "Ők azok a diákok, akiknek a tanár segített.",
          },
          {
            de: "Ich kenne die Leute, denen dieses Haus gehört.",
            hu: "Ismerem az embereket, akiké ez a ház.",
          },
        ],
      },
      {
        title: "Birtokos eset: dessen és deren",
        body:
          "A vonatkozó névmás birtokos esete azt fejezi ki: akinek/amelynek a valamije. Hímnemnél és semleges nemnél dessen, nőnemnél és többes számban deren áll. A birtok utánuk közvetlenül következik, névelő nélkül.",
        formula: "dessen/deren + birtok",
        examples: [
          {
            de: "Er ist mein Freund, dessen Frau schwanger ist.",
            hu: "Ő a barátom, akinek a felesége várandós.",
          },
          {
            de: "Karl hat eine Wohnung, deren Miete sehr hoch ist.",
            hu: "Karlnak van egy lakása, amelynek a bérleti díja nagyon magas.",
          },
          {
            de: "Sie hat ein neues Auto gekauft, dessen Farbe mir gar nicht gefällt.",
            hu: "Vett egy új autót, amelynek a színe nekem egyáltalán nem tetszik.",
          },
          {
            de: "Ich habe die Bücher noch nicht gelesen, deren Autor jetzt gestorben ist.",
            hu: "Még nem olvastam a könyveket, amelyeknek a szerzője most halt meg.",
          },
        ],
      },
      {
        title: "Vonatkozó névmás prepozícióval",
        body:
          "A vonatkozó névmás előtt elöljárószó is állhat. Ilyenkor a névmást az elöljárószó által megkövetelt esetbe tesszük. Így fejezhetjük ki például: akivel, amiről, amihez, akire, amelyben.",
        formula: "Prepozíció + Relativpronomen + ... + ige",
        examples: [
          {
            de: "Ich rufe meinen Freund an, mit dem ich mich heute Nachmittag treffen will.",
            hu: "Felhívom a barátomat, akivel ma délután találkozni akarok.",
          },
          {
            de: "Da kommt meine Schwester, auf die wir seit 30 Minuten warten.",
            hu: "Ott jön a lánytestvérem, akire harminc perce várunk.",
          },
          {
            de: "Er hat sein Auto verkauft, in dem er zwei Wochen lang gewohnt hat.",
            hu: "Eladta az autóját, amelyben két hétig lakott.",
          },
          {
            de: "Siehst du die Kinder, bei denen wir gestern gespielt haben?",
            hu: "Látod a gyerekeket, akiknél tegnap játszottunk?",
          },
        ],
      },
      {
        title: "Kivétel: prepozíció + birtokos vonatkozó névmás",
        body:
          "Ha a vonatkozó névmás birtokos esetű, tehát dessen vagy deren, akkor ezt nem egyeztetjük az elöljárószóval. A prepozíció ilyenkor a birtokhoz kapcsolódik, a dessen/deren alak változatlan marad.",
        examples: [
          {
            de: "Kennst du schon meinen Chef, mit dessen Frau du gerade gesprochen hast?",
            hu: "Ismered már a főnökömet, akinek a feleségével épp beszéltél?",
          },
          {
            de: "Hier ist die Wissenschaftlerin, über deren Erfindung alle sprechen.",
            hu: "Itt van a tudósnő, akinek a találmányáról mindenki beszél.",
          },
          {
            de: "Das ist der Autor, von dessen Büchern ich dir erzählt habe.",
            hu: "Ő az az író, akinek a könyveiről meséltem neked.",
          },
        ],
      },
      {
        title: "Közbeékelt vonatkozó mellékmondat",
        body:
          "A vonatkozó mellékmondat gyakran rögtön a főnév után áll, és megszakítja a főmondatot. Ilyenkor mindkét oldalán vessző áll. A főmondat a mellékmondat után folytatódik.",
        examples: [
          {
            de: "Die Dame, die hinter dem Tisch steht, ist meine Frau.",
            hu: "A hölgy, aki az asztal mögött áll, a feleségem.",
          },
          {
            de: "Ich habe den Tisch, den du hier siehst, nur für 10 Euro gekauft.",
            hu: "Az asztalt, amelyet itt látsz, csak 10 euróért vettem.",
          },
          {
            de: "Das Kind, von dem ich dir erzählt habe, hat den Wettbewerb gewonnen.",
            hu: "A gyerek, akiről meséltem neked, megnyerte a versenyt.",
          },
        ],
      },
      {
        title: "derer: előreutaló többes szám birtokos alak",
        body:
          "Többes szám birtokos esetben előfordulhat, hogy a névmás nem visszautal, hanem előreutal: valamije azoknak, akik. Ilyenkor személyekre utalunk, és a deren helyett derer áll. Utána vessző és újabb névmás következik.",
        examples: [
          {
            de: "Hier sitzen die Eltern derer, die an dem Ausflug teilnehmen.",
            hu: "Itt ülnek azoknak a szülei, akik részt vesznek a kiránduláson.",
          },
          {
            de: "Wir gedenken derer, die uns geholfen haben.",
            hu: "Megemlékezünk azokról, akik segítettek nekünk.",
          },
        ],
      },
      {
        title: "wer, wen, wem, wessen és was",
        body:
          "Ha nem egy konkrét főnévre utalunk vissza, hanem meghatározatlan személyre vagy dologra, akkor használhatjuk a wer ragozott alakjait és a was névmást. A was akkor is gyakori, ha az egész előző mondatra vagy állításra utalunk vissza.",
        examples: [
          {
            de: "Wer zu spät kommt, bekommt keine Schokolade.",
            hu: "Aki túl későn jön, nem kap csokit.",
          },
          {
            de: "Wen ich einmal gesehen habe, vergesse ich nie mehr.",
            hu: "Akit egyszer láttam, azt soha többé nem felejtem el.",
          },
          {
            de: "Siehst du, was ich sehe?",
            hu: "Látod, amit én látok?",
          },
          {
            de: "Er wusste schon alles, was ich ihm erzählen wollte.",
            hu: "Már mindent tudott, amit el akartam mesélni neki.",
          },
        ],
      },
      {
        title: "derjenige, der: az, aki",
        body:
          "A wer, wen, wem, wessen jelentését sokszor kifejezhetjük a derjenige szerkezettel is. Az első rész a határozott névelő szerint ragozódik, a -jenige rész pedig gyenge melléknévragozást kap.",
        examples: [
          {
            de: "Ich bin derjenige, der klopft.",
            hu: "Én vagyok az, aki kopog.",
          },
          {
            de: "Ich versuche denjenigen zu finden, dem diese Gitarre gehört.",
            hu: "Megpróbálom megtalálni azt, akié ez a gitár.",
          },
          {
            de: "Sie sind diejenigen, die gehen wollen.",
            hu: "Ők azok, akik menni akarnak.",
          },
        ],
      },
      {
        title: "derjenige ragozása",
        body:
          "A derjenige összetett névmásnál az első rész der/den/dem/des mintára változik, a második rész pedig -jenige, -jenigen, -jenigen stb. alakot kap. Többes számban gyakori alak: diejenigen.",
        table: [
          {
            tense: "Nominativ",
            form: "derjenige / diejenige / dasjenige / diejenigen",
            example: "Derjenige, der zuerst kommt, gewinnt.",
          },
          {
            tense: "Akkusativ",
            form: "denjenigen / diejenige / dasjenige / diejenigen",
            example: "Ich suche denjenigen, der angerufen hat.",
          },
          {
            tense: "Dativ",
            form: "demjenigen / derjenigen / demjenigen / denjenigen",
            example: "Ich helfe demjenigen, der fragt.",
          },
          {
            tense: "Genitiv",
            form: "desjenigen / derjenigen / desjenigen / derjenigen",
            example: "Die Meinung desjenigen, der fehlt, kennen wir nicht.",
          },
        ],
      },
    ],
    quickRules: [
      "A vonatkozó névmás egy főnévről ad plusz információt.",
      "Neme és száma attól a főnévtől függ, amelyre visszautal.",
      "Esetét a mellékmondatban betöltött szerepe dönti el.",
      "A vonatkozó mellékmondat vesszővel kezdődik.",
      "A ragozott ige a vonatkozó mellékmondat végére kerül.",
      "Dativ többes szám: denen.",
      "Genitiv: dessen hímnem/semleges nem, deren nőnem/többes szám.",
      "Prepozíció után az elöljárószó esete dönt: mit dem, auf die, in dem.",
      "dessen/deren prepozícióval is változatlan marad.",
      "Közbeékelt mondatnál két vessző kell.",
      "wer/was meghatározatlan személyre, dologra vagy egész állításra utal.",
      "derjenige, der jelentése: az, aki.",
    ],
  },
  {
    id: "plusquamperfekt-nachdem",
    mode: "grammar-guide-plusquamperfekt",
    title: "Plusquamperfekt és nachdem",
    subtitle: "Előidejűség a múltban, hatte/war + Partizip II",
    level: "B1/B2",
    icon: "⏳",
    practice: {
      available: true,
      mode: "plusquamperfekt",
      label: "Plusquamperfekt gyakorlása",
      type: "mixed-writing-choice",
    },
    sections: [
      {
        title: "Mire való a Plusquamperfekt?",
        body:
          "A Plusquamperfekt a német harmadik múlt ideje. Akkor használjuk, ha két dolog történt a múltban, és meg akarjuk mutatni, melyik történt korábban. Ez az előidejűség a múltban: az egyik esemény már lezárult, amikor a másik múltbeli esemény megtörtént.",
        examples: [
          {
            de: "Zuerst hatte ich mein Frühstück gegessen, dann ging ich in die Schule.",
            hu: "Először megettem a reggelimet, aztán iskolába mentem.",
          },
          {
            de: "Ich war in den Supermarkt gegangen, dann räumte ich auf.",
            hu: "Elmentem a szupermarketbe, aztán kitakarítottam.",
          },
          {
            de: "Vor zwei Jahren hatte ich dieses Haus gebaut. Gestern verkaufte ich es.",
            hu: "Két éve építettem ezt a házat. Tegnap eladtam.",
          },
        ],
      },
      {
        title: "Képzése",
        body:
          "A Plusquamperfekt a haben vagy sein Präteritum alakjából és a főige Partizip II alakjából áll. Magyarul sokszor egyszerű múltként fordítjuk, de németül az a szerepe, hogy jelezze: ez történt előbb.",
        formula: "hatte / war + Partizip II",
        examples: [
          {
            de: "Ich hatte das Mittagessen gekocht.",
            hu: "Megfőztem az ebédet.",
          },
          {
            de: "Er war um 5 Uhr angekommen.",
            hu: "Öt órakor megérkezett.",
          },
          {
            de: "Wir hatten die Aufgabe schon gemacht.",
            hu: "Már megcsináltuk a feladatot.",
          },
        ],
      },
      {
        title: "hatte és war ragozása",
        body:
          "A segédige mutatja a személyt és a számot. A főige Partizip II alakban marad, és nem változik. Ugyanúgy kell eldönteni a haben vagy sein használatát, mint Perfektben.",
        table: [
          {
            tense: "ich",
            form: "hatte / war",
            example: "ich hatte gelernt, ich war gegangen",
          },
          {
            tense: "du",
            form: "hattest / warst",
            example: "du hattest gelernt, du warst gegangen",
          },
          {
            tense: "er, sie, es",
            form: "hatte / war",
            example: "er hatte gelernt, sie war gegangen",
          },
          {
            tense: "wir",
            form: "hatten / waren",
            example: "wir hatten gelernt, wir waren gegangen",
          },
          {
            tense: "ihr",
            form: "hattet / wart",
            example: "ihr hattet gelernt, ihr wart gegangen",
          },
          {
            tense: "sie, Sie",
            form: "hatten / waren",
            example: "sie hatten gelernt, Sie waren gegangen",
          },
        ],
      },
      {
        title: "haben vagy sein?",
        body:
          "A legtöbb ige haben segédigét kap. Sein kell főleg mozgást vagy állapotváltozást kifejező igéknél, illetve néhány gyakori igénél, például sein, bleiben, werden. Ez ugyanaz a logika, mint Perfektben.",
        table: [
          {
            tense: "haben",
            form: "tárgyas igék és a legtöbb ige",
            example: "Ich hatte den Text gelesen.",
          },
          {
            tense: "sein",
            form: "mozgás, állapotváltozás",
            example: "Sie war nach Hause gegangen.",
          },
          {
            tense: "sein",
            form: "sein, bleiben, werden",
            example: "Er war krank gewesen.",
          },
        ],
      },
      {
        title: "nachdem múlt időben",
        body:
          "A Plusquamperfekt legtöbbször nachdem mondatokban jelenik meg. Ha mindkét cselekvés a múltban történt, akkor a korábbi esemény Plusquamperfektben áll, a későbbi pedig általában Präteritumban vagy elbeszélő múltban.",
        formula: "Nachdem + Plusquamperfekt, Präteritum",
        examples: [
          {
            de: "Nachdem die Gäste angekommen waren, aßen wir das Abendessen zusammen.",
            hu: "Miután a vendégek megérkeztek, együtt megettük a vacsorát.",
          },
          {
            de: "Nachdem er sich schwer verletzt hatte, konnte er nicht mehr tanzen.",
            hu: "Miután súlyosan megsérült, már nem tudott táncolni.",
          },
          {
            de: "Sobald er aufgestanden war, fing er an zu lernen.",
            hu: "Mihelyt felkelt, elkezdett tanulni.",
          },
        ],
      },
      {
        title: "Szórend nachdem után",
        body:
          "A nachdem mellékmondatot vezet be, ezért a ragozott ige a mellékmondat végére kerül. Plusquamperfektben ez a ragozott segédige: hatte vagy war. A Partizip II közvetlenül előtte áll.",
        formula: "Nachdem + Subjekt + ... + Partizip II + hatte/war, ...",
        examples: [
          {
            de: "Nachdem ich die Küche aufgeräumt hatte, ging ich schlafen.",
            hu: "Miután rendet raktam a konyhában, elmentem aludni.",
          },
          {
            de: "Nachdem wir angekommen waren, riefen wir unsere Eltern an.",
            hu: "Miután megérkeztünk, felhívtuk a szüleinket.",
          },
          {
            de: "Nachdem Anna den Film gesehen hatte, schrieb sie eine Kritik.",
            hu: "Miután Anna megnézte a filmet, kritikát írt.",
          },
        ],
      },
      {
        title: "Ha a második cselekvés jelenben van",
        body:
          "Ha az egyik cselekvés már megtörtént, a másik viszont jelen idejű következmény vagy jelenbeli cselekvés, akkor nem Plusquamperfektet használunk. Ilyenkor a nachdem-os mellékmondat Perfektben áll, a főmondat pedig Präsensben.",
        formula: "Nachdem + Perfekt, Präsens",
        examples: [
          {
            de: "Nachdem ich aufgeräumt habe, trinke ich eine Tasse Tee.",
            hu: "Miután kitakarítottam, iszom egy csésze teát.",
          },
          {
            de: "Nachdem wir eingezogen sind, machen wir eine große Party.",
            hu: "Miután beköltöztünk, nagy partit rendezünk.",
          },
          {
            de: "Nachdem sie die Prüfung bestanden hat, ist sie sehr erleichtert.",
            hu: "Miután sikerült a vizsgája, nagyon megkönnyebbült.",
          },
        ],
      },
      {
        title: "Múlt és múlt, múlt és jelen",
        body:
          "A nachdem szerkezetnél mindig azt kell először eldönteni, hogy a főmondat milyen idősíkban van. Ha a főmondat is múlt, a nachdem-os előzmény Plusquamperfekt. Ha a főmondat jelen, a nachdem-os előzmény Perfekt.",
        table: [
          {
            tense: "múlt + múlt",
            form: "Plusquamperfekt + Präteritum",
            example: "Nachdem ich gegessen hatte, ging ich los.",
          },
          {
            tense: "múlt + jelen",
            form: "Perfekt + Präsens",
            example: "Nachdem ich gegessen habe, gehe ich los.",
          },
        ],
      },
      {
        title: "Tipikus hibák",
        body:
          "A leggyakoribb hiba, hogy a tanuló mindkét múltbeli eseményt ugyanabba az időbe teszi, így nem derül ki világosan, melyik történt előbb. A másik gyakori hiba a nachdem szórendje: a segédige nem a második helyen áll, hanem a mellékmondat végén.",
        examples: [
          {
            de: "Falsch: Nachdem ich hatte gegessen, ging ich los. → Richtig: Nachdem ich gegessen hatte, ging ich los.",
            hu: "nachdem után a ragozott ige a végére kerül.",
          },
          {
            de: "Falsch: Nachdem er angekommen ist, gingen wir los. → Richtig: Nachdem er angekommen war, gingen wir los.",
            hu: "Ha a főmondat múlt, a korábbi esemény Plusquamperfekt.",
          },
          {
            de: "Falsch: Ich war das Essen gekocht. → Richtig: Ich hatte das Essen gekocht.",
            hu: "Kochen haben-os ige, ezért hatte kell.",
          },
        ],
      },
    ],
    quickRules: [
      "A Plusquamperfekt előidejűséget fejez ki a múltban.",
      "Képzése: hatte vagy war + Partizip II.",
      "A haben/sein választása ugyanúgy működik, mint Perfektben.",
      "A legtöbb ige haben segédigét kap.",
      "Mozgásnál és állapotváltozásnál gyakori a sein.",
      "nachdem után mellékmondati szórend van.",
      "Plusquamperfektben a hatte/war a mellékmondat végére kerül.",
      "Múlt + múlt: Plusquamperfekt + Präteritum.",
      "Múlt + jelen: Perfekt + Präsens.",
      "Magyarul sokszor egyszerű múltként fordítjuk, de németül az időviszonyt jelöli.",
    ],
  },
];
