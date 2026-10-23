// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ProseFilter } from "./index";
import { z } from "zod";
import {
  FilterBuilder,
  FilterSphereProvider,
  createFilterGroup,
  createSingleFilter,
  defaultMapFieldName,
  useFilterSphere,
  type FilterTheme,
} from "@fn-sphere/filter";
import { proseTheme } from "./theme";
import { ProseCondition, ProseGroup } from "./theme/prose-rule";
import { messages } from "./locale";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<ProseFilter />));
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
function button(label: string, scope: ParentNode = document) {
  const match = Array.from(
    scope.querySelectorAll<HTMLButtonElement>("button"),
  ).find(
    (element) =>
      element.getAttribute("aria-label") === label ||
      element.textContent === label,
  );
  if (!match) throw new Error(`Button not found: ${label}`);
  return match;
}
function click(label: string, scope?: ParentNode) {
  act(() => button(label, scope).click());
}
function valueButton(fieldLabel: string) {
  const condition = button(fieldLabel).closest(".prose-condition")!;
  return condition.querySelector<HTMLButtonElement>(
    "button.prose-value, button.prose-values",
  )!;
}
function clickValue(fieldLabel: string) {
  act(() => valueButton(fieldLabel).click());
}
function json() {
  if (!container.querySelector(".prose-json"))
    act(() =>
      container.querySelector<HTMLButtonElement>(".prose-json-toggle")!.click(),
    );
  return JSON.parse(container.querySelector(".prose-json")!.textContent!);
}
function input(value: string) {
  const element = document.querySelector<HTMLInputElement>(".prose-draft")!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

test("nested additions can be edited and deleted without touching siblings", () => {
  click("+ nested list");
  const nested = container.querySelectorAll(".prose-nested-group")[1]!;
  click("+ add to this list", nested);
  expect(json().filterRule.conditions[1].conditions[3].conditions).toHaveLength(
    2,
  );
  click("Match all conditions in this group", nested);
  expect(json().filterRule.conditions[1].conditions[3].op).toBe("or");
  click("Delete amount condition", nested);
  expect(json().filterRule.conditions[1].conditions[3].conditions).toHaveLength(
    1,
  );
  click("Delete amount condition", nested);
  expect(json().filterRule.conditions[1].conditions).toHaveLength(3);
  expect(json().filterRule.conditions[0].args).toEqual(["Manager"]);
});

test("deleting the last condition leaves an editable empty root", () => {
  click("Delete this group");
  click("Delete submitter’s seniority condition");
  expect(json().filterRule.conditions).toEqual([]);
  expect(container.textContent).toContain(
    "Add a condition to filter expenses.",
  );
  click("+ condition");
  expect(json().filterRule.conditions[0].args).toEqual([500]);
});

test("text drafts cancel cleanly and commit only on apply", () => {
  clickValue("Field: merchant");
  input("WeWork");
  click("Cancel");
  expect(json().filterRule.conditions[1].conditions[1].args).toEqual(["Uber"]);
  clickValue("Field: merchant");
  expect(document.querySelector<HTMLInputElement>(".prose-draft")!.value).toBe(
    "Uber",
  );
  input("WeWork");
  click("Apply");
  expect(json().filterRule.conditions[1].conditions[1].args).toEqual([
    "WeWork",
  ]);
});

test("number editors reject empty input and preserve numeric zero", () => {
  click("+ condition");
  clickValue("Field: amount");
  input("");
  click("Apply");
  expect(document.querySelector(".prose-input-error")).not.toBeNull();
  expect(json().filterRule.conditions[2].args).toEqual([500]);
  input("0");
  click("Apply");
  expect(json().filterRule.conditions[2].args).toEqual([0]);
});

test("multi-select toggles update live and Done preserves the selection", () => {
  clickValue("Field: expense type");
  const entertainment = Array.from(
    document.querySelectorAll(".prose-checkbox"),
  ).find((label) => label.textContent === "Entertainment")!;
  act(() => entertainment.querySelector<HTMLInputElement>("input")!.click());
  expect(json().filterRule.conditions[1].conditions[0].args[0]).toEqual([
    "Food & drink",
    "Travel",
    "Entertainment",
  ]);
  click("Done");
  expect(document.querySelector(".prose-popup")).toBeNull();
  expect(json().filterRule.conditions[1].conditions[0].args[0]).toEqual([
    "Food & drink",
    "Travel",
    "Entertainment",
  ]);
});

test("Delete on a condition trigger removes it, while a draft input keeps native keys", () => {
  const trigger = button("Field: currency");
  act(() =>
    trigger.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Delete", bubbles: true }),
    ),
  );
  expect(json().filterRule.conditions[1].conditions).toHaveLength(2);
  clickValue("Field: merchant");
  const draft = document.querySelector<HTMLInputElement>(".prose-draft")!;
  act(() =>
    draft.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Delete", bubbles: true }),
    ),
  );
  expect(json().filterRule.conditions[1].conditions).toHaveLength(2);
});

