import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, CURRENCY_SYMBOLS } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    localStorage.setItem('currency', SUPPORTED_LANGUAGES[languageCode as keyof typeof SUPPORTED_LANGUAGES].currency);
  };

  const currentLanguage = i18n.language || 'en-US';
  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES] || SUPPORTED_LANGUAGES['en-US'];

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-emerald-50 px-2 py-1 text-lg">
        <SelectValue placeholder={currentLangInfo.flag} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span>{info.flag}</span>
              <span>{info.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
