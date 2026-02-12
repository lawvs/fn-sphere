import { enUS, jaJP, zhCN } from "@fn-sphere/filter/locales";
import { useState } from "react";
import { Table } from "./table";

const locales = [
  { key: "en-US", label: "English (en-US)", value: enUS },
  { key: "ja-JP", label: "日本語 (ja-JP)", value: jaJP },
  { key: "zh-CN", label: "中文 (zh-CN)", value: zhCN },
] as const;

function getCategory(key: string): string {
  if (
    key.startsWith("operator") ||
    key.startsWith("add") ||
    key.startsWith("delete")
  )
    return "Layout";
  if (key.startsWith("enum")) return "Enum Filter";
  if (key.startsWith("number") || key.startsWith("greater") || key.startsWith("less"))
    return "Number Filter";
  if (key.startsWith("value")) return "Boolean Filter";
  if (["contains", "notContains", "startsWith", "endsWith"].includes(key))
    return "String Filter";
  if (["before", "after"].includes(key)) return "Date Filter";
  return "General Filter";
}

export function LocaleKeysTable() {
  const [localeKey, setLocaleKey] = useState("en-US");
  const selectedLocale =
    locales.find((l) => l.key === localeKey)?.value ?? enUS;

  const data = Object.entries(enUS).map(([key]) => ({
    Key: (
      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
        {key}
      </span>
    ),
    "Default Value": (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {selectedLocale[key as keyof typeof selectedLocale] ?? "-"}
      </span>
    ),
    Category: (
      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {getCategory(key)}
      </span>
    ),
  }));

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <label
          htmlFor="locale-select"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Language:
        </label>
        <select
          id="locale-select"
          value={localeKey}
          onChange={(e) => setLocaleKey(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {locales.map((locale) => (
            <option key={locale.key} value={locale.key}>
              {locale.label}
            </option>
          ))}
        </select>
      </div>
      <Table data={data} className="not-content" />
    </div>
  );
}
