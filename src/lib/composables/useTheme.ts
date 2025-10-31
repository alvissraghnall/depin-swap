import { theme, themePreference, setTheme, toggleTheme, cycleTheme, isDark } from '$lib/stores/theme';
import { computed } from 'nanostores';

export { theme, themePreference, isDark };

export const isLight = computed(isDark, (dark) => !dark);
export const isSystem = computed(themePreference, (pref) => pref === 'system');

export const currentTheme = computed(theme, ($t) => $t);
export const currentPreference = computed(themePreference, ($p) => $p);

export { setTheme, toggleTheme, cycleTheme };

export const applyTheme = (element: HTMLElement, themeValue: 'light' | 'dark'): void => {
  const opposite = themeValue === 'dark' ? 'light' : 'dark';
  element.classList.add(themeValue);
  element.classList.remove(opposite);
  element.style.colorScheme = themeValue;
};

export const initializeTheme = (): void => {
  if (typeof window === 'undefined') return;

  const storageKey = 'theme-preference';
  const stored = localStorage.getItem(storageKey) as 'light' | 'dark' | 'system' | null;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const effectiveDark = stored === 'dark' || (stored === 'system' && systemDark.matches) || (!stored && systemDark.matches);

  applyTheme(document.documentElement, effectiveDark ? 'dark' : 'light');

  if (stored === 'system' || !stored) {
    systemDark.addEventListener('change', (e) => {
      applyTheme(document.documentElement, e.matches ? 'dark' : 'light');
    });
  }
};
