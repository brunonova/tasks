import { addMessages, init, getLocaleFromNavigator } from 'svelte-intl-precompile';
import App from './App.svelte';
import en from './locales/en';
import pt from './locales/pt';

addMessages("en", en);
addMessages("pt", pt);

init({
	fallbackLocale: "en",
	initialLocale: getLocaleFromNavigator(),
});

const app = new App({
    target: document.body,
});

export default app;