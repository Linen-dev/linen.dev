import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import debounce from '@linen/utilities/debounce';

const defaultConfiguration = {
  server: {
    apiKey: '',
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
        port: isProd() ? 443 : 8108,
        path: '',
        protocol: isProd() ? 'https' : 'http',
      },
    ],
    cacheSearchResultsForSeconds: 2 * 60,
  },
  additionalSearchParameters: {
    query_by: 'body,channel_name,author_name,mentions_name',
  },
};
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter(
  defaultConfiguration
);

export const searchClient = (apiKey: string) => {
  typesenseInstantsearchAdapter.updateConfiguration({
    ...defaultConfiguration,
    server: {
      ...defaultConfiguration.server,
      apiKey,
    },
  });
  return typesenseInstantsearchAdapter.searchClient;
};

function isProd() {
  return process.env.NODE_ENV === 'production';
}

export function analyticsMiddleware() {
  const sendEventDebounced = debounce(() => {
    const url = new URL(window.location.toString());
    (window as any).posthog?.capture('search', {
      url: url.toJSON(),
    });
  }, 3000);

  return {
    onStateChange() {
      sendEventDebounced();
    },
    subscribe() {},
    unsubscribe() {},
  };
}
