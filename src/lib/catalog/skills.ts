export const SKILL_KEYS = [
  "awareness",
  "technique",
  "variability",
  "interaction",
  "musicality",
] as const;

export type SkillKey = (typeof SKILL_KEYS)[number];

const SKILL_KEY_SET = new Set<string>(SKILL_KEYS);

export function isSkillKey(value: string): value is SkillKey {
  return SKILL_KEY_SET.has(value);
}

export function filterSkillKeys(values: string[] | null | undefined): SkillKey[] {
  const out: SkillKey[] = [];
  for (const value of values ?? []) {
    if (isSkillKey(value) && !out.includes(value)) {
      out.push(value);
    }
  }
  return out;
}

/** UI labels. Icons are Figma exports owned by catalog cards (Wave 1A). */
export const SKILL_LABELS: Record<"ru" | "en", Record<SkillKey, string>> = {
  ru: {
    awareness: "Осознавание",
    technique: "Техника",
    variability: "Вариативность",
    interaction: "Взаимодействие",
    musicality: "Музыкальность",
  },
  en: {
    awareness: "Awareness",
    technique: "Technique",
    variability: "Variability",
    interaction: "Interaction",
    musicality: "Musicality",
  },
};
