/** Port of the `Translatable` data class in android/core/domain/.../Product.kt. */
export interface Translatable {
  hi?: string;
  en?: string;
  sourceLang: "hi" | "en";
}

export function translatableOf(partial: Partial<Translatable> = {}): Translatable {
  return { sourceLang: "hi", ...partial };
}

export function inLang(t: Translatable, lang: string): string | undefined {
  return lang === "hi" ? (t.hi ?? t.en) : (t.en ?? t.hi);
}

/** Text carried in both languages. The source is never overwritten by a translation. */
export function source(t: Translatable): string | undefined {
  return t.sourceLang === "hi" ? t.hi : t.en;
}
