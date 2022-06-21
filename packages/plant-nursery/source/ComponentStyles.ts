import { css } from "lit";

export const Typography = [
  css`
    a {
      color: var(--sl-color-primary-600);
    }
  `,
];

export const Forms = [
  css`
    .input-group {
      display: flex;
      align-items: flex-end;
    }

    .input-group sl-input::part(base) {
      border-right: none;
      border-radius: 0;
    }

    .input-group sl-input:first-of-type::part(base) {
      border-top-left-radius: var(--sl-input-border-radius-medium);
      border-bottom-left-radius: var(--sl-input-border-radius-medium);
    }

    .input-group sl-input:last-of-type::part(base) {
      border-right: solid 1px var(--sl-input-border-color);
      border-top-right-radius: var(--sl-input-border-radius-medium);
      border-bottom-right-radius: var(--sl-input-border-radius-medium);
    }

    .input-group sl-input:focus-within::part(base) {
      /* Keep the focus ring above */
      z-index: 1;
    }
  `,
];
