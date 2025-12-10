import React from 'react';

const WidgetErrorFallback: React.FC<{ widgetId: string }> = ({ widgetId }) => (
  <div style={{ padding: '16px', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '4px', margin: '8px' }}>
    Widget "{widgetId}" failed to load
  </div>
);

const loadWidget = <T extends React.ComponentType<any>>(widgetId: string, devLoader: () => Promise<{ default: T }>) => {
  // Always use dev loader to avoid React conflicts from bundled widgets
  return React.lazy(() => 
    devLoader()
      .catch((error) => {
        console.error(`Failed to load widget "${widgetId}":`, error);
        return { default: (() => <WidgetErrorFallback widgetId={widgetId} />) as T };
      })
  );
};

const AlertsCenterWidget = loadWidget('alerts-center', () => import('@widgets/alerts-center'));
const AlertEditorWidget = loadWidget('alert-editor', () => import('@widgets/alert-editor'));
const ServiceStatusWidget = loadWidget('service-status', () => import('@widgets/service-status'));
const AuthGateWidget = loadWidget('auth-gate', () => import('@widgets/auth-gate'));
const AccountSettingsWidget = loadWidget('account-settings', () => import('@widgets/account-settings'));
const CatalogSearchWidget = loadWidget('catalog-search', () => import('@widgets/catalog-search'));

export type WidgetId =
  | 'alerts-center'
  | 'alert-editor'
  | 'service-status'
  | 'auth-gate'
  | 'account-settings'
  | 'catalog-search';

export type WidgetComponent<Props = any> = React.ComponentType<Props>;

export type AlertsCenterWidgetProps = React.ComponentProps<typeof AlertsCenterWidget>;
export type AlertEditorWidgetProps = React.ComponentProps<typeof AlertEditorWidget>;
export type ServiceStatusWidgetProps = React.ComponentProps<typeof ServiceStatusWidget>;
export type AuthGateWidgetProps = React.ComponentProps<typeof AuthGateWidget>;
export type AccountSettingsWidgetProps = React.ComponentProps<typeof AccountSettingsWidget>;
export type CatalogSearchWidgetProps = React.ComponentProps<typeof CatalogSearchWidget>;

export const widgetRegistry = {
  'alerts-center': AlertsCenterWidget,
  'alert-editor': AlertEditorWidget,
  'service-status': ServiceStatusWidget,
  'auth-gate': AuthGateWidget,
  'account-settings': AccountSettingsWidget,
  'catalog-search': CatalogSearchWidget,
} as const satisfies Record<WidgetId, WidgetComponent>;
