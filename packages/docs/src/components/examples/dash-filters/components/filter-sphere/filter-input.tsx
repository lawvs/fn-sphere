import {
  type SingleFilter,
  useFilterRule,
  useRootRule,
  useView,
} from "@fn-sphere/filter";

interface FieldInputProperties {
  rule: SingleFilter;
}

export default function FilterInput({ rule }: Readonly<FieldInputProperties>) {
  const { FilterDataInput } = useView("templates");
  const { selectedField } = useFilterRule(rule);
  const { mapFieldName, getLocaleText } = useRootRule();

  if (!selectedField) return;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <span className="text-xs font-bold">
          {getLocaleText(mapFieldName(selectedField))}
        </span>
      </div>
      <FilterDataInput rule={rule} />
    </div>
  );
}
