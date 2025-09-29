// src/App.tsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Drawer,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';

import TopNav from './components/Header/TopNav';
import { FilterSidebars } from './components/Filters/FilterSidebars';
import { ProductShoeList } from './components/ProductShoeList/ProductShoeList';
import { ToggleSettingsModal } from './components/Toggles/ToggleSettingsModal';
import { AccountMenu } from './components/Auth/AccountMenu';
import { LoginDialog } from './components/Auth/LoginDialog';
import { RegisterDialog } from './components/Auth/RegisterDialog';
import { VerifyEmailNotice } from './components/Auth/VerifyEmailNotice';

import { useAuth } from './hooks/useAuth';

import { ColorModeContext } from './themes/ThemeContext';
import { UIProductFilters } from './types/UIProductFilters';
import { VerifyResultDialog } from './components/Auth/VerifyResultDialog';

export default function App() {
  const { mode, toggleMode } = useContext(ColorModeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ---------- paging ----------
  const pageSize = isMobile ? 8 : 15;
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [pageSize]);


  const fmtLocal = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayStr = useMemo(() => fmtLocal(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return fmtLocal(d);
  }, []);

  const defaultFilters: UIProductFilters = useMemo(
    () => ({
      startDate: yesterdayStr,
      endDate: todayStr,
    }),
    [yesterdayStr, todayStr]
  );

  // ---------- manual filters state ----------
  const [draftFilters, setDraftFilters] = useState<UIProductFilters>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<UIProductFilters>(defaultFilters);

  // ---------- AI search ----------
  const [aiQuery, setAiQuery] = useState<string>('');
  const showingAI = aiQuery.trim().length > 0;

  // ---------- UI ----------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [useVectorFallback, setUseVectorFallback] = useState(false);

  // ---------- Desktop: auto-apply draft → active with debounce ----------
  const autoApply = !isMobile;
  useEffect(() => {
    if (!autoApply) return;
    const id = window.setTimeout(() => {
      setActiveFilters({ ...draftFilters });
      setPage(0);
    }, 250);
    return () => window.clearTimeout(id);
  }, [draftFilters, autoApply]);

  // ---------- AI search handlers ----------
  const handleAiSearch = (nlQuery: string) => {
    if (nlQuery === aiQuery) {
      setAiQuery('');
      setTimeout(() => setAiQuery(nlQuery), 0);
    } else {
      setAiQuery(nlQuery);
    }
    setPage(0);
  };

  const handleAiClear = () => {
    setAiQuery('');
    setPage(0);
  };

  // ---------- Mobile drawer actions ----------
  const handleApplyFilters = () => {
    setActiveFilters({ ...draftFilters });
    setPage(0);
    setDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setDraftFilters({ ...defaultFilters });
    setActiveFilters({ ...defaultFilters });
    setPage(0);
    setDrawerOpen(false);
  };

  // ---------- auth ----------
  const auth = useAuth();

  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // verification: separate “notice after register” vs “result from redirect”
  const [verifyNoticeOpen, setVerifyNoticeOpen] = useState(false);
  const [verifyResultOpen, setVerifyResultOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyTitle, setVerifyTitle] = useState<string>('Email verified');
  const [verifyMsg, setVerifyMsg] = useState<string | undefined>(undefined);

  // optional: prefill email when opening login from verify result
  const [loginEmailPrefill, setLoginEmailPrefill] = useState<string>('');

  // account icon click → either open account menu or login
  const handleAccountClick = (anchor: HTMLElement) => {
    if (auth.user) setAccountAnchor(anchor);
    else setLoginOpen(true);
  };
  const closeAccountMenu = () => setAccountAnchor(null);

  // close login automatically when user appears
  useEffect(() => {
    if (loginOpen && auth.user && !auth.loading) setLoginOpen(false);
  }, [loginOpen, auth.user, auth.loading]);

  // registration success → show “check your email” notice
  function handleRegistered(email: string) {
    setRegisterOpen(false);
    setVerifyEmail(email);
    setVerifyNoticeOpen(true);
  }

  // cross-navigation
  const goToRegister = () => { setLoginOpen(false); setRegisterOpen(true); };
  const goToLogin    = () => { setRegisterOpen(false); setLoginOpen(true); };

  // handle redirect flags from backend (?verified/&resent/&error)
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const verified = qs.get('verified');
    const resent   = qs.get('resent');
    const error    = qs.get('error');
    const email    = qs.get('email') || '';

    if (verified === 'true') {
      setVerifyTitle('Email verified');
      setVerifyMsg(undefined);
      setVerifyEmail(email);
      setVerifyResultOpen(true);
    } else if (verified === 'false' && error) {
      setVerifyTitle('Verification failed');
      const msg = ({
        invalid: 'That verification link is invalid. Request a new one.',
        not_found: 'We couldn’t find a matching verification request. It may have expired.',
        expired: 'This verification link has expired. Request a new one.',
        used: 'This verification link was already used.',
      } as Record<string, string>)[error] ?? 'Something went wrong on our side. Please try again.';
      setVerifyMsg(msg);
      setVerifyEmail(email);
      setVerifyResultOpen(true);
    } else if (resent === 'true') {
      setVerifyTitle('Verification email resent');
      setVerifyMsg(`We sent a new verification link to ${email}.`);
      setVerifyEmail(email);
      setVerifyResultOpen(true);
    } else if (resent === 'false' && error) {
      setVerifyTitle('Resend failed');
      setVerifyMsg('Could not resend the verification email. Please try again.');
      setVerifyEmail(email);
      setVerifyResultOpen(true);
    }

    if (verified || resent) {
      const clean = window.location.pathname;
      window.history.replaceState(null, '', clean);
    }
  }, []);

  function openLogin(prefill?: string | null) {
    setLoginEmailPrefill(prefill ?? '');
    setVerifyResultOpen(false);
    setLoginOpen(true);
  }

  return (
    <>
      <TopNav
        mode={mode}
        onToggleMode={toggleMode}
        activeQuery={aiQuery}
        onSearch={handleAiSearch}
        onClear={handleAiClear}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenNotifications={() => {}}
        onOpenAccount={handleAccountClick}
        unread={3}
      />

      <ToggleSettingsModal
        open={settingsOpen}
        useVector={useVectorFallback}
        onChange={setUseVectorFallback}
        onClose={() => setSettingsOpen(false)}
      />

      <Container disableGutters maxWidth={false} sx={{ width: '100%' }}>
        <Box
          sx={{
            maxWidth: '1680px',
            mx: 'auto',
            px: { xs: 2, md: 3 },
            pt: 3,
            pb: 4,
          }}
        >
          {isMobile && (
            <Button
              startIcon={<FilterList />}
              onClick={() => setDrawerOpen(true)}
              sx={{ my: 2 }}
            >
              Filters
            </Button>
          )}

          {isMobile && (
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              ModalProps={{ keepMounted: true }}
              PaperProps={{ sx: { width: '80vw', maxWidth: 320, p: 2 } }}
            >
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <FilterSidebars
                draft={draftFilters}
                onDraftChange={setDraftFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </Drawer>
          )}

          {!isMobile && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 360px) 1fr',
                gap: 4,
                alignItems: 'start',
              }}
            >
              <Box sx={{ position: 'sticky', top: 12, alignSelf: 'start' }}>
                <Paper elevation={1} sx={{ p: 2.25, borderRadius: 2 }}>
                  <FilterSidebars draft={draftFilters} onDraftChange={setDraftFilters} />
                </Paper>
              </Box>

              <Box>
                <ProductShoeList
                  aiQuery={showingAI ? aiQuery : ''}
                  manualFilters={showingAI ? {} : activeFilters}
                  useVector={useVectorFallback}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </Box>
            </Box>
          )}

          {isMobile && (
            <ProductShoeList
              aiQuery={showingAI ? aiQuery : ''}
              manualFilters={showingAI ? {} : activeFilters}
              useVector={useVectorFallback}
              page={page}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}

          {/* Account dropdown (signed-in only) */}
          {auth.user && (
            <AccountMenu
              anchorEl={accountAnchor}
              onClose={closeAccountMenu}
              email={auth.user.email}
              onLogout={() => { auth.logout(); closeAccountMenu(); }}
            />
          )}

          {/* Single Login dialog (keep only this one) */}
          <LoginDialog
            open={loginOpen}
            loading={auth.loading}
            error={auth.error}
            onClose={() => setLoginOpen(false)}
            onLogin={(email, pw) => auth.login(email, pw)}
            onOpenRegister={goToRegister}
          />

          {/* Register dialog */}
          <RegisterDialog
            open={registerOpen}
            onClose={() => setRegisterOpen(false)}
            onRegistered={handleRegistered}
            onOpenLogin={goToLogin}
          />

          {/* Post-register “check email” notice */}
          <VerifyEmailNotice
            open={verifyNoticeOpen}
            email={verifyEmail}
            onClose={() => setVerifyNoticeOpen(false)}
          />

          {/* Redirect result (success/failure/resend) */}
          <VerifyResultDialog
            open={verifyResultOpen}
            email={verifyEmail}
            title={verifyTitle}
            message={verifyMsg}
            onClose={() => setVerifyResultOpen(false)}
            onLogin={openLogin}
          />
        </Box>
      </Container>
    </>
  );
}
