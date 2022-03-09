import React from 'react';
import ReactPaginate from 'react-paginate';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

interface Props {
  onClick({ selected }): void;
  pageCount: number;
}

export default function Pagination({ onClick, pageCount }: Props) {
  return (
    <div className="flex justify-center p-5 m-5">
      <ReactPaginate
        breakLabel="..."
        onPageChange={onClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        containerClassName="relative z-0 inline-flex rounded-md shadow-lg -space-x-px"
        breakLinkClassName="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
        hrefBuilder={(page: number) => `?page=${page}`}
        activeLinkClassName="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
        pageLinkClassName="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
        previousLinkClassName="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        previousLabel={
          <>
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="h-5 w-5" />
          </>
        }
        nextLinkClassName="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        nextLabel={
          <>
            <ChevronRightIcon className="h-5 w-5" />
          </>
        }
        renderOnZeroPageCount={null}
      />
    </div>
  );
}