function choose(label: string, option: string) {
  act(() =>
    button(label).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    ),
  );
  const item = Array.from(
    document.querySelectorAll<HTMLElement>('[role="option"]'),
  ).find((element) => element.textContent?.replace("✓", "").trim() === option);
  if (!item) throw new Error(`Option not found: ${option}`);
  act(() =>
    item.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    ),
  );
}

test("field and operator changes retain only compatible arguments", () => {
  choose("Operator for expense type", "is none of");
  expect(json().filterRule.conditions[1].conditions[0].args).toEqual([
    ["Food & drink", "Travel"],
  ]);
  choose("Field: expense type", "merchant");
  const merchant = json().filterRule.conditions[1].conditions[0];
  expect(merchant.name).toBe("notContains");
  expect(merchant.args).toEqual([]);
  choose("Field: submitter’s seniority", "submitter’s department");
  expect(json().filterRule.conditions[0].args).toEqual([]);
  choose("Field: submitter’s department", "amount");
  expect(json().filterRule.conditions[0].args).toEqual([]);
  choose("Operator for amount", "is at least");
  clickValue("Field: amount");
  input("5000");
  click("Apply");
  choose("Operator for amount", "is at most");
  expect(json().filterRule.conditions[0].args).toEqual([5000]);
});

test("filter JSON reflects the selected logic without a workflow action", () => {
  click("Join root conditions with and");
  expect(json().filterRule.op).toBe("or");
  expect(json()).not.toHaveProperty("action");
  expect(container.textContent).toContain("Show expenses where");
  expect(container.textContent).not.toContain("Then");
});

