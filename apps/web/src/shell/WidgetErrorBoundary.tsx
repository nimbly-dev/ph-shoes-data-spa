import React from 'react';
import { WidgetErrorFallback } from './WidgetErrorFallback';

type WidgetErrorBoundaryProps = {
  widgetId: string;
  children: React.ReactNode;
  resetKey?: string | number | boolean | null;
};

type WidgetErrorBoundaryState = {
  hasError: boolean;
};

export class WidgetErrorBoundary extends React.Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  state: WidgetErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WidgetErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`Widget "${this.props.widgetId}" crashed:`, error, info);
  }

  componentDidUpdate(prevProps: WidgetErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <WidgetErrorFallback widgetId={this.props.widgetId} message="encountered an error" />;
    }
    return this.props.children;
  }
}
