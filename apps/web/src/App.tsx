// src/App.tsx
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import TopNav from './components/Header/TopNav';
import { AccountMenu } from './components/Auth/AccountMenu';

import { useAuth } from '@commons/hooks/useAuth';

import { ColorModeContext } from '@ph-shoes/commons-ui';
import { useProductSearchControls } from '@commons/hooks/useProductSearchControls';
import { useAccountRedirects } from '@commons/hooks/useAccountRedirects';
import { UnsubscribeDialogState } from '@commons/types/DialogStates';
import { useServiceStatuses } from '@commons/hooks/useServiceStatuses';
import { useAlerts } from '@commons/hooks/useAlerts';
import { AlertResponse, AlertCreateRequest, AlertUpdateRequest, AlertTarget } from '@commons/types/alerts';
import { widgetRegistry } from './shell/widgetRegistry';

const AlertsCenterWidget = widgetRegistry['alerts-center'];
const AlertEditorWidget = widgetRegistry['alert-editor'];
const ServiceStatusWidget = widgetRegistry['service-status'];
const AuthGateWidget = widgetRegistry['auth-gate'];
const AccountSettingsWidget = widgetRegistry['account-settings'];
const CatalogSearchWidget = widgetRegistry['catalog-search'];

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
    handleDraftChange,
    handleApplyFilters,
    handleResetFilters,
    handleAiSearch,
    handleAiClear,
    openDrawer,
    closeDrawer,
    setPage,
  } = useProductSearchControls(isMobile);
  
  // ---------- auth ----------
  const auth = useAuth();

  const {
    entries: serviceStatusEntries,
    refresh: refreshServiceStatuses,
    isRefreshing: refreshingServiceStatuses,
    cooldownMsLeft: serviceStatusCooldownMs,
  } = useServiceStatuses();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // verification: separate “notice after register” vs “result from redirect”
  const [verifyNoticeOpen, setVerifyNoticeOpen] = useState(false);
  const [verifyResultOpen, setVerifyResultOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyTitle, setVerifyTitle] = useState<string>('Email verified');
  const [verifyMsg, setVerifyMsg] = useState<string | undefined>(undefined);
  const [verifyStatus, setVerifyStatus] = useState<'loading' | 'success' | 'error' | undefined>(undefined);
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
    ({ title, message, email, status }: { title: string; message?: string; email?: string; status?: 'loading' | 'success' | 'error' }) => {
      setVerifyTitle(title);
      setVerifyMsg(message);
      setVerifyEmail(email ?? '');
      setVerifyStatus(status);
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
    setVerifyStatus(undefined);
    setLoginOpen(true);
  }
  const closeVerifyResultDialog = () => {
    setVerifyResultOpen(false);
    setVerifyStatus(undefined);
  };

  //Accounts Setting
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

