import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  IconButton,
  Badge,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Settings,
  NotificationsNone,
  AccountCircle,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { AISearch } from '../AISearch/AISearch';

type Props = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;

  // AI search hooks
  activeQuery: string;
  onSearch: (q: string) => void;
  onClear: () => void;

  // optional actions
  onOpenSettings?: () => void;
  onOpenNotifications?: (anchor: HTMLElement) => void;
  onOpenAccount?: (anchor: HTMLElement) => void;

  unread?: number;
};

export default function TopNav({
  mode,
  onToggleMode,

  activeQuery,
  onSearch,
  onClear,

  onOpenSettings,
  onOpenNotifications,
  onOpenAccount,
  unread = 0,
}: Props) {
  const theme = useTheme();
  const isDownMd = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container
        maxWidth={false}
        sx={{ maxWidth: '1680px', mx: 'auto', px: { xs: 1.5, md: 3 } }}
      >
        <Toolbar disableGutters sx={{ gap: 1, minHeight: 64 }}>
          {/* Brand (left) */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, mr: 2, whiteSpace: 'nowrap' }}
          >
            PH-Shoes
          </Typography>

          {/* Compact AI search (center) */}
          {!isDownMd && (
            <Box sx={{ flex: 1, maxWidth: 820 }}>
              <AISearch
                activeQuery={activeQuery}
                onSearch={onSearch}
                onClear={onClear}
              />
            </Box>
          )}

          {/* Actions (right) */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            {onOpenSettings && (
              <IconButton size="small" onClick={onOpenSettings} aria-label="Settings">
                <Settings />
              </IconButton>
            )}

            <IconButton size="small" onClick={onToggleMode} aria-label="Toggle theme">
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>

            {onOpenNotifications && (
              <IconButton
                size="small"
                onClick={(e) => onOpenNotifications(e.currentTarget)}
                aria-label="Notifications"
              >
                <Badge color="error" variant={unread ? 'standard' : 'dot'} badgeContent={unread || null}>
                  <NotificationsNone />
                </Badge>
              </IconButton>
            )}

            {onOpenAccount && (
              <IconButton
                size="small"
                onClick={(e) => onOpenAccount(e.currentTarget)}
                aria-label="Account"
              >
                <AccountCircle />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
