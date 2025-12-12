import React from 'react';

type WidgetErrorFallbackProps = {
  widgetId: string;
  message?: string;
};

export const WidgetErrorFallback: React.FC<WidgetErrorFallbackProps> = ({ widgetId, message }) => (
  <div
    style={{
      padding: '16px',
      border: '1px solid #d32f2f',
      borderRadius: '4px',
      color: '#d32f2f',
      margin: '8px 0',
      fontSize: '0.95rem',
    }}
  >
    Widget "{widgetId}" {message ?? 'failed to load'}
  </div>
);
