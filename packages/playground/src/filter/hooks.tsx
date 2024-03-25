import { useEffect } from "react";

// Poor man's click away listener
export const useClickAway = (callback: () => void) => {
  useEffect(() => {
    const abortController = new AbortController();
    window.addEventListener(
      "pointerdown",
      () => {
        callback();
      },
      {
        signal: abortController.signal,
      },
    );
    return () => {
      abortController.abort();
    };
  });
};
