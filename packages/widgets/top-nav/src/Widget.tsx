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
  NotificationsNone,
  AccountCircle,
  Brightness4,
  Brightness7,
  Lan,
} from '@mui/icons-material';
import { AISearch } from '@widgets/catalog-search';
import { TopNavWidgetProps } from './types/TopNavWidgetProps';

export default function TopNavWidget({
  mode,
  onToggleMode,
  activeQuery,
  onSearch,
  onClear,
  onOpenNotifications,
  onOpenAccount,
  onOpenStatus,
  unread = 0,
  serviceStatuses = [],
}: TopNavWidgetProps) {
  const theme = useTheme();
  const isDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const statusState = (() => {
    if (!serviceStatuses.length) return null;
    if (serviceStatuses.some((s) => s.serviceState === 'DOWN')) return 'error';
    if (serviceStatuses.some((s) => s.serviceState === 'DEGRADED')) return 'warning';
    if (serviceStatuses.every((s) => s.serviceState === 'UP')) return 'success';
    return 'info';
  })();

  return (
    <AppBar
      position={isDownMd ? 'static' : 'sticky'}
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
        <Toolbar
          disableGutters
          sx={{
            gap: 1,
            minHeight: 64,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, mr: 2, whiteSpace: 'nowrap' }}
          >
            PH-Shoes
          </Typography>

          {!isDownMd && (
            <Box
              sx={{
                flex: 1,
                maxWidth: 820,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <AISearch
                activeQuery={activeQuery}
                onSearch={onSearch}
                onClear={onClear}
              />
            </Box>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" onClick={onToggleMode} aria-label="Toggle theme">
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>

            {onOpenStatus && (
              <IconButton
                size="small"
                onClick={onOpenStatus}
                aria-label="Service status"
                color={
                  statusState === 'success'
                    ? 'success'
                    : statusState === 'warning'
                        ? 'warning'
                        : statusState === 'error'
                            ? 'error'
                            : 'default'
                }
              >
                <Lan fontSize="small" />
              </IconButton>
            )}

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

          {isDownMd && (
            <Box sx={{ width: '100%', mt: 1 }}>
              <AISearch
                activeQuery={activeQuery}
                onSearch={onSearch}
                onClear={onClear}
              />
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
