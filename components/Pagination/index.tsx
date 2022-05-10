import React from 'react';
import ReactPaginate from 'react-paginate';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './index.module.css';
import CustomLinkHelper from '../Link/CustomLinkHelper';

interface Props {
  onClick({ selected }: { selected: number }): void;
  channelName: string;
  pageCount: number;
  isSubDomainRouting: boolean;
  communityName: string;
}

export default function Pagination({
  onClick,
  pageCount,
  channelName,
  isSubDomainRouting,
  communityName,
}: Props) {
  if (pageCount === 1) {
    return null;
  }
  return (
    <div className={styles.pagination}>
      <div className="flex justify-center">
        <ReactPaginate
          breakLabel="..."
          onPageChange={onClick}
          pageRangeDisplayed={2}
          pageCount={pageCount}
          containerClassName="border border-solid shadow-sm border-gray-200 inline-flex rounded-md -space-x-px"
          breakLinkClassName="hidden sm:inline-flex bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative items-center px-4 py-2 border text-sm font-medium"
          hrefBuilder={(page: number) =>
            CustomLinkHelper({
              isSubDomainRouting,
              communityName,
              path: `/c/${channelName}/${page}`,
            })
          }
          activeLinkClassName="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
          pageLinkClassName="hidden sm:inline-flex bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative items-center px-4 py-2 border text-sm font-medium"
          previousLinkClassName="bg-white relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50"
          previousLabel={
            <>
              <span className="sr-only">Previous</span>
              <FontAwesomeIcon icon={faAngleLeft} className="h-5 w-5" />
            </>
          }
          nextLinkClassName="bg-white relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50"
          nextLabel={
            <>
              <span className="sr-only">Next</span>
              <FontAwesomeIcon icon={faAngleRight} className="h-5 w-5" />
            </>
          }
          renderOnZeroPageCount={() => null}
        />
      </div>
    </div>
  );
}
