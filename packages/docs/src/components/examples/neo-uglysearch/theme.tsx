import {
  type FilterTheme,
  createFilterTheme,
  presetTheme,
  useFilterGroup,
  useRootRule,
} from "@fn-sphere/filter";
import { type ChangeEvent, useCallback } from "react";

const componentsSpec = {
  Button: (props) => {
    return (
      <button
        className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm text-black font-base font-semibold ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-mtext bg-[#FE9F61] border-2 border-black"
        {...props}
      />
    );
  },
  Input: ({ onChange, ...props }) => {
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
      },
      [onChange],
    );
    return (
      <input
        className="flex h-10 w-full rounded-md border-2 text-black font-base selection:bg-[#FE9F61] selection:text-mtext border-black bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onChange={handleChange}
        {...props}
      />
    );
  },
} satisfies Partial<FilterTheme["components"]>;

const templatesSpec = {
  FilterGroupContainer: ({ rule, children, ...props }) => {
    const { getLocaleText } = useRootRule();
    const {
      ruleState: { isRoot, depth },
      toggleGroupOp,
      appendChildRule,
      appendChildGroup,
      removeGroup,
    } = useFilterGroup(rule);

    const text =
      rule.op === "or"
        ? getLocaleText("operatorOr")
        : getLocaleText("operatorAnd");

    const handleToggleGroupOp = useCallback(() => {
      toggleGroupOp();
    }, [toggleGroupOp]);

    const handleAddCondition = useCallback(() => {
      appendChildRule();
    }, [appendChildRule]);

    const handleAddGroup = useCallback(() => {
      appendChildGroup();
    }, [appendChildGroup]);

    const handleDeleteGroup = useCallback(() => {
      removeGroup();
    }, [removeGroup]);

    return (
      <div
        className={[
          "relative flex flex-col items-start rounded-md border-2 border-black px-3 py-2 gap-2 bg-opacity pt-8 bg-[#fff4e0]",
          isRoot ? "mt-8" : "mt-6",
        ].join(" ")}
        {...props}
      >
        <div className="flex gap-2 absolute top-0 -translate-y-1/2">
          <button
            className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-base font-semibold ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-black bg-[#FE9F61] border-2 border-black shadow-[4px_3px_0_0_rgb(0,0,0)] hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
            onClick={handleToggleGroupOp}
          >
            {text}
          </button>
          <button
            className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-base font-semibold ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black border-2 border-black shadow-[4px_3px_0_0_rgb(0,0,0)] hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
            onClick={handleAddCondition}
          >
            {getLocaleText("addRule")}
          </button>
          {depth < 3 && (
            <button
              className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-base font-semibold ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black border-2 border-black shadow-[4px_3px_0_0_rgb(0,0,0)] hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
              onClick={handleAddGroup}
            >
              {getLocaleText("addGroup")}
            </button>
          )}
          {!isRoot && (
            <button
              className="h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-base font-semibold ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black border-2 border-black shadow-[4px_3px_0_0_rgb(0,0,0)] hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
              onClick={handleDeleteGroup}
            >
              {getLocaleText("deleteGroup")}
            </button>
          )}
        </div>
        {children}
      </div>
    );
  },
  FilterSelect: (props) => {
    const PresetFilterSelect = presetTheme.templates.FilterSelect;
    return <PresetFilterSelect tryRetainArgs {...props} />;
  },
} satisfies Partial<FilterTheme["templates"]>;

export const theme = createFilterTheme({
  primitives: {
    select: ({ ...props }) => {
      return (
        <select
          {...props}
          className="flex h-10 w-full items-center text-black bg-[#FE9F61] justify-between rounded-md border-2 border-black px-3 py-2 text-sm font-base ring-offset-white placeholder:text-mtext placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        />
      );
    },
  },
  components: componentsSpec,
  templates: templatesSpec,
});
