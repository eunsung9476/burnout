declare module "plotly.js-dist-min" {
  export function react(
    el: HTMLElement,
    data: unknown,
    layout?: unknown,
    config?: unknown,
  ): Promise<void>;
  export function purge(el: HTMLElement): void;
  export function newPlot(
    el: HTMLElement,
    data: unknown,
    layout?: unknown,
    config?: unknown,
  ): Promise<void>;
}