const handleAccountDeleted = async () => {
    try {
      await auth.logout();
    } catch {
      // token was already revoked with account deletion
    }
  };

  // ---------- alerts ----------
  const {
    alerts,
    loading: alertsLoading,
    triggeredCount,
    create: createAlert,
    update: updateAlert,
    remove: deleteAlert,
    refresh: refreshAlerts,
  } = useAlerts(!!auth.user);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AlertTarget | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertResponse | null>(null);
  const [returnToAlertsAfterEdit, setReturnToAlertsAfterEdit] = useState(false);

  const openAlertModal = (product: AlertTarget, existing?: AlertResponse | null, fromAlertsList = false) => {
    setSelectedProduct(product);
    setSelectedAlert(existing ?? null);
    setReturnToAlertsAfterEdit(fromAlertsList);
    setAlertModalOpen(true);
  };

  const handleSaveAlert = async (
    req: AlertCreateRequest | AlertUpdateRequest,
    productId: string
  ) => {
    if (selectedAlert) await updateAlert(productId, req);
    else await createAlert(req);
  };

  const handleDeleteAlert = async (productId: string) => {
    await deleteAlert(productId);
  };

  const handleResetAlert = async (productId: string) => {
    await updateAlert(productId, { productId, resetStatus: true } as AlertUpdateRequest);
  };

  const alertedProductIds = useMemo(() => new Set(alerts.map((a) => a.productId)), [alerts]);

  const closeAlertsModal = () => {
    setAlertsDrawerOpen(false);
  };

  const widgetShellApi = useMemo(
    () => ({
      openWidget: (widgetId: string) => {
        if (widgetId === 'alerts-center') setAlertsDrawerOpen(true);
        if (widgetId === 'alert-editor') setAlertModalOpen(true);
        if (widgetId === 'service-status') setStatusDialogOpen(true);
        if (widgetId === 'auth-gate') setLoginOpen(true);
        if (widgetId === 'account-settings') setAccountSettingsOpen(true);
        if (widgetId === 'catalog-search') openDrawer();
      },
      closeWidget: (widgetId: string) => {
        if (widgetId === 'alerts-center') setAlertsDrawerOpen(false);
        if (widgetId === 'alert-editor') setAlertModalOpen(false);
        if (widgetId === 'service-status') setStatusDialogOpen(false);
        if (widgetId === 'auth-gate') setLoginOpen(false);
        if (widgetId === 'account-settings') setAccountSettingsOpen(false);
        if (widgetId === 'catalog-search') closeDrawer();
      },
    }),
    [closeDrawer, openDrawer],
  );

  const handleCloseAlertModal = () => {
    setAlertModalOpen(false);
    if (returnToAlertsAfterEdit) {
      setAlertsDrawerOpen(true);
      setReturnToAlertsAfterEdit(false);
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
        onOpenNotifications={() => setAlertsDrawerOpen(true)}
        onOpenAccount={handleAccountClick}
        onOpenStatus={() => setStatusDialogOpen(true)}
        unread={triggeredCount}
        serviceStatuses={serviceStatusEntries}
      />
      <Suspense fallback={null}>
        <ServiceStatusWidget
          widgetId="service-status"
          shellApi={widgetShellApi}
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          entries={serviceStatusEntries}
          refreshing={refreshingServiceStatuses}
          onRefresh={refreshServiceStatuses}
          cooldownMsLeft={serviceStatusCooldownMs}
        />
      </Suspense>

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
          <CatalogSearchWidget
            widgetId="catalog-search"
            shellApi={widgetShellApi}
            isMobile={isMobile}
            drawerOpen={drawerOpen}
            aiQuery={aiQuery}
            showingAI={showingAI}
            draftFilters={draftFilters}
            activeFilters={activeFilters}
            page={page}
            pageSize={pageSize}
            alertedProductIds={alertedProductIds}
            onOpenAlert={(shoe) =>
              auth.user
                ? openAlertModal(
                    {
                      id: shoe.id,
                      title: shoe.title,
                      priceSale: shoe.priceSale,
                      priceOriginal: shoe.priceOriginal,
                      brand: shoe.brand,
                      image: shoe.image,
                      productImageUrl: (shoe as any).productImageUrl ?? shoe.image,
                      url: shoe.url,
                    },
                    alerts.find((a) => a.productId === shoe.id) ?? null,
                  )
                : openLogin()
            }
            onDraftChange={handleDraftChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            onOpenDrawer={openDrawer}
            onCloseDrawer={closeDrawer}
            onPageChange={(newPage) => setPage(newPage)}
          />

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

          <Suspense fallback={null}>
            <AuthGateWidget
              widgetId="auth-gate"
              shellApi={widgetShellApi}
              login={{
                open: loginOpen,
                loading: auth.loading,
                error: auth.error,
                prefillEmail: loginEmailPrefill,
                onClose: () => setLoginOpen(false),
                onLogin: (email, pw) => auth.login(email, pw),
                onOpenRegister: goToRegister,
              }}
              register={{
                open: registerOpen,
                onClose: () => setRegisterOpen(false),
                onRegistered: handleRegistered,
                onOpenLogin: goToLogin,
              }}
              verifyNotice={{
                open: verifyNoticeOpen,
                email: verifyEmail,
                onClose: () => setVerifyNoticeOpen(false),
              }}
              verifyResult={{
                open: verifyResultOpen,
                email: verifyEmail,
                title: verifyTitle,
                message: verifyMsg,
                status: verifyStatus,
                onClose: closeVerifyResultDialog,
                onLogin: openLogin,
              }}
            />
          </Suspense>

          <Suspense fallback={null}>
            <AccountSettingsWidget
              widgetId="account-settings"
              shellApi={widgetShellApi}
              settingsOpen={accountSettingsOpen}
              onCloseSettings={() => setAccountSettingsOpen(false)}
              onAccountDeleted={handleAccountDeleted}
              email={auth.user?.email}
              unsubscribeResult={unsubscribeResult}
              onCloseUnsubscribeResult={() => setUnsubscribeResult(null)}
            />
          </Suspense>

          <Suspense fallback={null}>
            <AlertsCenterWidget
              widgetId="alerts-center"
              shellApi={widgetShellApi}
              open={alertsDrawerOpen}
              onClose={closeAlertsModal}
              alerts={alerts}
              loading={alertsLoading}
              onRefresh={refreshAlerts}
              onResetAlert={(a) => handleResetAlert(a.productId)}
              onDeleteAlert={(a) => handleDeleteAlert(a.productId)}
              onEditAlert={(a) => {
                closeAlertsModal();
                openAlertModal(
                  {
                    id: a.productId,
                    title: a.productName,
                    priceSale: a.productCurrentPrice ?? 0,
                    priceOriginal: a.productOriginalPrice ?? a.productCurrentPrice ?? 0,
                    brand: a.productBrand,
                    image: a.productImage ?? a.productImageUrl,
                    productImageUrl: a.productImageUrl ?? a.productImage,
                    url: a.productUrl,
                  },
                  a,
                  true,
                );
              }}
            />
          </Suspense>

          <Suspense fallback={null}>
            <AlertEditorWidget
              widgetId="alert-editor"
              shellApi={widgetShellApi}
              open={alertModalOpen}
              onClose={handleCloseAlertModal}
              product={selectedProduct}
              existingAlert={selectedAlert}
              onSave={handleSaveAlert}
              onDelete={handleDeleteAlert}
            />
          </Suspense>

        </Box>
      </Container>
    </>
  );
}
