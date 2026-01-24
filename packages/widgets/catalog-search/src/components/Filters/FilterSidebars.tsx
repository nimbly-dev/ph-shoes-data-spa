import * as React from 'react';
import {
  Box, Stack, Button, Divider, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { UIProductFilters } from '@commons/types/UIProductFilters';

import { BrandSelect }    from './sections/BrandSelect';
import { GenderSelect }   from './sections/GenderSelect';
import { SizeChips }      from './sections/SizeChips';
import { PriceRange }     from './sections/PriceRange';
import { DateRangeField } from './sections/DateRangeField';
import { KeywordField }   from './sections/KeywordField';
import { OnSaleToggle }   from './sections/OnSaleToggle';

import CollapsibleSection from './CollapsibleSection';

type Props = {
  draft: UIProductFilters;
  onDraftChange: (next: UIProductFilters) => void;
  onApply?: () => void;
  onReset?: () => void;
};

export function FilterSidebars({ draft, onDraftChange, onApply, onReset }: Props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const patch = (p: Partial<UIProductFilters>) => onDraftChange({ ...draft, ...p });

  // --- summaries (shown in section headers)
  const brandSum   = draft.brand ?? 'All';
  const genderSum  = draft.gender ?? 'All';
  const sizesSum   = draft.sizes?.length ? `${draft.sizes.length} selected` : 'Any';
  const priceSum   = (draft.minPrice || draft.maxPrice)
    ? `₱${(draft.minPrice ?? 0).toLocaleString()}–₱${(draft.maxPrice ?? 20000).toLocaleString()}`
    : undefined;
  const dateSum    = (draft.startDate && draft.endDate) ? `${draft.startDate} → ${draft.endDate}` : undefined;
  const keywordSum = draft.keyword;
  const saleSum    = draft.onSale ? 'On sale' : undefined;

  // --- “active” flags (used to auto-open)
  const hasBrand   = !!draft.brand && draft.brand !== 'All';
  const hasGender  = !!draft.gender;
  const hasSizes   = !!draft.sizes?.length;
  const hasPrice   = draft.minPrice != null || draft.maxPrice != null;
  const hasDate    = !!draft.startDate && !!draft.endDate;
  const hasKeyword = !!draft.keyword && draft.keyword.trim() !== '';
  const hasSale    = !!draft.onSale;

  // Strategy:
  // - Desktop: open Size & Price by default; others start closed unless active.
  // - Mobile (drawer): all closed unless active (keeps scrolling short).
  const openSizeDefault  = isDesktop ? true : hasSizes;
  const openPriceDefault = isDesktop ? true : hasPrice;

  return (
    <Box
      sx={{
        width: 1,
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'auto',
        pr: 0.5,
      }}
    >

      <Stack spacing={1.25}>
        {/* Brand — closed by default unless active */}
        <CollapsibleSection title="Brand" summary={brandSum} defaultOpen={hasBrand} collapsible={false}>
          <BrandSelect value={draft.brand} onChange={(brand) => patch({ brand })} />
        </CollapsibleSection>

        {/* Gender — closed by default unless active */}
        <CollapsibleSection title="Gender" summary={genderSum} defaultOpen={hasGender} collapsible={false}>
          <GenderSelect value={draft.gender} onChange={(gender) => patch({ gender })} />
        </CollapsibleSection>

        {/* Size — open on desktop by default; otherwise only if active */}
        <CollapsibleSection title="Size (US)" summary={sizesSum} defaultOpen={openSizeDefault} collapsible={false}>
          <SizeChips columns={6} value={draft.sizes} onChange={(sizes) => patch({ sizes })} />
        </CollapsibleSection>

        {/* Price — open on desktop by default; otherwise only if active */}
        <CollapsibleSection title="Price" summary={priceSum} defaultOpen={openPriceDefault} collapsible={false}>
          <PriceRange
            value={{ min: draft.minPrice, max: draft.maxPrice }}
            onChange={({ min, max }) => patch({ minPrice: min, maxPrice: max })}
          />
        </CollapsibleSection>

        {/* Collected Date — closed by default unless active */}
        <CollapsibleSection title="Collected Date" summary={dateSum} defaultOpen={hasDate} collapsible={false}>
          <DateRangeField
            startDate={draft.startDate}
            endDate={draft.endDate}
            onChange={(startDate, endDate) => patch({ startDate, endDate, date: undefined })}
          />
        </CollapsibleSection>

        {/* Keyword — closed by default unless active */}
        <CollapsibleSection title="Keyword" summary={keywordSum} defaultOpen={hasKeyword} collapsible={false}>
          <KeywordField value={draft.keyword} onChange={(keyword) => patch({ keyword })} />
        </CollapsibleSection>

        {/* Sale — closed by default unless active */}
        <CollapsibleSection title="Sale" summary={saleSum} defaultOpen={hasSale} collapsible={false}>
          <OnSaleToggle checked={!!draft.onSale} onChange={(onSale) => patch({ onSale })} />
        </CollapsibleSection>
      </Stack>

      {(onApply || onReset) && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            pt: 1.5,
            mt: 1.5,
            background: (t) =>
              `linear-gradient(to top, ${t.palette.background.paper}, ${t.palette.background.paper} 70%, transparent)`,
          }}
        >
          <Divider sx={{ mb: 1 }} />
          <Stack direction="row" spacing={1}>
            {onApply && <Button onClick={onApply} variant="contained" fullWidth>Apply</Button>}
            {onReset && <Button onClick={onReset} variant="outlined" fullWidth>Reset</Button>}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
