export type ShellNavigationCommand =
  | string
  | {
      to: string;
      replace?: boolean;
      state?: Record<string, unknown>;
    };

export type ShellApi = {
  navigate?: (command: ShellNavigationCommand) => void;
  openWidget?: (widgetId: string, payload?: Record<string, unknown>) => void;
  closeWidget?: (widgetId: string, payload?: Record<string, unknown>) => void;
  trackEvent?: (eventName: string, payload?: Record<string, unknown>) => void;
};

export type WidgetRuntimeProps = {
  widgetId?: string;
  shellApi?: ShellApi;
};

export const createShellApi = (api?: ShellApi): ShellApi => ({
  navigate: api?.navigate,
  openWidget: api?.openWidget,
  closeWidget: api?.closeWidget,
  trackEvent: api?.trackEvent,
});
