import React from 'react';

const loadWidget = <T extends React.ComponentType<any>>(widgetId: string, devLoader: () => Promise<{ default: T }>) => {
  return React.lazy(() => (import.meta.env.DEV ? devLoader() : import(/* @vite-ignore */ `/widgets/${widgetId}.js`)));
};

const AlertsCenterWidget = loadWidget('alerts-center', () => import('@widgets/alerts-center'));
const AlertEditorWidget = loadWidget('alert-editor', () => import('@widgets/alert-editor'));
const ServiceStatusWidget = loadWidget('service-status', () => import('@widgets/service-status'));
const SettingsTogglesWidget = loadWidget('settings-toggles', () => import('@widgets/settings-toggles'));
const AuthGateWidget = loadWidget('auth-gate', () => import('@widgets/auth-gate'));
const AccountSettingsWidget = loadWidget('account-settings', () => import('@widgets/account-settings'));
const CatalogSearchWidget = loadWidget('catalog-search', () => import('@widgets/catalog-search'));

export type WidgetId =
  | 'alerts-center'
  | 'alert-editor'
  | 'service-status'
  | 'settings-toggles'
  | 'auth-gate'
  | 'account-settings'
  | 'catalog-search';

export type WidgetComponent<Props = any> = React.ComponentType<Props>;

export type AlertsCenterWidgetProps = React.ComponentProps<typeof AlertsCenterWidget>;
export type AlertEditorWidgetProps = React.ComponentProps<typeof AlertEditorWidget>;
export type ServiceStatusWidgetProps = React.ComponentProps<typeof ServiceStatusWidget>;
export type SettingsTogglesWidgetProps = React.ComponentProps<typeof SettingsTogglesWidget>;
export type AuthGateWidgetProps = React.ComponentProps<typeof AuthGateWidget>;
export type AccountSettingsWidgetProps = React.ComponentProps<typeof AccountSettingsWidget>;
export type CatalogSearchWidgetProps = React.ComponentProps<typeof CatalogSearchWidget>;

export const widgetRegistry = {
  'alerts-center': AlertsCenterWidget,
  'alert-editor': AlertEditorWidget,
  'service-status': ServiceStatusWidget,
  'settings-toggles': SettingsTogglesWidget,
  'auth-gate': AuthGateWidget,
  'account-settings': AccountSettingsWidget,
  'catalog-search': CatalogSearchWidget,
} as const satisfies Record<WidgetId, WidgetComponent>;
