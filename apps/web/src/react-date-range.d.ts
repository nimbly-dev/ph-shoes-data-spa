declare module 'react-date-range' {
  import * as React from 'react';
  import { CSSProperties } from 'react';

  export interface Range {
    startDate: Date;
    endDate: Date;
    key: string;
  }

  export interface DateRangeProps {
    ranges: Range[];
    onChange: (ranges: { [K in string]: Range }) => void;
    showSelectionPreview?: boolean;
    moveRangeOnFirstSelection?: boolean;
    retainEndDateOnFirstSelection?: boolean;
    months?: number;
    direction?: 'horizontal' | 'vertical';
    className?: string;
    style?: CSSProperties;
  }

  export const DateRange: React.FC<DateRangeProps>;
}
