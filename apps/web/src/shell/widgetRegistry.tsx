import React from 'react';
import { WidgetErrorFallback } from './WidgetErrorFallback';

const loadWidget = <T extends React.ComponentType<any>>(
  widgetId: string,
  loader: () => Promise<{ default: T }>,
) =>
  React.lazy(() =>
    loader().catch((error) => {
      console.error(`Failed to load widget "${widgetId}":`, error);
      return { default: (() => <WidgetErrorFallback widgetId={widgetId} />) as T };
    }),
  );

const AlertsCenterWidget = loadWidget('alerts-center', () => import('@widgets/alerts-center'));
const AlertEditorWidget = loadWidget('alert-editor', () => import('@widgets/alert-editor'));
const ServiceStatusWidget = loadWidget('service-status', () => import('@widgets/service-status'));
const AuthGateWidget = loadWidget('auth-gate', () => import('@widgets/auth-gate'));
const AccountSettingsWidget = loadWidget('account-settings', () => import('@widgets/account-settings'));
const CatalogSearchWidget = loadWidget('catalog-search', () => import('@widgets/catalog-search'));
const TopNavWidget = loadWidget('top-nav', () => import('@widgets/top-nav'));
const AccountMenuWidget = loadWidget('account-menu', () => import('@widgets/account-menu'));

export type WidgetId =
  | 'alerts-center'
  | 'alert-editor'
  | 'service-status'
  | 'auth-gate'
  | 'account-settings'
  | 'catalog-search'
  | 'top-nav'
  | 'account-menu';

export type WidgetComponent<Props = any> = React.ComponentType<Props>;

export type AlertsCenterWidgetProps = React.ComponentProps<typeof AlertsCenterWidget>;
export type AlertEditorWidgetProps = React.ComponentProps<typeof AlertEditorWidget>;
export type ServiceStatusWidgetProps = React.ComponentProps<typeof ServiceStatusWidget>;
export type AuthGateWidgetProps = React.ComponentProps<typeof AuthGateWidget>;
export type AccountSettingsWidgetProps = React.ComponentProps<typeof AccountSettingsWidget>;
export type CatalogSearchWidgetProps = React.ComponentProps<typeof CatalogSearchWidget>;
export type TopNavWidgetProps = React.ComponentProps<typeof TopNavWidget>;
export type AccountMenuWidgetProps = React.ComponentProps<typeof AccountMenuWidget>;

export const widgetRegistry = {
  'alerts-center': AlertsCenterWidget,
  'alert-editor': AlertEditorWidget,
  'service-status': ServiceStatusWidget,
  'auth-gate': AuthGateWidget,
  'account-settings': AccountSettingsWidget,
  'catalog-search': CatalogSearchWidget,
  'top-nav': TopNavWidget,
  'account-menu': AccountMenuWidget,
} as const satisfies Record<WidgetId, WidgetComponent>;