function switchLocale(locale: string) {
  const select = container.querySelector<HTMLSelectElement>(
    ".prose-language select",
  )!;
  act(() => {
    select.value = locale;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

test("locale changes translate the full UI without changing rules", () => {
  const initial = json();
  switchLocale("zh-CN");
  expect(container.querySelector(".prose-editor")?.getAttribute("lang")).toBe(
    "zh-CN",
  );
  expect(container.querySelector(".prose-sentence")?.textContent).toContain(
    "筛选符合以下条件的费用记录：",
  );
  expect(container.querySelector(".prose-sentence")?.textContent).toContain(
    "提交人的职级是经理",
  );
  expect(container.textContent).toContain("餐饮或差旅");
  expect(container.textContent).toContain("以下条件至少一项成立");
  expect(json()).toEqual(initial);
  clickValue("字段：费用类型");
  expect(document.querySelector(".prose-popup")?.getAttribute("lang")).toBe(
    "zh-CN",
  );
  expect(document.querySelector(".prose-popup")?.textContent).toContain(
    "选择一项或多项",
  );
  switchLocale("ja-JP");
  expect(document.querySelector(".prose-popup")).toBeNull();
  expect(container.querySelector(".prose-sentence")?.textContent).toContain(
    "申請者の役職がマネージャーである",
  );
  expect(container.textContent).toContain("飲食または出張");
  expect(container.textContent).toContain("次の条件のいずれかが成立");
  expect(json()).toEqual(initial);
});

test("localized edits store canonical values and preserve filters across languages", () => {
  switchLocale("zh-CN");
  choose("字段：提交人的职级", "提交人的部门");
  choose("提交人的部门的运算符", "不是以下任一项");
  clickValue("字段：提交人的部门");
  for (const text of ["销售部", "市场部"]) {
    const label = Array.from(document.querySelectorAll(".prose-checkbox")).find(
      (element) => element.textContent === text,
    )!;
    act(() => label.querySelector<HTMLInputElement>("input")!.click());
  }
  click("完成");
  expect(json().filterRule.conditions[0].args).toEqual([
    ["Sales", "Marketing"],
  ]);
  expect(container.textContent).toContain("不是以下任一项销售部或市场部");
  click("使用“并且”连接根条件");
  expect(json().filterRule.op).toBe("or");
  switchLocale("ja-JP");
  expect(container.textContent).toContain(
    "営業部またはマーケティング部のいずれでもない",
  );
  switchLocale("en-US");
  expect(container.textContent).toContain("is none of Sales or Marketing");
  expect(json().filterRule.op).toBe("or");
});

test("localized text editors translate validation and cancel draft changes", () => {
  switchLocale("zh-CN");
  click("+ 条件");
  clickValue("字段：金额");
  input("");
  click("应用");
  expect(document.querySelector(".prose-input-error")?.textContent).toBe(
    "请输入一个有限数值。",
  );
  input("123");
  switchLocale("ja-JP");
  expect(document.querySelector(".prose-popup")).toBeNull();
  expect(json().filterRule.conditions[2].args).toEqual([500]);
  clickValue("項目：金額");
  expect(document.querySelector<HTMLInputElement>(".prose-draft")!.value).toBe(
    "500",
  );
  click("キャンセル");
});

test("localized group and root joiners use canonical operators", () => {
  switchLocale("zh-CN");
  click("匹配此组的至少一项条件");
  expect(json().filterRule.conditions[1].op).toBe("and");
  expect(container.textContent).toContain("以下条件全部成立");
  click("使用“并且”连接根条件");
  expect(json().filterRule.op).toBe("or");
  switchLocale("ja-JP");
  click("このグループのすべての条件に一致");
  expect(json().filterRule.conditions[1].op).toBe("or");
  expect(container.textContent).toContain("次の条件のいずれかが成立");
});

const metadataSchema = z.object({
  code: z
    .union([
      z.literal(1).describe("First code"),
      z.literal(2).describe("Second code"),
    ])
    .describe("Code metadata"),
});

function MetadataExample({ theme = proseTheme }: { theme?: FilterTheme }) {
  const { context } = useFilterSphere({
    schema: metadataSchema,
    getLocaleText: (key) =>
      key === "sentence.filter"
        ? "Custom filter introduction: "
        : Object.hasOwn(messages["en-US"], key)
          ? messages["en-US"][key]!
          : key,
    mapFieldName: (field) => `Mapped ${defaultMapFieldName(field)}`,
    defaultRule: () =>
      createFilterGroup({
        op: "and",
        conditions: [
          createFilterGroup({
            op: "or",
            conditions: [
              createSingleFilter({
                path: ["code"],
                name: "contains",
                args: [[1, 2]],
              }),
            ],
          }),
        ],
      }),
  });
  return (
    <FilterSphereProvider context={context} theme={theme}>
      <FilterBuilder />
    </FilterSphereProvider>
  );
}

test("field labels use the mapper and membership values use literal metadata", () => {
  act(() => root.render(<MetadataExample />));
  expect(container.textContent).toContain("Custom filter introduction: ");
  expect(button("Field: Mapped Code metadata").textContent).toBe(
    "Mapped Code metadata",
  );
  expect(button("Operator for Mapped Code metadata")).toBeTruthy();
  expect(valueButton("Field: Mapped Code metadata").textContent).toBe(
    "First code or Second code",
  );
  clickValue("Field: Mapped Code metadata");
  const first = document.querySelector<HTMLInputElement>(
    ".prose-checkbox input",
  )!;
  act(() => first.click());
  expect(valueButton("Field: Mapped Code metadata").textContent).toBe(
    "Second code",
  );
  act(() => first.click());
  expect(valueButton("Field: Mapped Code metadata").textContent).toBe(
    "First code or Second code",
  );
});

test("nested groups resolve overridden group and condition templates", () => {
  const theme: FilterTheme = {
    ...proseTheme,
    templates: {
      ...proseTheme.templates,
      FilterGroup: ({ rule }) => (
        <div data-custom-group="">
          <ProseGroup rule={rule} />
        </div>
      ),
      SingleFilter: ({ rule }) => (
        <span data-custom-condition="">
          <ProseCondition rule={rule} />
        </span>
      ),
    },
  };
  act(() => root.render(<MetadataExample theme={theme} />));
  expect(container.querySelectorAll("[data-custom-group]")).toHaveLength(2);
  expect(container.querySelectorAll("[data-custom-condition]")).toHaveLength(1);
});

test("string filters use native options and do not render membership prose", () => {
  choose("Operator for merchant", "contains");
  expect(button("Operator for merchant").textContent).toBe("contains");
  expect(json().filterRule.conditions[1].conditions[1].args).toEqual(["Uber"]);
  choose("Operator for merchant", "starts with");
  expect(json().filterRule.conditions[1].conditions[1].name).toBe("startsWith");
  choose("Operator for merchant", "ends with");
  expect(json().filterRule.conditions[1].conditions[1].name).toBe("endsWith");
  choose("Operator for merchant", "is empty");
  expect(json().filterRule.conditions[1].conditions[1].args).toEqual([]);
  expect(
    container.querySelectorAll(".prose-condition")[2]!.textContent,
  ).not.toContain("choose a value");
  choose("Operator for merchant", "is not empty");
  expect(json().filterRule.conditions[1].conditions[1].name).toBe("isNotEmpty");
});
