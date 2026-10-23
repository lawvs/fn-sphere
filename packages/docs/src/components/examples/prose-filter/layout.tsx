import type { PropsWithChildren } from "react";
import { useRootRule } from "@fn-sphere/filter";
import type { ProseLocale } from "./locales";

const localeOptions = [
  { value: "en-US", label: "English" },
  { value: "zh-CN", label: "简体中文" },
  { value: "ja-JP", label: "日本語" },
] as const;

type LocaleSelectProps = {
  locale: ProseLocale;
  onLocaleChange: (locale: ProseLocale) => void;
};

export function Layout({
  locale,
  onLocaleChange,
  children,
}: PropsWithChildren<LocaleSelectProps>) {
  const { getLocaleText: t } = useRootRule();
  return (
    <section lang={locale} className="prose-editor" aria-label={t("title")}>
      <header className="prose-heading">
        <span className="prose-eyebrow">{t("title")}</span>
        <LocaleSelect locale={locale} onLocaleChange={onLocaleChange} />
      </header>
      <h3>{t("heading")}</h3>
      {children}
    </section>
  );
}

function LocaleSelect({ locale, onLocaleChange }: LocaleSelectProps) {
  const { getLocaleText: t } = useRootRule();
  return (
    <label className="prose-language">
      <span>{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        onChange={(event) => onLocaleChange(event.target.value as ProseLocale)}
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
