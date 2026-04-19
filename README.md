# Westcoast Education 

Westcoast Education erbjuder olika IT-kurser i Norden. Vi är en ledande utbildningsplattform för framväxande teknologier inom Web3 och blockchain, artificiell intelligens, cybersäkerhet samt DevOps och cloud. Vi erbjuder utbildning på campus – i klassrum, på distans och on-demand med flexibla studieplaner.

Vårt mål är att tillhandahålla IT-utbildning som är lättillgänglig för alla, från lärarledda kurser till förinspelade alternativ med olika prenumerationsmöjligheter att välja mellan.

### Utbildning gjort enkelt

Vi gör utbildning inte bara lättillgänglig utan också dynamisk och användarvänlig, vilket gör det enklare att söka bland kurser, läsa kursmaterial och följa sina framsteg. Plattformen fungerar även som ett gemensamt gränssnitt där administratörer kan hantera kursmaterial, schemaläggning och lärare.

Genom vår dynamiska och användarvänliga webbapplikation kan studenter enkelt söka bland kurser, boka utbildningar och följa sina framsteg. Administratörer kan hantera kurser, lärare och bokningar – allt på ett och samma ställe.

### Arkitektur och principer

Lager skapas för att identifiera krav och planera arkitekturen på ett strukturerat sätt, som sedan implementeras och testas kontinuerligt genom en steg-för-steg-process.

### Kommunikation och återanvändning

All kommunikation hanteras via ett REST API, i enlighet med applikationens DRY-princip och en generisk ApiClient. Komponenter som `courseCardHtml`, `renderNavbar` och `renderFooter` återanvänds, tillsammans med ett centraliserat servicelager för alla dataoperationer.

### KISS-principen

KISS-principen används för att tydligt avgränsa ansvarsområden, såsom datahantering, hjälplogik och rendering av sidor.

### Implementerad med

* **HTML5**
* **CSS3**
* **Vanilla JavaScript (ES6 Modules)**
* **TypeScript**
* **JSON Server**

### Filstruktur

```
westcoast-education/
│
├── src/
│   ├── components/
│   │   ├── courseCard.js
│   │   ├── footer.js
│   │   └── navbar.js
│   │
│   ├── config/
│   │   └── env.js
│   │
│   ├── css/
│   │   ├── base.css
│   │   ├── footer.css
│   │   └── navbar.css
│   │
│   ├── data/
│   │   ├── apiClient.js
│   │   └── db.json
│   │
│   ├── models/
│   │   └── types.ts
│   │
│   ├── pages/
│   │   ├── admin-dashboard/
│   │   ├── admin-login/
│   │   ├── contact/
│   │   ├── course-details/
│   │   ├── courses/
│   │   ├── home/
│   │   ├── ondemand/
│   │   ├── student-dashboard/
│   │   └── student-login/
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   ├── courseService.js
│   │   ├── messageService.js
│   │   ├── notificationService.js
│   │   ├── studentService.js
│   │   └── teacherService.js
│   │
│   ├── ts/
│   │   ├── dist/
│   │   ├── recommendationEngine.ts
│   │   └── recommendationEngine.test.ts
│   │
│   ├── utils/
│   │   ├── dom.js
│   │   ├── formatters.js
│   │   ├── guards.js
│   │   ├── storage.js
│   │   └── validators.js
│   │
│   └── index.html
│
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
└── vitest.config.js
```

### Layout och funktioner

Webbplatsen är responsiv, vilket gör det möjligt för användare att enkelt navigera mellan kurser, on-demand-sidan och dashboards. Alla kurser hämtas dynamiskt via REST API och presenteras i form av kort. Användaren kan hämta mer information om en kurs genom att klicka på "Läs mer"-knappen.

* **_Kurssidan_** visar alla kurser grupperade efter område. Om till exempel Web3 väljs visas alla kurser relaterade till blockkedjeutveckling.

* **_Kursdetaljer_** visar all relevant information om kursen, till exempel genomsnittligt betyg, lärarens namn och en förhandsvisning av kursinnehållet.

* **_Bokning_** gör det möjligt för studenter att boka kurser via ett formulär som innehåller namn, faktureringsadress, mobilnummer och e-postadress.

* **_On-demand-sidan_** visar alla förinspelade kurser som kan köpas enskilt eller via en månatlig prenumeration för 299 kr/mån.

* **_Studentdashboard_** ger studenten en samlad bild av bokningar, kursframsteg och personliga rekommendationer. Studenten kan även skicka meddelanden till administratören och ställa frågor direkt till lärare.

* **_Admindashboard_** möjliggör effektiv hantering av Westcoast Educations kursutbud. Administratören kan matcha kurser med lärare, lägga till eller ta bort kurser samt administrera studenter och lärare. Dessutom kan administratören skicka meddelanden till både lärare och studenter.

### Rekommendationssystemet och TypeScript

TypeScript används för att bygga ett rekommendationssystem som rekommenderar kurser till studenter. Systemet är utvecklat enligt testdriven utveckling (TDD) och beräknar en relevansscore för varje kurs baserat på:

* Studentens intressen (+40 poäng)
* Tidigare genomförda kursområden (+30 poäng)
* Kursbetyg (upp till +30 poäng)
* Tillgänglighet i flera format (+5 poäng)

### Testning

Rekommendationssystemet har implementerats med hjälp av TypeScript och testats med Vitest enligt TDD-principen. Testfilen `recommendationEngine.test.ts` testar följande funktioner:

* `calculateAverageRating` — för att säkerställa att betyg beräknas korrekt.
* `isAlreadyEnrolled` — för att säkerställa att systemet känner igen om en student redan är registrerad på en kurs.
* `filterByArea` — för att verifiera att kurser kan filtreras korrekt per område, till exempel web3, ai, cybersäkerhet och devops.
* `calculateRelevanceScore` — för att säkerställa att poängsystemet fungerar korrekt så att kurser matchas utifrån studentens intressen.
* `recommendCourses` — för att verifiera att hela rekommendationsflödet fungerar från början till slut.

### Kör applikationen

För att kunna köra applikationen behöver två separata processer köras samtidigt.

**Terminal 1 — Starta REST API (port 3000):**

`json-server` hanterar applikationens data och exponerar `db.json` som ett fullständigt REST API. Information som bokningar och kurser läses från och skrivs till `db.json`.

```bash
npm run server
```

**Terminal 2 — Starta webbapplikationen (port 8080):**

`live-server` serverar projektets frontend och öppnar applikationen automatiskt i webbläsaren.

```bash
npm run dev
```

### Logga in

* Student 

E-post: johan@test.se; lösenord: test123

* Admin

E-post: admin@westcoast.edu; lösenord: admin123
