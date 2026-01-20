import { WidgetRuntimeProps } from '@widget-runtime';

export type SettingsTogglesWidgetProps = WidgetRuntimeProps & {
  open: boolean;
  useVector: boolean;
  onChange: (val: boolean) => void;
  onClose: () => void;
};
