import * as React from 'react';
import {
  Paper, ListItemButton, ListItemText, Typography, Collapse, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type Props = {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export default function CollapsibleSection({
  title, summary, defaultOpen = false, children
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <ListItemButton
        dense
        onClick={() => setOpen(!open)}
        sx={{
          py: 1.25,
          '& .MuiListItemText-primary': { fontWeight: 600 },
        }}
      >
        <ListItemText
          primary={title}
          secondary={
            summary ? (
              <Typography variant="caption" color="text.secondary" noWrap>
                {summary}
              </Typography>
            ) : null
          }
        />
        <ExpandMoreIcon
          fontSize="small"
          sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.15s' }}
        />
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Divider />
        <div style={{ padding: 12 }}>{children}</div>
      </Collapse>
    </Paper>
  );
}
