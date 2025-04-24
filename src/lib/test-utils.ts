import { renderHook as originalRenderHook } from "@testing-library/react";
import type { RenderHookOptions } from "@testing-library/react";

// Własna wersja renderHook, która może być dostosowana
export function renderHook<Result, Props>(
  callback: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, "wrapper">
) {
  return originalRenderHook(callback, options);
}

// Reeksportujemy wszystko z testing-library
export { act, waitFor } from "@testing-library/react";
