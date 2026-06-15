import {
  createFilterTheme,
  useFilterGroup,
  useFilterRule,
  useRootRule,
  useView,
} from "@fn-sphere/filter";
import {
  Add as AddIcon,
  Clear as ClearIcon,
  CreateNewFolderOutlined as CreateNewFolderIcon,
  ErrorOutlineOutlined as ErrorOutlineIcon,
} from "@mui/icons-material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import NativeSelect from "@mui/material/NativeSelect";
import Stack from "@mui/material/Stack";
import { useCallback, type ChangeEvent } from "react";

export const filterTheme = createFilterTheme({
  components: {
    Button: ({ color, ...props }) => <Button {...props} />,
    Input: ({ color, size, onChange, ...props }) => {
      const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event.target.value);
        },
        [onChange],
      );
      return <Input onChange={handleChange} {...props} />;
    },
    Select: ({ options = [], value, color, size, onChange, ...props }) => {
      const selectedIdx = options.findIndex((option) => option.value === value);
      const handleChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
          const index = Number(event.target.value);
          const selectedOption = options[index];
          if (!selectedOption) return;
          onChange?.(selectedOption.value);
        },
        [options, onChange],
      );
      return (
        <NativeSelect
          sx={{
            minWidth: "120px",
          }}
          value={String(selectedIdx === -1 ? "" : selectedIdx)}
          onChange={handleChange}
          inputProps={props}
        >
          <option value="" disabled />
          {options?.map((option, index) => (
            <option key={option.label} value={String(index)}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      );
    },
    MultipleSelect: ({
      options = [],
      value = [],
      color,
      size,
      onChange,
      ...props
    }) => {
      const selectedIndices = value.map((val) =>
        String(options.findIndex((option) => option.value === val)),
      );
      const handleChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
          const selectedOptions = Array.from(
            event.target.selectedOptions,
            (option) => {
              const index = Number(option.value);
              const selectedOption = options[index];
              if (!selectedOption) return;
              return selectedOption.value;
            },
          ).filter((i) => i !== undefined);
          onChange?.(selectedOptions);
        },
        [options, onChange],
      );
      return (
        <NativeSelect
          value={selectedIndices}
          onChange={handleChange}
          inputProps={{
            ...props,
            multiple: true,
          }}
        >
          {options?.map((option, index) => (
            <option key={option.label} value={String(index)}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      );
    },
  },
  templates: {
    FilterGroupContainer: ({ rule, children }) => {
      const { getLocaleText } = useRootRule();
      const {
        ruleState: { isRoot, depth },
        toggleGroupOp,
        appendChildRule,
        appendChildGroup,
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

      return (
        <Stack
          spacing={2}
          sx={{
            alignItems: "flex-start",
            paddingLeft: isRoot ? 0 : 4,
          }}
        >
          <Button variant="outlined" onClick={handleToggleGroupOp}>
            {text}
          </Button>
          {children}
          <Stack direction="row" spacing={1}>
            <Button startIcon={<AddIcon />} onClick={handleAddCondition}>
              {getLocaleText("addRule")}
            </Button>
            {depth < 3 && (
              <Button
                startIcon={<CreateNewFolderIcon />}
                onClick={handleAddGroup}
              >
                {getLocaleText("addGroup")}
              </Button>
            )}
          </Stack>
        </Stack>
      );
    },
    SingleFilter: ({ rule }) => {
      const { getLocaleText } = useRootRule();
      const {
        ruleState: { isValid },
        removeRule,
      } = useFilterRule(rule);
      const {
        FieldSelect,
        FilterSelect,
        FilterDataInput,
        SingleFilterContainer,
      } = useView("templates");

      const handleClickDelete = useCallback(() => {
        removeRule(true);
      }, [removeRule]);

      return (
        <SingleFilterContainer rule={rule}>
          <FieldSelect rule={rule} />
          <FilterSelect rule={rule} />
          <FilterDataInput rule={rule} />
          {isValid ? null : (
            <ErrorOutlineIcon color="disabled" fontSize="small" />
          )}
          <IconButton
            aria-label={getLocaleText("deleteRule")}
            onClick={handleClickDelete}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </SingleFilterContainer>
      );
    },
  },
});
