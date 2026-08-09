import {
  createFilterGroup,
  createSingleFilter,
  type FnSchema,
  presetFilter,
} from "@fn-sphere/filter";
import { z } from "zod";

const team = z.union([
  z.literal("Design").describe("Design"),
  z.literal("IT").describe("IT"),
  z.literal("Research").describe("Research"),
  z.literal("Operations").describe("Operations"),
]);

const position = z.union([
  z.literal("Director").describe("Director"),
  z.literal("Manager").describe("Manager"),
  z.literal("Lead").describe("Lead"),
  z.literal("Contributor").describe("Contributor"),
]);

const department = z.union([
  z.literal("Management").describe("Management"),
  z.literal("Product").describe("Product"),
  z.literal("Engineering").describe("Engineering"),
  z.literal("People").describe("People"),
]);

export const workflowSchema = z
  .object({
    team: team.describe("Team"),
    position: position.describe("Position"),
    department: department.describe("Department"),
  })
  .describe("New hire");

export const workflowFilterList: FnSchema[] = presetFilter;

export const createWorkflowDefaultRule = () =>
  createFilterGroup({
    op: "and",
    conditions: [
      createSingleFilter({
        path: ["team"],
        name: "contains",
        args: [["Design", "IT", "Research"]],
      }),
      createFilterGroup({
        op: "or",
        conditions: [
          createSingleFilter({
            path: ["position"],
            name: "contains",
            args: [["Director", "Manager"]],
          }),
          createSingleFilter({
            path: ["department"],
            name: "notEqual",
            args: ["Management"],
          }),
        ],
      }),
    ],
  });

export const workflowFilterLabels: Record<string, string> = {
  contains: "is any of",
  equals: "is",
  notContains: "is none of",
  notEqual: "is not",
};
