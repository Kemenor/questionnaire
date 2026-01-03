export const DEFAULT_OPTIONS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree'
];

export type Question = {
  id: string;
  prompt: string;
  options: string[];
};

export const QUESTIONS: Question[] = Array.from({ length: 15 }, (_, index) => ({
  id: `q${index + 1}`,
  prompt: `Question ${index + 1}`,
  options: DEFAULT_OPTIONS
}));

export const OPTION_SCORES: Record<string, number> = Object.fromEntries(
  DEFAULT_OPTIONS.map((option, index) => [option, index + 1])
);

export const optionToScore = (option: string): number | null => OPTION_SCORES[option] ?? null;
