import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

export const themePreference = persistentAtom<Theme>('theme-preference', 'system');

export const systemTheme = atom<'light' | 'dark'>(
	typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light'
);

if (browser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const updateSystemTheme = () => systemTheme.set(mediaQuery.matches ? 'dark' : 'light');
	mediaQuery.addEventListener('change', updateSystemTheme);
	updateSystemTheme();
}

export const theme = computed([themePreference, systemTheme], (preference, system) =>
	preference === 'system' ? system : preference
);

export const setTheme = (newTheme: Theme) => themePreference.set(newTheme);

export const toggleTheme = () => {
	setTheme(theme.get() === 'light' ? 'dark' : 'light');
};

export const cycleTheme = () => {
	const modes: Theme[] = ['light', 'dark', 'system'];
	const next = modes[(modes.indexOf(themePreference.get()) + 1) % modes.length];
	setTheme(next);
};

export const isDark = computed([theme], (t) => t === 'dark');

theme.listen((t) => {
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.theme = t;
		document.documentElement.classList.toggle('dark', t === 'dark');
	}
});
