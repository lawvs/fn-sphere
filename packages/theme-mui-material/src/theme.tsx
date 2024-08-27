import { createFilterTheme, useFilterRule, useView } from "@fn-sphere/filter";
import {
  Delete as DeleteIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import {
  Button,
  IconButton,
  Input,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { useCallback, type ChangeEvent } from "react";

export const filterTheme = createFilterTheme({
  components: {
    Button: ({ ref, color, ...props }) => (
      <Button variant="contained" {...props} />
    ),
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
    SingleFilter: ({ rule }) => {
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
          {isValid ? null : <ErrorOutlineIcon fontSize="small" />}
          <IconButton aria-label="delete" onClick={handleClickDelete}>
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </SingleFilterContainer>
      );
    },
  },
});
