import { css } from "lit";

export const buttonStyles = css`
  button {
    margin: 0;
    overflow: visible;
    font-family: inherit;
    text-transform: none;
  }

  button,
  [type="button"],
  [type="reset"],
  [type="submit"] {
    -webkit-appearance: button;
  }

  button {
    display: block;
    width: 100%;
    margin-bottom: var(--spacing);
  }

  [role="button"] {
    display: inline-block;
    text-decoration: none;
  }

  button,
  input[type="submit"],
  input[type="button"],
  input[type="reset"],
  [role="button"] {
    --background-color: var(--primary);
    --border-color: var(--primary);
    --color: var(--primary-inverse);
    --box-shadow: var(--button-box-shadow, 0 0 0 rgba(0, 0, 0, 0));
    padding: var(--form-element-spacing-vertical) var(--form-element-spacing-horizontal);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    outline: none;
    background-color: var(--background-color);
    box-shadow: var(--box-shadow);
    color: var(--color);
    font-weight: var(--font-weight);
    font-size: 1rem;
    line-height: var(--line-height);
    text-align: center;
    cursor: pointer;
    transition: background-color var(--transition), border-color var(--transition),
      color var(--transition), box-shadow var(--transition);
  }
  button:is([aria-current], :hover, :active, :focus),
  input[type="submit"]:is([aria-current], :hover, :active, :focus),
  input[type="button"]:is([aria-current], :hover, :active, :focus),
  input[type="reset"]:is([aria-current], :hover, :active, :focus),
  [role="button"]:is([aria-current], :hover, :active, :focus) {
    --background-color: var(--primary-hover);
    --border-color: var(--primary-hover);
    --box-shadow: var(--button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0));
    --color: var(--primary-inverse);
  }
  button:focus,
  input[type="submit"]:focus,
  input[type="button"]:focus,
  input[type="reset"]:focus,
  [role="button"]:focus {
    --box-shadow: var(--button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),
      0 0 0 var(--outline-width) var(--primary-focus);
  }

  :is(button, input[type="submit"], input[type="button"], [role="button"]).secondary,
  input[type="reset"] {
    --background-color: var(--secondary);
    --border-color: var(--secondary);
    --color: var(--secondary-inverse);
    cursor: pointer;
  }
  :is(button, input[type="submit"], input[type="button"], [role="button"]).secondary:is([aria-current], :hover, :active, :focus),
  input[type="reset"]:is([aria-current], :hover, :active, :focus) {
    --background-color: var(--secondary-hover);
    --border-color: var(--secondary-hover);
    --color: var(--secondary-inverse);
  }
  :is(button, input[type="submit"], input[type="button"], [role="button"]).secondary:focus,
  input[type="reset"]:focus {
    --box-shadow: var(--button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),
      0 0 0 var(--outline-width) var(--secondary-focus);
  }

  :is(button, input[type="submit"], input[type="button"], [role="button"]).contrast {
    --background-color: var(--contrast);
    --border-color: var(--contrast);
    --color: var(--contrast-inverse);
  }
  :is(button, input[type="submit"], input[type="button"], [role="button"]).contrast:is([aria-current], :hover, :active, :focus) {
    --background-color: var(--contrast-hover);
    --border-color: var(--contrast-hover);
    --color: var(--contrast-inverse);
  }
  :is(button, input[type="submit"], input[type="button"], [role="button"]).contrast:focus {
    --box-shadow: var(--button-hover-box-shadow, 0 0 0 rgba(0, 0, 0, 0)),
      0 0 0 var(--outline-width) var(--contrast-focus);
  }

  :is(button, input[type="submit"], input[type="button"], [role="button"]).outline,
  input[type="reset"].outline {
    --background-color: transparent;
    --color: var(--primary);
  }
  :is(button, input[type="submit"], input[type="button"], [role="button"]).outline:is([aria-current], :hover, :active, :focus),
  input[type="reset"].outline:is([aria-current], :hover, :active, :focus) {
    --background-color: transparent;
    --color: var(--primary-hover);
  }

  :is(button, input[type="submit"], input[type="button"], [role="button"]).outline.secondary,
  input[type="reset"].outline {
    --color: var(--secondary);
  }
  :is(button, input[type="submit"], input[type="button"], [role="button"]).outline.secondary:is([aria-current], :hover, :active, :focus),
  input[type="reset"].outline:is([aria-current], :hover, :active, :focus) {
    --color: var(--secondary-hover);
  }

  :is(button, input[type="submit"], input[type="button"], [role="button"]).outline.contrast {
    --color: var(--contrast);
  }
  :is(button, input[type="submit"], input[type="button"], [role="button"]).outline.contrast:is([aria-current], :hover, :active, :focus) {
    --color: var(--contrast-hover);
  }

  :where(button, [type="submit"], [type="button"], [type="reset"], [role="button"])[disabled],
  :where(fieldset[disabled])
    :is(button, [type="submit"], [type="button"], [type="reset"], [role="button"]),
  a[role="button"]:not([href]) {
    opacity: 0.5;
    pointer-events: none;
  }
`;
