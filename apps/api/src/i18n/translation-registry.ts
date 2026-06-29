export const SUPPORTED_LOCALES = ["en", "fil"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type TranslationRegistryEntry = {
  key: string;
  label: string;
  defaultValue: Record<SupportedLocale, string>;
};

export const translationRegistry = [
  {
    key: "nav.login",
    label: "Top bar login link",
    defaultValue: { en: "Log In", fil: "Mag-login" }
  },
  {
    key: "nav.register",
    label: "Top bar register link",
    defaultValue: { en: "Sign Up", fil: "Mag-sign up" }
  },
  {
    key: "nav.language",
    label: "Language switch label",
    defaultValue: { en: "Language", fil: "Wika" }
  },
  {
    key: "landing.navLabels.marketplace",
    label: "Landing navigation marketplace",
    defaultValue: { en: "Marketplace", fil: "Pamilihan" }
  },
  {
    key: "landing.navLabels.farmers",
    label: "Landing navigation farmers",
    defaultValue: { en: "Farmers", fil: "Magsasaka" }
  },
  {
    key: "landing.navLabels.recipes",
    label: "Landing navigation recipes",
    defaultValue: { en: "Recipes", fil: "Mga Recipe" }
  },
  {
    key: "landing.navLabels.forecast",
    label: "Landing navigation forecast",
    defaultValue: { en: "Forecast", fil: "Pagtataya" }
  },
  {
    key: "landing.navLabels.explorePasig",
    label: "Landing navigation Explore Pasig",
    defaultValue: { en: "Explore Pasig", fil: "Tuklasin ang Pasig" }
  },
  {
    key: "login.title",
    label: "Login page title",
    defaultValue: { en: "Welcome back", fil: "Maligayang pagbabalik" }
  },
  {
    key: "login.subtitle",
    label: "Login page subtitle",
    defaultValue: {
      en: "Log in to shop or manage your farm store.",
      fil: "Mag-login para mamili o pamahalaan ang inyong tindahan."
    }
  },
  {
    key: "login.submit",
    label: "Login button",
    defaultValue: { en: "Log In", fil: "Mag-login" }
  },
  {
    key: "register.title",
    label: "Register page title",
    defaultValue: { en: "Join AgriFarm", fil: "Sumali sa AgriFarm" }
  },
  {
    key: "register.submit",
    label: "Register button",
    defaultValue: { en: "Sign Up Free", fil: "Mag-sign Up nang Libre" }
  }
] as const satisfies TranslationRegistryEntry[];

export const editableTranslationKeys: ReadonlySet<string> = new Set(translationRegistry.map((entry) => entry.key));

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
