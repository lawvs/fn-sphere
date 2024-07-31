import { forwardRef } from "react";
import { useView } from "../specs/index.js";

export const DataInputPlaceholder = forwardRef<HTMLInputElement>((_, ref) => {
  const { Input: InputView } = useView("components");
  return <InputView ref={ref} disabled />;
});
