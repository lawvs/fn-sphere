import { Fragment, useRef, type KeyboardEvent } from "react";
import {
  useFilterGroup,
  useFilterRule,
  useFilterSelect,
  useView,
  useRootRule,
  type FilterGroup,
  type SingleFilter,
} from "@fn-sphere/filter";
import { InlineSelect, ValueLabelContext } from "./inline-editors";
import { ProseText, formatText } from "./text";
import { createDefaultRule } from "../schema";

// Capture a surviving focus target before React removes the current condition.
function focusAfterRemoval(element: HTMLElement | null) {
  const editor = element?.closest(".prose-editor");
  if (!editor || !element) return;
  const fields = Array.from(
    editor.querySelectorAll<HTMLElement>("[data-prose-rule] .prose-field"),
  );
  const current = element.querySelector<HTMLElement>(".prose-field");
  const index = current ? fields.indexOf(current) : -1;
  const next =
    fields.slice(index + 1).find((field) => !element.contains(field)) ??
    fields
      .slice(0, Math.max(index, 0))
      .reverse()
      .find((field) => !element.contains(field));
  // The root add control survives removal of empty ancestor groups.
  const fallback = editor.querySelector<HTMLElement>("[data-root-add]");
  (next ?? fallback)?.focus();
}

export function ProseCondition({ rule }: { rule: SingleFilter }) {
  const { getLocaleText: t, mapFieldName } = useRootRule();
  const { FieldSelect, FilterSelect, FilterDataInput } = useView("templates");
  const { removeRule, selectedField, ruleState } = useFilterRule(rule);
  const element = useRef<HTMLSpanElement>(null);
  const fieldName = selectedField
    ? t(mapFieldName(selectedField))
    : t("condition");
  const remove = () => {
    focusAfterRemoval(element.current);
    removeRule(true);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (
      event.key === "Delete" &&
      target.closest(".prose-token") &&
      !target.closest(".prose-popup") &&
      !element.current?.querySelector('[data-state="open"]')
    ) {
      event.preventDefault();
      event.stopPropagation();
      remove();
    }
  };
  return (
    <span
      ref={element}
      className="prose-condition"
      data-prose-rule=""
      onKeyDown={onKeyDown}
    >
      <ProseText
        message="sentence.condition"
        slots={{
          field: <FieldSelect rule={rule} />,
          operator: <FilterSelect rule={rule} />,
          value: (
            <ValueLabelContext.Provider
              value={formatText(t("valueLabel"), { field: fieldName })}
            >
              <FilterDataInput rule={rule} />
            </ValueLabelContext.Provider>
          ),
        }}
      />
      <button
        type="button"
        className="prose-remove"
        aria-label={formatText(t("deleteCondition"), { field: fieldName })}
        onClick={remove}
      >
        ×
      </button>
      {!ruleState.isValid && (
        <span className="prose-incomplete" role="status">
          {" "}
          {t("incomplete")}
        </span>
      )}
    </span>
  );
}

export function ProseField({ rule }: { rule: SingleFilter }) {
  const { getLocaleText: t, mapFieldName } = useRootRule();
  const { fieldOptions, selectedField, setField } = useFilterSelect(rule);
  return (
    <InlineSelect
      className="prose-field"
      aria-label={formatText(t("fieldLabel"), {
        field: selectedField ? t(mapFieldName(selectedField)) : t("condition"),
      })}
      options={fieldOptions}
      value={selectedField}
      onChange={(field) => setField(field)}
    />
  );
}

export function ProseOperator({ rule }: { rule: SingleFilter }) {
  const { getLocaleText: t, mapFieldName } = useRootRule();
  const {
    filterOptions = [],
    selectedFilter,
    selectedField,
    setFilter,
  } = useFilterSelect(rule);
  const fieldName = selectedField
    ? t(mapFieldName(selectedField))
    : t("condition");
  return (
    <InlineSelect
      className="prose-operator"
      aria-label={formatText(t("operatorLabel"), { field: fieldName })}
      options={filterOptions}
      value={selectedFilter}
      onChange={(filter) => setFilter(filter)}
    />
  );
}

export function ProseGroup({ rule }: { rule: FilterGroup }) {
  const { getLocaleText: t } = useRootRule();
  const { SingleFilter: ConditionView, FilterGroup: GroupView } =
    useView("templates");
  const {
    ruleState: { isRoot },
    toggleGroupOp,
    appendChildRule,
    appendChildGroup,
    removeGroup,
  } = useFilterGroup(rule);
  const element = useRef<HTMLDivElement>(null);
  const groupLabel = t(`match.${rule.op}`);
  const groupControl = (
    <button
      type="button"
      className="prose-token prose-joiner"
      aria-label={t(`groupLabel.${rule.op}`)}
      onClick={() => toggleGroupOp()}
    >
      {groupLabel}
    </button>
  );
  const renderChild = (child: FilterGroup["conditions"][number]) =>
    child.type === "Filter" ? (
      <ConditionView rule={child} />
    ) : (
      <GroupView rule={child} />
    );
  return (
    <div
      ref={element}
      className={isRoot ? "prose-root-group" : "prose-nested-group"}
    >
      {isRoot ? (
        <div className="prose-sentence">
          {rule.conditions.length > 0 && t("sentence.filter")}
          {rule.conditions.map((child, index) => (
            <Fragment key={child.id}>
              {index > 0 && (
                <>
                  {t("comma")}
                  <button
                    type="button"
                    className="prose-token prose-joiner"
                    aria-label={formatText(t("joinLabel"), {
                      operator: t(`join.${rule.op}`),
                    })}
                    onClick={() => toggleGroupOp()}
                  >
                    {t(`join.${rule.op}`)}
                  </button>
                  {t("space")}
                </>
              )}
              {renderChild(child)}
            </Fragment>
          ))}
          {!rule.conditions.length && (
            <span className="prose-empty">{t("emptyRoot")}</span>
          )}
        </div>
      ) : (
        <>
          <ProseText
            message={`sentence.group.${rule.op}`}
            slots={{ match: groupControl }}
          />
          <ul className="prose-condition-list">
            {rule.conditions.map((child) => (
              <li key={child.id}>{renderChild(child)}</li>
            ))}
          </ul>
          {!rule.conditions.length && (
            <span className="prose-empty">{t("emptyGroup")}</span>
          )}
        </>
      )}
      <div className="prose-add-actions">
        <button
          type="button"
          data-root-add={isRoot ? "" : undefined}
          onClick={() => appendChildRule(createDefaultRule())}
        >
          {t(isRoot ? "addCondition" : "addToList")}
        </button>
        <button
          type="button"
          onClick={() =>
            appendChildGroup({ op: "and", conditions: [createDefaultRule()] })
          }
        >
          {t(isRoot ? "addGroup" : "addNested")}
        </button>
        {!isRoot && (
          <button
            type="button"
            aria-label={t("deleteGroup")}
            onClick={() => {
              focusAfterRemoval(element.current);
              removeGroup();
            }}
          >
            {t("removeList")}
          </button>
        )}
      </div>
    </div>
  );
}
