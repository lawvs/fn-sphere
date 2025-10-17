import { type ComponentPropsWithRef } from "react";

import { cn } from "../../../mocks";

interface LabelProperties extends ComponentPropsWithRef<"label"> {
  className?: string;
}

export default function Label(properties: Readonly<LabelProperties>) {
  const { className, children, ref, ...others } = properties;

  return (
    <label
      {...others}
      ref={ref}
      className={cn("block text-xs font-bold", className)}
    >
      {children}
    </label>
  );
}
