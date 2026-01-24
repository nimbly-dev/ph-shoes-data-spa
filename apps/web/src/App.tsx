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
import { UnsubscribeDialogState } from '@commons/types/DialogStates';
import { useServiceStatuses } from '@commons/hooks/useServiceStatuses';
import { AlertResponse, AlertTarget } from '@commons/types/alerts';
import { buildCombinedSearchParams, readParamValue } from '@commons/utils/urlParams';
import { widgetRegistry } from './shell/widgetRegistry';
import { WidgetErrorBoundary } from './shell/WidgetErrorBoundary';

const AlertsListWidget = widgetRegistry['alerts-list'];
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

  const [unsubscribeResult, setUnsubscribeResult] = useState<UnsubscribeDialogState | null>(null);
  const [loginEmailPrefill, setLoginEmailPrefill] = useState<string>('');

  const shouldMountAuthRedirects = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = buildCombinedSearchParams();
    const token = readParamValue(params, 'token');
    const notMe = readParamValue(params, 'not_me', 'notMe', 'not-me');
    const verified = params.get('verified');
    const resent = params.get('resent');
    const error = params.get('error');
    const explicitAction = readParamValue(params, 'action', 'action?', 'flow', 'flow?');
    const subscribeFlag = readParamValue(params, 'subscribe', 'subscribe?');
    const unsubscribeFlag = readParamValue(params, 'unsubscribe', 'unsubscribe?');
    return Boolean(
      token ||
      notMe ||
      verified ||
      resent ||
      error ||
      explicitAction ||
      subscribeFlag ||
      unsubscribeFlag,
    );
  }, []);

  //Accounts Setting
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  // ---------- alerts ----------
  const [alertsCenterOpen, setAlertsCenterOpen] = useState(false);
  const [alertedProductIds, setAlertedProductIds] = useState<Set<string>>(new Set());
  const [alertsSnapshot, setAlertsSnapshot] = useState<AlertResponse[]>([]);
  const [triggeredCount, setTriggeredCount] = useState(0);
  const [alertRequest, setAlertRequest] = useState<{
    product: AlertTarget;
    existingAlert?: AlertResponse | null;
    returnToCenter?: boolean;
  } | null>(null);

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

  // cross-navigation
  const goToRegister = () => { setLoginOpen(false); setRegisterOpen(true); };
  const goToLogin    = () => { setRegisterOpen(false); setLoginOpen(true); };

  function openLogin(prefill?: string | null) {
    setLoginEmailPrefill(prefill ?? '');
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

  //Accounts Setting
  const handleAccountDeleted = async () => {
    try {
      await auth.logout();
    } catch {
      // token was already revoked with account deletion
    }
  };

  const handleAlertsChange = useCallback(
    (alerts: AlertResponse[], count: number, ids: string[]) => {
      setAlertsSnapshot(alerts);
      setTriggeredCount(count);
      setAlertedProductIds(new Set(ids));
    },
    [],
  );

  return (
    <>
      <TopNavWidget
        widgetId="top-nav"
        mode={mode}
        onToggleMode={toggleMode}
        activeQuery={aiQuery}
        onSearch={handleAiSearch}
        onClear={handleAiClear}
        onOpenNotifications={() => setAlertsCenterOpen(true)}
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
            maxWidth: '100%',
            mx: 0,
            px: { xs: 1.5, md: 2 },
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
                    ? setAlertRequest({
                        product: {
                          id: shoe.id,
                          title: shoe.title,
                          priceSale: shoe.priceSale,
                          priceOriginal: shoe.priceOriginal,
                          brand: shoe.brand,
                          image: shoe.image,
                          productImageUrl: (shoe as any).productImageUrl ?? shoe.image,
                          url: shoe.url,
                        },
                        existingAlert: alertsSnapshot.find((a) => a.productId === shoe.id) ?? null,
                      })
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

          {(loginOpen || registerOpen || sessionTimeoutOpen || shouldMountAuthRedirects) && (
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
                    onOpenLogin: goToLogin,
                  }}
                  sessionTimeout={{
                    open: sessionTimeoutOpen,
                    onClose: closeSessionTimeoutDialog,
                    onLogin: handleSessionTimeoutLogin,
                  }}
                  onRequestLogin={openLogin}
                  onUnsubscribeResult={setUnsubscribeResult}
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

          <WidgetErrorBoundary widgetId="alerts-list">
            <Suspense fallback={null}>
              <AlertsListWidget
                widgetId="alerts-list"
                isAuthenticated={!!auth.user}
                open={alertsCenterOpen}
                onOpen={() => setAlertsCenterOpen(true)}
                onClose={() => setAlertsCenterOpen(false)}
                alertRequest={alertRequest}
                onAlertRequestHandled={() => setAlertRequest(null)}
                onAlertsChange={handleAlertsChange}
              />
            </Suspense>
          </WidgetErrorBoundary>

        </Box>
      </Container>
    </>
  );
}
