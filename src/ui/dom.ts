type Attrs = Record<string, string | number | boolean | EventListener | undefined>;
type Child = Node | string | null | undefined | false;

/** Tiny element helper: h('button', { class: 'x', onclick: fn }, 'Text'). */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: (Child | Child[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), value);
    } else if (key === 'value' && 'value' in el) {
      (el as HTMLInputElement).value = String(value);
    } else if (key === 'checked') {
      (el as HTMLInputElement).checked = Boolean(value);
    } else {
      el.setAttribute(key, value === true ? '' : String(value));
    }
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child);
  }
  return el;
}

/** Replace an element's children, skipping null/false entries. */
export function fill(el: HTMLElement, ...children: Child[]): void {
  el.replaceChildren(...(children.filter((c) => c !== null && c !== undefined && c !== false) as (Node | string)[]));
}
