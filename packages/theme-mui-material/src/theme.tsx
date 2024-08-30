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
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import {
  Button,
  IconButton,
  Input,
  MenuItem,
  Select,
  Stack,
  type SelectChangeEvent,
} from "@mui/material";
import { useCallback, type ChangeEvent } from "react";

export const filterTheme = createFilterTheme({
  components: {
    Button: ({ ref, color, ...props }) => <Button {...props} />,
    Input: ({ ref, color, size, onChange, ...props }) => {
      const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event.target.value);
        },
        [onChange],
      );
      return <Input onChange={handleChange} {...props} />;
    },
    Select: ({ options = [], value, ref, color, size, onChange, ...props }) => {
      const selectedIdx = options.findIndex((option) => option.value === value);
      const handleChange = useCallback(
        (event: SelectChangeEvent) => {
          const index = Number(event.target.value);
          const selectedOption = options[index];
          if (!selectedOption) return;
          onChange?.(selectedOption.value);
        },
        [options, onChange],
      );
      return (
        <Select
          size="small"
          sx={{
            minWidth: "120px",
          }}
          // Type 'EventHandler<HTMLSelectElement> | undefined' is not assignable to
          // type 'EventHandler<HTMLDivElement> | undefined'.
          {...(props as any)}
          value={String(selectedIdx === -1 ? "" : selectedIdx)}
          onChange={handleChange}
        >
          {options?.map((option, index) => (
            <MenuItem key={option.label} value={String(index)}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      );
    },
    MultipleSelect: ({
      options = [],
      value = [],
      ref,
      color,
      size,
      onChange,
      ...props
    }) => {
      const selectedIndices = value.map((val) =>
        String(options.findIndex((option) => option.value === val)),
      );
      const handleChange = useCallback(
        (event: SelectChangeEvent<string[]>) => {
          const targetValue = event.target.value;
          const normalizedValue =
            // On autofill we get a stringified value.
            typeof targetValue === "string"
              ? targetValue.split(",")
              : targetValue;
          const selectedOptions = Array.from(normalizedValue, (option) => {
            const index = Number(option);
            const selectedOption = options[index];
            if (!selectedOption) return;
            return selectedOption.value;
          }).filter((i) => i !== undefined);
          onChange?.(selectedOptions);
        },
        [options, onChange],
      );
      return (
        <Select
          // Type 'EventHandler<HTMLSelectElement> | undefined' is not assignable to
          // type 'EventHandler<HTMLDivElement> | undefined'.
          {...(props as any)}
          multiple
          value={selectedIndices}
          onChange={handleChange}
        >
          {options?.map((option, index) => (
            <MenuItem key={option.label} value={String(index)}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      );
    },
  },
  templates: {
    FilterGroupContainer: ({ filterGroup, children }) => {
      const { getLocaleText } = useRootRule();
      const {
        ruleState: { isRoot, depth },
        toggleGroupOp,
        appendChildRule,
        appendChildGroup,
      } = useFilterGroup(filterGroup);

      const text =
        filterGroup.op === "or"
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
