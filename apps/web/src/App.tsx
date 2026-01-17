// src/App.tsx
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAuth } from '@commons/hooks/useAuth';

import { ColorModeContext } from '@ph-shoes/commons-ui';
import { useProductSearchControls } from '@commons/hooks/useProductSearchControls';
import { useAccountRedirects } from '@commons/hooks/useAccountRedirects';
import { UnsubscribeDialogState } from '@commons/types/DialogStates';
import { useServiceStatuses } from '@commons/hooks/useServiceStatuses';
import { useAlerts } from '@commons/hooks/useAlerts';
import { AlertResponse, AlertCreateRequest, AlertUpdateRequest, AlertTarget } from '@commons/types/alerts';
import { widgetRegistry } from './shell/widgetRegistry';
import { WidgetErrorBoundary } from './shell/WidgetErrorBoundary';

const AlertsCenterWidget = widgetRegistry['alerts-center'];
const AlertEditorWidget = widgetRegistry['alert-editor'];
const ServiceStatusWidget = widgetRegistry['service-status'];
const AuthGateWidget = widgetRegistry['auth-gate'];
const AccountSettingsWidget = widgetRegistry['account-settings'];
const CatalogSearchWidget = widgetRegistry['catalog-search'];
const TopNavWidget = widgetRegistry['top-nav'];
const AccountMenuWidget = widgetRegistry['account-menu'];

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
  const [sessionTimeoutOpen, setSessionTimeoutOpen] = useState(false);

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

  //Accounts Setting
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  // ---------- alerts ----------
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AlertTarget | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertResponse | null>(null);
  const [returnToAlertsAfterEdit, setReturnToAlertsAfterEdit] = useState(false);

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

  useEffect(() => {
    if (auth.logoutReason === 'session-timeout') setSessionTimeoutOpen(true);
  }, [auth.logoutReason]);

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

  const closeSessionTimeoutDialog = () => {
    setSessionTimeoutOpen(false);
    auth.acknowledgeSessionTimeout();
  };

  const handleSessionTimeoutLogin = () => {
    closeSessionTimeoutDialog();
    openLogin();
  };
  const closeVerifyResultDialog = () => {
    setVerifyResultOpen(false);
    setVerifyStatus(undefined);
  };

  //Accounts Setting
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

  const handleCloseAlertModal = () => {
    setAlertModalOpen(false);
    if (returnToAlertsAfterEdit) {
      setAlertsDrawerOpen(true);
      setReturnToAlertsAfterEdit(false);
    }
  };

  return (
    <>
      <TopNavWidget
        widgetId="top-nav"
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
      {statusDialogOpen && (
        <WidgetErrorBoundary widgetId="service-status">
          <Suspense fallback={null}>
            <ServiceStatusWidget
              widgetId="service-status"
              open={statusDialogOpen}
              onClose={() => setStatusDialogOpen(false)}
              entries={serviceStatusEntries}
              refreshing={refreshingServiceStatuses}
              onRefresh={refreshServiceStatuses}
              cooldownMsLeft={serviceStatusCooldownMs}
            />
          </Suspense>
        </WidgetErrorBoundary>
      )}

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
          <WidgetErrorBoundary widgetId="catalog-search">
            <Suspense fallback={null}>
              <CatalogSearchWidget
                widgetId="catalog-search"
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
            </Suspense>
          </WidgetErrorBoundary>

          {/* Account dropdown (signed-in only) */}
          {auth.user && (
            <AccountMenuWidget
              widgetId="account-menu"
              anchorEl={accountAnchor}
              onClose={closeAccountMenu}
              email={auth.user.email}
              onLogout={() => { auth.logout(); closeAccountMenu(); }}
              onOpenSettings={() => setAccountSettingsOpen(true)}
            />
          )}

          {(loginOpen || registerOpen || verifyNoticeOpen || verifyResultOpen || sessionTimeoutOpen) && (
            <WidgetErrorBoundary widgetId="auth-gate">
              <Suspense fallback={null}>
                <AuthGateWidget
                  widgetId="auth-gate"
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
                  sessionTimeout={{
                    open: sessionTimeoutOpen,
                    onClose: closeSessionTimeoutDialog,
                    onLogin: handleSessionTimeoutLogin,
                  }}
                />
              </Suspense>
            </WidgetErrorBoundary>
          )}

          {accountSettingsOpen && (
            <WidgetErrorBoundary widgetId="account-settings">
              <Suspense fallback={null}>
                <AccountSettingsWidget
                  widgetId="account-settings"
                  settingsOpen={accountSettingsOpen}
                  onCloseSettings={() => setAccountSettingsOpen(false)}
                  onAccountDeleted={handleAccountDeleted}
                  email={auth.user?.email}
                  unsubscribeResult={unsubscribeResult}
                  onCloseUnsubscribeResult={() => setUnsubscribeResult(null)}
                />
              </Suspense>
            </WidgetErrorBoundary>
          )}

          {alertsDrawerOpen && (
            <WidgetErrorBoundary widgetId="alerts-center">
              <Suspense fallback={null}>
                <AlertsCenterWidget
                  widgetId="alerts-center"
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
            </WidgetErrorBoundary>
          )}

          {alertModalOpen && (
            <WidgetErrorBoundary widgetId="alert-editor">
              <Suspense fallback={null}>
                <AlertEditorWidget
                  widgetId="alert-editor"
                  open={alertModalOpen}
                  onClose={handleCloseAlertModal}
                  product={selectedProduct}
                  existingAlert={selectedAlert}
                  onSave={handleSaveAlert}
                  onDelete={handleDeleteAlert}
                />
              </Suspense>
            </WidgetErrorBoundary>
          )}

        </Box>
      </Container>
    </>
  );
}
