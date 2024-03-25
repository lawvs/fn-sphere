import { Table, Space, Tag, type PrimaryTableCol } from "tdesign-react";
import {
  CheckCircleFilledIcon,
  CloseCircleFilledIcon,
} from "tdesign-icons-react";
import type { PresetData } from "./presets";

const statusNameListMap = {
  0: { label: "Fail", theme: "danger", icon: <CloseCircleFilledIcon /> },
  1: { label: "Success", theme: "success", icon: <CheckCircleFilledIcon /> },
} as const;

const tableColumns = [
  { colKey: "id", title: "ID" },
  { colKey: "name", title: "Name", width: "150" },
  { colKey: "gender", title: "Gender", width: "100" },
  { colKey: "age", title: "Age" },
  { colKey: "detail.email", title: "Email", ellipsis: true },
  {
    colKey: "status",
    title: "Status",
    cell: ({ row }) => {
      const statusData = statusNameListMap[row.status ? 1 : 0];
      return (
        <Tag
          shape="round"
          theme={statusData.theme}
          variant="light-outline"
          icon={statusData.icon}
        >
          {statusData.label}
        </Tag>
      );
    },
    width: "100",
  },
] satisfies PrimaryTableCol<PresetData>[];

export const DataTable = ({ data }: { data: PresetData[] }) => {
  return (
    <Space direction="vertical">
      <Table
        data={data}
        columns={tableColumns}
        rowKey="index"
        verticalAlign="top"
        size="small"
        hover
        stripe
        showHeader
        tableLayout="auto"
        // tableLayout="fixed"
        rowClassName={({ rowIndex }) => `${rowIndex}-class`}
        cellEmptyContent={"-"}
        bordered
        onRowClick={({ row, index, e }) => {
          console.log("onRowClick", { row, index, e });
        }}
      />
    </Space>
  );
};
