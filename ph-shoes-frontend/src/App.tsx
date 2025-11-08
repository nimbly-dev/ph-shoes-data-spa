// src/App.tsx
import React, { useCallback, useContext, useEffect, useState } from 'react';
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
import { VerifyResultDialog } from './components/Auth/VerifyResultDialog';
import { AccountSettingsDialog, UnsubscribeResultDialog } from './components/AccountSettings';
import { extractErrorMessage } from './services/userAccountsService';
import { useProductSearchControls } from './hooks/useProductSearchControls';
import { useAccountRedirects } from './hooks/useAccountRedirects';
import { UnsubscribeDialogState } from './types/DialogStates';

export default function App() {
  const { mode, toggleMode } = useContext(ColorModeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    draftFilters,
    activeFilters,
    aiQuery,
    showingAI,
    page,
    pageSize,
    drawerOpen,
    settingsOpen,
    useVectorFallback,
    handleDraftChange,
    handleApplyFilters,
    handleResetFilters,
    handleAiSearch,
    handleAiClear,
    openDrawer,
    closeDrawer,
    openSettings,
    closeSettings,
    setUseVectorFallback,
    setPage,
  } = useProductSearchControls(isMobile);
  
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
  const [unsubscribeResult, setUnsubscribeResult] = useState<UnsubscribeDialogState | null>(null);

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

  const handleVerifyRedirectResult = useCallback(
    ({ title, message, email }: { title: string; message?: string; email?: string }) => {
      setVerifyTitle(title);
      setVerifyMsg(message);
      setVerifyEmail(email ?? '');
      setVerifyResultOpen(true);
    },
    []
  );

  const handleUnsubscribeRedirectResult = useCallback((state: UnsubscribeDialogState) => {
    setUnsubscribeResult(state);
  }, []);

  useAccountRedirects({
    onVerifyResult: handleVerifyRedirectResult,
    onUnsubscribeResult: handleUnsubscribeRedirectResult,
  });

  function openLogin(prefill?: string | null) {
    setLoginEmailPrefill(prefill ?? '');
    setVerifyResultOpen(false);
    setLoginOpen(true);
  }

  //Accounts Setting
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  const handleAccountDeleted = async () => {
    try {
      await auth.logout();
    } catch {
      // token was already revoked with account deletion
    }
  };

  return (
    <>
      <TopNav
        mode={mode}
        onToggleMode={toggleMode}
        activeQuery={aiQuery}
        onSearch={handleAiSearch}
        onClear={handleAiClear}
        onOpenSettings={openSettings}
        onOpenNotifications={() => {}}
        onOpenAccount={handleAccountClick}
        unread={3}
      />

      <ToggleSettingsModal
        open={settingsOpen}
        useVector={useVectorFallback}
        onChange={setUseVectorFallback}
        onClose={closeSettings}
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
              onClick={openDrawer}
              sx={{ my: 2 }}
            >
              Filters
            </Button>
          )}

          {isMobile && (
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={closeDrawer}
              ModalProps={{ keepMounted: true }}
              PaperProps={{ sx: { width: '80vw', maxWidth: 320, p: 2 } }}
            >
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <FilterSidebars
                draft={draftFilters}
                onDraftChange={handleDraftChange}
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
                  <FilterSidebars draft={draftFilters} onDraftChange={handleDraftChange} />
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
              onOpenSettings={() => setAccountSettingsOpen(true)}
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

          {/* Redirect result (success/failure/resend) */}
          <AccountSettingsDialog
            open={accountSettingsOpen}
            onClose={() => setAccountSettingsOpen(false)}
            onAccountDeleted={handleAccountDeleted}
            email={auth.user?.email}
          />

          {unsubscribeResult && (
            <UnsubscribeResultDialog
              open={unsubscribeResult.open}
              status={unsubscribeResult.status}
              title={unsubscribeResult.title}
              message={unsubscribeResult.message}
              email={unsubscribeResult.email}
              onClose={() => setUnsubscribeResult(null)}
            />
          )}

        </Box>
      </Container>
    </>
  );
}
