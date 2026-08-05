/**
 * Editorial copy for the site, lifted from the current WordPress pages.
 *
 * Kept in one module so the client can hand over corrections as plain text
 * without touching markup.
 */

export const site = {
  title: "Ottenser Adventskalender",
  intro: [
    "Der Ottenser Adventskalender ist wieder da – prall gefüllt mit tollen Preisen von Ottenser Geschäften und aus ganz Hamburg für Ottensen und alle Anderen",
    "Der Adventskalender „Weihnachten unter´m Circuszelt“ ist eine gemeinnützige Aktion der aTriBühne e.V. und KIDS Hamburg e.V. (Kompetenz- und Infozentrum Down-Syndrom).",
    "Die Erlöse der Aktion fließen vollständig in besondere Projekte der Circusschule, die wichtige Arbeit von KIDS Hamburg e.V., sowie an die Fördervereine der teilnehmenden Schulen.",
  ],
} as const;

export type TileColor = "cyan" | "red" | "orange";

export interface InfoTile {
  heading: string;
  color: TileColor;
  /** Paragraphs of running text. */
  body?: string[];
  /** Rendered as a list beneath the body. */
  items?: string[];
}

/**
 * The six info tiles. Order and colour follow the redesign mockup: the grid
 * alternates cyan / red / orange across three columns.
 */
export const infoTiles: InfoTile[] = [
  {
    heading: "Wo gibt es die Kalender?",
    color: "cyan",
    body: ["Es gibt sie an folgenden Standorten – solange der Vorrat reicht:"],
    items: [
      "Büro der Circusschule TriBühne (Stresemannstr. 374b)",
      "Buchhandlung Christiansen",
      "Thalia Buchhandlung im Mercado",
      "’s Fachl Ottensen",
      "Kaiser-Apotheke",
      "Victoria Apotheke",
      "Am 08.11.25 im Mercado",
    ],
  },
  {
    heading: "Wie funktioniert der Kalender?",
    color: "red",
    body: [
      "Jeder der 2.000 Kalender hat eine eigene Losnummer, die sich links unten im weißen Feld auf der Vorderseite des Kalenders befindet.",
      "Auf der Innenseite der 24 Kalendertürchen verbergen sich die Preise, die an die Tagesgewinner*innen verlost werden. Die Ziehung der Losnummern erfolgt unter notarieller Aufsicht und unter Ausschluss des Rechtsweges.",
      "Insgesamt werden Preise im Wert von mehr als 10.000 Euro ausgespielt.",
    ],
  },
  {
    heading: "Wie erfahre ich, ob ich gewonnen habe?",
    color: "orange",
    body: [
      "Die Gewinnnummern werden täglich ab dem 01.12.25 im Internet unter www.ottenser-adventskalender.de bekannt gegeben.",
      "Die Gewinnnummern können auch im Büro der Circusschule (Stresemannstr. 374b) erfragt werden.",
      "Öffnungszeiten: Di. und Do. 10:00 – 12:00 Uhr, Di. bis Fr. 15:30 – 18:30 Uhr. Telefon: 040 85157909",
      "Hinweis: Vom 22.12.25 bis zum 04.01.26 ist das Circusbüro geschlossen.",
    ],
  },
  {
    heading: "Wichtige Hinweise",
    color: "red",
    body: [
      "Achtung: Gewinner*innen können ihre Preise nur bis zum 15.02.26 an der im Internet genannten Adresse (Geschäft oder Circusbüro) abholen.",
    ],
    items: [
      "Der Kalender muss zum Entwerten mitgebracht werden",
      "Jeder Kalender kann nur einmal gewinnen",
      "Nicht abgeholte Gewinne verfallen oder werden dem Ausspielzweck zugeführt",
      "Eine Barauszahlung ist nicht möglich",
    ],
  },
  {
    heading: "Wen unterstütze ich mit dem Kauf eines Kalenders?",
    color: "orange",
    body: ["Der Gesamterlös geht an gemeinnützige Projekte:"],
    items: [
      "Circusschule TriBühne",
      "KIDS Hamburg e.V. – Kompetenz- und Infozentrum Down-Syndrom",
      "Fördervereine der Schulen, die am Malwettbewerb teilgenommen haben",
    ],
  },
  {
    heading: "Wir bedanken uns besonders bei:",
    color: "cyan",
    body: [
      "Wir danken ALLEN Unterstützer*innen für die tollen Gewinne! Außerdem geht unser Dank an die jungen Künstler*innen der Türchenbilder und natürlich an alle Käufer*innen des Kalenders!",
    ],
  },
];

/** German month-day heading, e.g. "1. Dezember". */
export function formatDayHeading(date: string): string {
  const day = Number(date.slice(8, 10));
  return `${day}. Dezember`;
}
