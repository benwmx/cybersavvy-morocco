import { useLang } from "@/lib/i18n/LanguageContext";

export function useI18n() {
  const { lang } = useLang();

  /**
   * Translates a JSONB object from the database that follows the { fr: string, ar: string } format.
   */
  const translate = (content: any): string => {
    if (!content) return '';
    
    // Handle the case where the content is already a string
    if (typeof content === 'string') return content;

    // Handle the JSONB structure { fr: '...', ar: '...' }
    if (content[lang]) return content[lang];

    // Fallback logic
    return content['fr'] || content['ar'] || '';
  };

  return { translate, lang };
}
