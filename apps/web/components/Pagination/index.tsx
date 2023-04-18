import React from 'react';
import { SerializedChannel, Settings } from '@linen/types';
import { CustomLinkHelper } from 'utilities/url';

export default function Pagination({
  currentChannel,
  isSubDomainRouting,
  settings,
  page,
}: {
  currentChannel: SerializedChannel;
  isSubDomainRouting: boolean;
  settings: Settings;
  page: number | null;
}) {
  const pagination = usePagination({
    page: page || (currentChannel.pages || 0) + 1,
    count: currentChannel.pages,
  });

  function Page({ num, curr = false }: { num: number; curr?: boolean }) {
    return (
      <a
        key={num}
        href={CustomLinkHelper({
          isSubDomainRouting,
          communityName: settings.communityName,
          communityType: settings.communityType,
          path: `/c/${currentChannel.channelName}/${num}`,
        })}
        {...(curr
          ? {
              className:
                'inline-flex items-center border-t-2 border-blue-500 px-4 pt-4 text-sm font-medium text-blue-600',
              ['aria-current']: 'page',
            }
          : {
              className:
                'inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700',
            })}
      >
        {String(num)}
      </a>
    );
  }

  function Latest() {
    return (
      <a
        key={'latest'}
        href={CustomLinkHelper({
          isSubDomainRouting,
          communityName: settings.communityName,
          communityType: settings.communityType,
          path: `/c/${currentChannel.channelName}`,
        })}
        className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
      >
        {String('Latest')}
      </a>
    );
  }

  function Dots() {
    return (
      <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
        ...
      </span>
    );
  }

  return (
    <>
      {currentChannel && currentChannel.pages ? (
        <div className="text-center p-4">
          {pagination.items?.map((item) => {
            if (item.type === 'ellipsis') {
              return <Dots key={'dots'} />;
            }
            return (
              <Page
                num={item.page!}
                key={item.page}
                curr={item.page === page}
              />
            );
          })}
          <Latest />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

function usePagination(props: { page: number; count: number | null }) {
  const { count } = props;
  if (!count) return {};

  const { page = count + 1 } = props;

  const boundaryCount = 1,
    siblingCount = 1;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(
    Math.max(count - boundaryCount + 1, boundaryCount + 1),
    count
  );

  const siblingsStart = Math.max(
    Math.min(
      // Natural start
      page - siblingCount,
      // Lower boundary when page is high
      count - boundaryCount - siblingCount * 2 - 1
    ),
    // Greater than startPages
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(
      // Natural end
      page + siblingCount,
      // Upper boundary when page is low
      boundaryCount + siblingCount * 2 + 2
    ),
    // Less than endPages
    endPages.length > 0 ? endPages[0] - 2 : count - 1
  );

  const itemList = [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ['ellipsis']
      : boundaryCount + 1 < count - boundaryCount
      ? [boundaryCount + 1]
      : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? ['ellipsis']
      : count - boundaryCount > boundaryCount
      ? [count - boundaryCount]
      : []),
    ...endPages,
  ];

  const items = itemList.map((item) => {
    return typeof item === 'number'
      ? {
          type: 'page',
          page: item,
          selected: item === page,
        }
      : {
          type: item,
        };
  });

  return {
    items,
  };
}
