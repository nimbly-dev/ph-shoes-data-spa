import { useEffect } from 'react';
import { buildCombinedSearchParams, normalizeRouteSegment, readParamValue } from '../utils/urlParams';
import { UnsubscribeDialogState } from '../types/DialogStates';

type VerifyResult = {
  title: string;
  message?: string;
  email?: string;
};

type UseAccountRedirectsOptions = {
  onVerifyResult: (state: VerifyResult) => void;
  onUnsubscribeResult: (state: UnsubscribeDialogState) => void;
};

export function useAccountRedirects({ onVerifyResult, onUnsubscribeResult }: UseAccountRedirectsOptions) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = buildCombinedSearchParams();
    const verified = params.get('verified');
    const resent = params.get('resent');
    const error = params.get('error');
    const email = readParamValue(params, 'email', 'email?') ?? '';
    const notMe = readParamValue(params, 'not_me', 'notMe', 'not-me');

    const cleanUrl = () => {
      window.history.replaceState(null, '', window.location.pathname);
    };

    if (notMe) {
      onVerifyResult({
        title: 'Verification dismissed',
        message: `Thanks for confirming. We cancelled that verification request${email ? ` for ${email}` : ''}.`,
        email,
      });
      cleanUrl();
      return;
    }

    if (verified === 'true') {
      onVerifyResult({ title: 'Email verified', email });
      cleanUrl();
      return;
    }

    if (verified === 'false' && error) {
      const msg = (
        {
          invalid: 'That verification link is invalid. Request a new one.',
          not_found: 'We couldn’t find a matching verification request. It may have expired.',
          expired: 'This verification link has expired. Request a new one.',
          used: 'This verification link was already used.',
        } as Record<string, string>
      )[error] ?? 'Something went wrong on our side. Please try again.';
      onVerifyResult({
        title: 'Verification failed',
        message: msg,
        email,
      });
      cleanUrl();
      return;
    }

    if (resent === 'true') {
      onVerifyResult({
        title: 'Verification email resent',
        message: `We sent a new verification link to ${email}.`,
        email,
      });
      cleanUrl();
      return;
    }

    if (resent === 'false' && error) {
      onVerifyResult({
        title: 'Resend failed',
        message: 'Could not resend the verification email. Please try again.',
        email,
      });
      cleanUrl();
    }
  }, [onVerifyResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const normalizedPath = normalizeRouteSegment(window.location.pathname);
    const hashSegment = window.location.hash.includes('?')
      ? normalizeRouteSegment(window.location.hash.split('?')[0])
      : normalizeRouteSegment(window.location.hash);
    const matchesConfirmationRoute =
      normalizedPath.endsWith('/unsubscribe-confirmation') ||
      hashSegment.endsWith('/unsubscribe-confirmation');

    const combined = buildCombinedSearchParams();
    const explicitAction = readParamValue(combined, 'action', 'action?', 'flow', 'flow?');
    const subscribeFlag = readParamValue(combined, 'subscribe', 'subscribe?');
    const unsubscribeFlag = readParamValue(combined, 'unsubscribe', 'unsubscribe?');
    const hasSuppressionParams =
      matchesConfirmationRoute || !!explicitAction || !!subscribeFlag || !!unsubscribeFlag;
    if (!hasSuppressionParams) return;

    const email = readParamValue(combined, 'email', 'email?');
    const explicitError = readParamValue(combined, 'error', 'error?');

    const finish = () => {
      window.history.replaceState(null, '', window.location.pathname);
    };

    if (explicitError) {
      const friendly = (
        {
          missing_token: 'That confirmation link is missing its token. Please use the most recent email we sent you.',
          expired: 'This confirmation link has expired. Request a new unsubscribe email from your account settings.',
          invalid: 'We could not validate that confirmation link. Double-check that you used the full URL.',
        } as Record<string, string>
      )[explicitError] ?? 'We could not process that link. Please try again.';
      onUnsubscribeResult({
        open: true,
        status: 'error',
        title: 'Unable to update email preferences',
        message: friendly,
        email,
      });
      finish();
      return;
    }

    let action = explicitAction;
    if (!action && subscribeFlag) action = 'subscribe';
    if (!action && unsubscribeFlag) action = 'unsubscribe';
    if (!action && matchesConfirmationRoute) action = 'unsubscribe';

    if (!action) return;

    const normalizedAction = action.toLowerCase();
    const isReEnabling = ['subscribe', 'resubscribe', 'enable'].includes(normalizedAction);
    const successTitle = isReEnabling ? 'Email notifications re-enabled' : 'You are unsubscribed';
    const successMessage = isReEnabling
      ? 'We will start sending account-related emails to this address again.'
      : 'You will no longer receive account-related emails at this address.';

    onUnsubscribeResult({
      open: true,
      status: 'success',
      title: successTitle,
      message: successMessage,
      email,
    });
    finish();
  }, [onUnsubscribeResult]);
}
