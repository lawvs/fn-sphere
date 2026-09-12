// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { z } from "zod";
import { SchemaInput } from "./input";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const typeInput = (value: string) => {
  const input = container.querySelector("input")!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

test("number view emits numbers and preserves empty input without parsing refinements", () => {
  const onChange = vi.fn();
  act(() =>
    root.render(
      <SchemaInput
        schema={z.number().min(5)}
        value={10}
        onChange={onChange}
        label="value"
      />,
    ),
  );

  expect(container.querySelector("input")?.type).toBe("number");
  typeInput("1.5");
  expect(onChange).toHaveBeenLastCalledWith(1.5);
  typeInput("");
  expect(onChange).toHaveBeenLastCalledWith(undefined);
  typeInput("0");
  expect(onChange).toHaveBeenLastCalledWith(0);
});

test("coercing boolean schema selects a view that emits actual booleans", () => {
  const onChange = vi.fn();
  act(() =>
    root.render(
      <SchemaInput
        schema={z.coerce.boolean()}
        value={true}
        onChange={onChange}
        label="value"
      />,
    ),
  );
  const select = container.querySelector("select")!;
  expect(select.value).toBe("true");
  act(() => {
    select.value = "false";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(onChange).toHaveBeenLastCalledWith(false);
});

test("keeps values for the same view and clears them when the connected type changes", () => {
  const onChange = vi.fn();
  const render = (schema: z.core.$ZodType | undefined, value: unknown) =>
    act(() =>
      root.render(
        <SchemaInput
          schema={schema}
          value={value}
          onChange={onChange}
          label="value"
        />,
      ),
    );

  render(z.number(), 7);
  render(z.coerce.number(), 7);
  expect(onChange).not.toHaveBeenCalled();
  render(z.boolean(), 7);
  expect(container.querySelector("select")?.value).toBe("");
  expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
  render(z.boolean(), false);
  render(undefined, false);
  expect(container.querySelector("input")?.disabled).toBe(true);
  render(z.coerce.boolean(), false);
  expect(container.querySelector("select")?.value).toBe("false");
  expect(onChange).toHaveBeenCalledTimes(1);
});

test("string view retains text and empty strings", () => {
  const onChange = vi.fn();
  act(() =>
    root.render(
      <SchemaInput
        schema={z.string()}
        value="old"
        onChange={onChange}
        label="value"
      />,
    ),
  );
  typeInput("007");
  expect(onChange).toHaveBeenLastCalledWith("007");
  typeInput("");
  expect(onChange).toHaveBeenLastCalledWith("");
});
