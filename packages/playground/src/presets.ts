import { z } from "zod";
import {
  commonFilters,
  defineTypedFn,
  genericFilter,
  type FnSchema,
  type GenericFnSchema,
} from "fn-sphere";
import { genFakeName, sample, genId } from "./utils";

export const presetSchema = z
  .object({
    id: z.number().describe("ID"),
    name: z.string().describe("Name"),
    age: z.number().describe("Age"),
    status: z.boolean().describe("Status"),
    gender: z
      .union([z.literal("male"), z.literal("female"), z.literal("other")])
      .describe("Gender"),
    detail: z.object({
      email: z.string().email().describe("Email"),
      birthday: z.date().describe("Birthday"),
    }),
  })
  .describe("User");

export type PresetData = z.infer<typeof presetSchema>;

export const dataFilters: (FnSchema | GenericFnSchema)[] = [
  ...genericFilter,
  ...commonFilters,
  defineTypedFn({
    name: "Luck User",
    define: z.function().args(presetSchema).returns(z.boolean()),
    implement: (value) => {
      return value.id < 10 && Math.random() > 0.5;
    },
  }),
];

export const genSampleData = (total = 28) => {
  const sampleData: PresetData[] = [];
  for (let i = 0; i < total; i++) {
    const age = Math.abs(Math.floor(Math.random() * 100) - 20);
    const birthday = new Date(new Date().getFullYear() - age, 0, 1);
    sampleData.push({
      id: i + 1,
      name: genFakeName(),
      age,
      gender:
        Math.random() < 0.05 ? "other" : sample(["male", "female"] as const),
      status: sample([false, true] as const),
      detail: {
        email: genId() + "@" + sample(["gmail.com", "qq.com", "apple.com"]),
        birthday,
      },
    });
  }
  return sampleData;
};
