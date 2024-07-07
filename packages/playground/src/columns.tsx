import "@zodui/react/index.css";
import "@zodui/components-lib-tdesign/react.css";

import { List } from "@zodui/react";
import { useState } from "react";
import z from "zod";
// import nz from "@zodui/core/external";
import { Input, Select } from "tdesign-react";
import { presetSchema } from "./presets";

const DefineSchema = () => {
  const [value] = useState("");
  const onChange = () => {
    // setValue(value);
  };
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <Input placeholder="Label"></Input>
      <Select
        value={value}
        onChange={onChange}
        style={{ width: "40%" }}
        placeholder="Type"
        options={[
          { label: "Number", value: z.number() },
          {
            label: "Text",
            value: z.string(),
          },
          {
            label: "Boolean",
            value: z.boolean(),
          },
          {
            label: "Select",
            value: z.enum(["Tag1", "Tag2", "Tag3"]),
          },
        ]}
      ></Select>
    </div>
  );
};

export const Column = () => {
  const [schema] = useState(presetSchema);

  return (
    <div style={{ width: 400 }}>
      <DefineSchema />
      <List
        model={schema.omit({ id: true })}
        onChange={(v) => console.log(v)}
      />
    </div>
  );
};
