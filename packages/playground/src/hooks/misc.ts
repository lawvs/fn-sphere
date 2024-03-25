import { TDesignComponentsLibForReact } from "@zodui/components-lib-tdesign/react";
import { Context } from "@zodui/core";
import { CommonPluginForReact } from "@zodui/plugin-common";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
} from "react";

export const useZodUI = () => {
  // Register the component library plugin
  // In React, using this method to install the plugin is beneficial to the hot loading process
  useEffect(() => {
    const e0 = Context.global.use(TDesignComponentsLibForReact);
    const e1 = Context.global.use(CommonPluginForReact);
    return () => {
      e0();
      e1();
    };
  }, []);
};

const noop = () => {};
/** @see https://foxact.skk.moe/context-state */
export function createContextState<T>(initialState: T) {
  const StateContext = createContext<T>(initialState);
  const DispatchContext =
    createContext<React.Dispatch<React.SetStateAction<T>>>(noop);

  const useValue = () => useContext(StateContext);
  const useSetValue = () => useContext(DispatchContext);

  const Provider = ({ children }: React.PropsWithChildren) => {
    const [value, setValue] = useState(initialState);
    return createElement(
      StateContext.Provider,
      { value },
      createElement(DispatchContext.Provider, { value: setValue }, children),
    );
  };

  return [
    Provider,
    useValue,
    useSetValue,
    /** Exports the context that holds the value, which allows you to use `React.use(Context)` */
    StateContext,
  ] as const;
}
