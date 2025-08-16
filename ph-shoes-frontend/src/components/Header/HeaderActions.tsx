import * as React from 'react';
import {
  Stack, IconButton, Tooltip, Badge, Menu, MenuItem, Divider,
  useMediaQuery, useTheme, ListItemIcon, ListItemText
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

type Props = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;

  // Popovers / dialogs you already have:
  onShowLatest: (anchor: HTMLElement) => void;
  onOpenSettings: () => void;

  // Optional account / notifications:
  onOpenAccount?: (anchor: HTMLElement) => void;
  onOpenNotifications?: (anchor: HTMLElement) => void;
  unreadCount?: number;
};

export default function HeaderActions({
  mode,
  onToggleMode,
  onShowLatest,
  onOpenSettings,
  onOpenAccount,
  onOpenNotifications,
  unreadCount = 0,
}: Props) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [moreEl, setMoreEl] = React.useState<HTMLElement | null>(null);
  const openMore = Boolean(moreEl);

  const handleMore = (e: React.MouseEvent<HTMLElement>) => setMoreEl(e.currentTarget);
  const closeMore = () => setMoreEl(null);

  const ThemeIcon = mode === 'light' ? Brightness4Icon : Brightness7Icon;

  const LatestBtn = (
    <Tooltip title="Latest data by brand">
      <IconButton onClick={(e) => onShowLatest(e.currentTarget)} size="small">
        <DataUsageIcon />
      </IconButton>
    </Tooltip>
  );

  const NotifBtn = (
    <Tooltip title="Notifications">
      <IconButton onClick={(e) => onOpenNotifications?.(e.currentTarget)} size="small">
        <Badge color="error" badgeContent={unreadCount} max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );

  const ThemeBtn = (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton onClick={onToggleMode} size="small">
        <ThemeIcon />
      </IconButton>
    </Tooltip>
  );

  const AccountBtn = (
    <Tooltip title="Account">
      <IconButton onClick={(e) => onOpenAccount?.(e.currentTarget)} size="small">
        <AccountCircleIcon />
      </IconButton>
    </Tooltip>
  );

  const SettingsBtn = (
    <Tooltip title="Settings">
      <IconButton onClick={onOpenSettings} size="small">
        <SettingsIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      {mdUp ? (
        <Stack direction="row" spacing={1} alignItems="center">
          {LatestBtn}
          {NotifBtn}
          {ThemeBtn}
          {AccountBtn}
          {SettingsBtn}
        </Stack>
      ) : (
        <>
          <IconButton onClick={handleMore} size="small">
            <MoreVertIcon />
          </IconButton>

          <Menu anchorEl={moreEl} open={openMore} onClose={closeMore}>
            <MenuItem onClick={(e) => { closeMore(); onShowLatest(e.currentTarget as HTMLElement); }}>
              <ListItemIcon><DataUsageIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Latest data" />
            </MenuItem>
            <MenuItem onClick={(e) => { closeMore(); onOpenNotifications?.(e.currentTarget as HTMLElement); }}>
              <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Notifications" />
              {unreadCount > 0 && <Badge color="error" badgeContent={unreadCount} sx={{ ml: 1 }} />}
            </MenuItem>
            <MenuItem onClick={() => { closeMore(); onToggleMode(); }}>
              <ListItemIcon><ThemeIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={mode === 'light' ? 'Dark mode' : 'Light mode'} />
            </MenuItem>
            <Divider />
            <MenuItem onClick={(e) => { closeMore(); onOpenAccount?.(e.currentTarget as HTMLElement); }}>
              <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Account" />
            </MenuItem>
            <MenuItem onClick={() => { closeMore(); onOpenSettings(); }}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
          </Menu>
        </>
      )}
    </>
  );
}
