import React from 'react';
import { SerializedChannel, Settings } from '@linen/types';
import ButtonPagination from 'components/ButtonPagination';
import CustomLinkHelper from 'components/Link/CustomLinkHelper';

export function PaginationForBots({
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

  function Page({ num }: { num: number }) {
    return (
      <ButtonPagination
        key={num}
        href={CustomLinkHelper({
          isSubDomainRouting,
          communityName: settings.communityName,
          communityType: settings.communityType,
          path: `/c/${currentChannel.channelName}/${num}`,
        })}
        label={String(num)}
      />
    );
  }

  function Latest() {
    return (
      <ButtonPagination
        key={'latest'}
        href={CustomLinkHelper({
          isSubDomainRouting,
          communityName: settings.communityName,
          communityType: settings.communityType,
          path: `/c/${currentChannel.channelName}`,
        })}
        label={String('Latest')}
      />
    );
  }

  function Dots() {
    return <span className="p-4">...</span>;
  }

  return (
    <>
      {currentChannel && currentChannel.pages ? (
        <div className="text-center p-4">
          <Latest />
          {pagination.items?.map((item) => {
            if (item.type === 'ellipsis') {
              return <Dots key={'dots'} />;
            }
            return <Page num={item.page!} key={item.page} />;
          })}
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

  const items = itemList
    .map((item) => {
      return typeof item === 'number'
        ? {
            type: 'page',
            page: item,
            selected: item === page,
          }
        : {
            type: item,
          };
    })
    .reverse();

  return {
    items,
  };
}
