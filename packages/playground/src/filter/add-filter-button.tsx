import type { FilterField } from "@fn-sphere/core";
import { useState } from "react";
import { Button, Popup, Select } from "tdesign-react";
import { useClickAway } from "./hooks";

export function AddFilterButton({
  fields,
  onAddFilter,
}: {
  fields: FilterField[];
  onAddFilter: (value: FilterField | undefined) => void;
}) {
  const [showPopup, setShowPopup] = useState(false);
  useClickAway(() => {
    setShowPopup(false);
  });

  // For debug
  console.log("Available fields", fields);

  return (
    <Popup
      content={
        <Select
          autoWidth
          popupVisible={showPopup}
          value={""}
          options={[
            ...fields.map((field, i) => ({
              label:
                field.fieldSchema.description || field.path || `Unknown ${i}`,
              value: field,
            })),
            // { label: "Add filter", value: "1" },
            {
              label: "Add filter group",
            },
          ]}
          onChange={(v) => {
            setShowPopup(false);
            onAddFilter(v as FilterField | undefined);
          }}
        ></Select>
      }
      placement="bottom-left"
      visible={showPopup}
      overlayStyle={{
        visibility: "hidden",
        margin: "-50px",
      }}
    >
      <Button onClick={() => setShowPopup(!showPopup)}>Add Filter</Button>
    </Popup>
  );
}
