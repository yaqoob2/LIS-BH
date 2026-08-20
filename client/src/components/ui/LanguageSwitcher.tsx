import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const isArabic = i18n.language.startsWith("ar");

  async function switchLanguage() {
    const nextLanguage = isArabic ? "en" : "ar";

    await i18n.changeLanguage(nextLanguage);

    localStorage.setItem("language", nextLanguage);

    document.documentElement.lang = nextLanguage;

    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
  }

  return (
    <button
      type="button"
      onClick={() => void switchLanguage()}
      className="flex h-9 items-center gap-1.5 border border-[#E1E4EA] bg-white px-2.5 text-[11px] font-medium text-[#475467] transition-colors hover:bg-[#F8F9FB]"
      title={isArabic ? "English" : "العربية"}
    >
      <Languages size={14} />

      {isArabic ? "EN" : "AR"}
    </button>
  );
}
