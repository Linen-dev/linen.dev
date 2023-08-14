import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import debounce from '@linen/utilities/debounce';

const defaultConfiguration = {
  server: {
    apiKey: '',
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
        port: 443,
        path: '',
        protocol: 'https',
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
