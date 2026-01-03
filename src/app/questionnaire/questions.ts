export const DEFAULT_OPTIONS = [
  'Stimme überhaupt nicht zu',
  'Stimme eher nicht zu',
  'Teils/teils',
  'Stimme eher zu',
  'Stimme voll und ganz zu'
];

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  save?: boolean;
};

export const PHASE1_ONLY_QUESTIONS: Question[] = [
  { id: 'p1_1', prompt: 'Ich bin eher unordentlich.', options: DEFAULT_OPTIONS, save: true },
  {
    id: 'p1_2',
    prompt: 'Ich gehe aus mir heraus, bin gesellig.',
    options: DEFAULT_OPTIONS,
    save: false
  },
  { id: 'p1_3', prompt: 'Ich bin bequem, neige zu Faulheit.', options: DEFAULT_OPTIONS, save: true },
  { id: 'p1_4', prompt: 'Ich bin stetig, beständig.', options: DEFAULT_OPTIONS, save: true },
  {
    id: 'p1_5',
    prompt: 'Ich bin einfühlsam, warmherzig.',
    options: DEFAULT_OPTIONS,
    save: false
  },
  {
    id: 'p1_6',
    prompt: 'Ich bin systematisch, halte meine Sachen in Ordnung.',
    options: DEFAULT_OPTIONS,
    save: true
  },
  {
    id: 'p1_7',
    prompt: 'Ich neige dazu, Aufgaben vor mir herzuschieben.',
    options: DEFAULT_OPTIONS,
    save: true
  },
  {
    id: 'p1_8',
    prompt: 'Ich bleibe auch in stressigen Situationen gelassen.',
    options: DEFAULT_OPTIONS,
    save: false
  },
  { id: 'p1_9', prompt: 'Ich bin manchmal ziemlich nachlässig.', options: DEFAULT_OPTIONS, save: true },
  {
    id: 'p1_10',
    prompt: 'Ich bin nicht sonderlich kunstinteressiert.',
    options: DEFAULT_OPTIONS,
    save: false
  },
  { id: 'p1_11', prompt: 'Ich mag es sauber und aufgeräumt.', options: DEFAULT_OPTIONS, save: true },
  { id: 'p1_12', prompt: 'Ich bin effizient, erledige Dinge schnell.', options: DEFAULT_OPTIONS, save: true },
  {
    id: 'p1_13',
    prompt: 'Mir fällt es schwer, andere zu beeinflussen.',
    options: DEFAULT_OPTIONS,
    save: false
  },
  {
    id: 'p1_14',
    prompt: 'Ich bin verlässlich, auf mich kann man zählen.',
    options: DEFAULT_OPTIONS,
    save: true
  },
  {
    id: 'p1_15',
    prompt: 'Ich bin eher der chaotische Typ, mache selten sauber.',
    options: DEFAULT_OPTIONS,
    save: true
  },
  {
    id: 'p1_16',
    prompt: 'Ich bin manchmal unhöflich und schroff.',
    options: DEFAULT_OPTIONS,
    save: false
  },
  {
    id: 'p1_17',
    prompt: 'Ich bleibe an einer Aufgabe dran, bis sie erledigt ist.',
    options: DEFAULT_OPTIONS,
    save: true
  },
  {
    id: 'p1_18',
    prompt: 'Manchmal verhalte ich mich verantwortungslos, leichtsinnig.',
    options: DEFAULT_OPTIONS,
    save: true
  },
  {
    id: 'p1_19',
    prompt: 'Ich fühle mich oft bedrückt, freudlos.',
    options: DEFAULT_OPTIONS,
    save: false
  },
  {
    id: 'p1_20',
    prompt:
      'Es macht mir Spaß, gründlich über komplexe Dinge nachzudenken und sie zu verstehen.',
    options: DEFAULT_OPTIONS,
    save: false
  }
];

export const REPEAT_QUESTIONS: Question[] = [
  {
    id: 'ev_1',
    prompt: 'Ich halte E-Autos für eine umweltfreundlichere Alternative zu Verbrennerautos.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_2',
    prompt: 'Ich kann mir vorstellen, im Alltag ein E-Auto zu nutzen.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_3',
    prompt: 'Ich halte die Technologie von E-Autos für zuverlässig.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_4',
    prompt: 'Ich denke, dass E-Autos zum Klimaschutz beitragen.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_5',
    prompt: 'Ich halte die aktuelle Ladeinfrastruktur für ausreichend.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_6',
    prompt: 'Ich kann mir vorstellen, in den nächsten Jahren ein E-Auto zu kaufen.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_7',
    prompt: 'Ich empfinde ein E-Auto als eine sinnvolle Investition.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_8',
    prompt: 'Ich würde beim Autokauf ein E-Auto in Betracht ziehen.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_9',
    prompt: 'Ich bin der Ansicht, dass die Vorteile eines E-Autos die Nachteile überwiegen.',
    options: DEFAULT_OPTIONS
  },
  {
    id: 'ev_10',
    prompt: 'Ich sehe mich persönlich als potenzielle kaufende Person eines E-Autos.',
    options: DEFAULT_OPTIONS
  }
];

export const PHASE1_QUESTIONS = [...PHASE1_ONLY_QUESTIONS, ...REPEAT_QUESTIONS];
export const PHASE2_QUESTIONS = [...REPEAT_QUESTIONS];

export const OPTION_SCORES: Record<string, number> = Object.fromEntries(
  DEFAULT_OPTIONS.map((option, index) => [option, index + 1])
);

export const optionToScore = (option: string): number | null => OPTION_SCORES[option] ?? null;
