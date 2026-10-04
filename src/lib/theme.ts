/** Stored choice: "light" or "dark". Without one, the site follows the system setting. */
export const THEME_KEY = 'cuesetter-theme';

/**
 * Runs in <head> before the page paints, so a chosen theme never flashes the other one first.
 * Kept as a string so it can be inlined; it must stay tiny and must not throw.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
