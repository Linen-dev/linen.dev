import React from 'react';
import styles from './index.module.scss';

const errorMap = {
  403: {
    message: 'Forbidden',
    subtitle: false,
  },
  404: {
    message: 'Page not found',
    subtitle: 'Please check the URL in the address bar and try again.',
  },
  500: {
    message: 'Internal Server Error',
    subtitle: false,
  },
  bot: {
    message: 'Bot Detection',
    subtitle:
      'Our website utilizes a bot and crawler detection system to ensure the best experience for our human visitors. ' +
      "Unfortunately, it appears that you've been flagged as a bot or crawler. " +
      'If you are indeed a human user trying to access our website, we apologize for the inconvenience. ' +
      'Please double-check your browser settings and ensure that any VPN or proxy is disabled. ' +
      'If you believe this detection is in error, feel free to contact our support team for further assistance. ' +
      'Thank you for your understanding.',
  },
};

function Error(code: 404 | 403 | 500 | 'bot') {
  return (
    <div className={styles.errorView}>
      <div className={styles.errorViewWrapper}>
        <main className={styles.errorFlex}>
          <p className={styles.errorCode}>{code}</p>
          <div className={styles.errorSm}>
            <div className={styles.errorBorder}>
              <h1 className={styles.errorMsg}>{errorMap[code].message}</h1>
              {errorMap[code].subtitle && (
                <p className={styles.subtitle}>{errorMap[code].subtitle}</p>
              )}
            </div>
            <div className={styles.btnWrapper}>
              <a className={styles.btnGoBack} href="/">
                Go back home
              </a>
              <a
                href={`mailto:help@linen.dev?subject=${encodeURIComponent(
                  errorMap[code].message
                )}`}
                className={styles.btnSupport}
              >
                Contact support
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Error403() {
  return Error(403);
}

export function Error404() {
  return Error(404);
}

export function Error500() {
  return Error(500);
}

export function ErrorBot() {
  return Error('bot');
}
