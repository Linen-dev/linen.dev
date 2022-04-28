import React from 'react';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  children: React.ReactNode;
  header: string;
}

export default function DashboardLayout({ children, header }: Props) {
  return (
    <div>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <nav className="bg-gray-50 border-r border-gray-200 pt-5 pb-4 flex flex-col flex-grow overflow-y-auto">
          <div className="flex-shrink-0 px-4 flex items-center">
            <img
              className="h-6 w-auto"
              src="https://linen-assets.s3.amazonaws.com/linen-black-logo.svg"
              alt="Linen logo"
            />
          </div>
          <div className="flex-grow mt-5">
            <div className="space-y-1">
              <a
                href="/settings"
                className="bg-purple-50 border-purple-600 text-purple-600 group border-l-4 py-2 px-3 flex items-center text-sm font-medium"
              >
                <FontAwesomeIcon
                  icon={faGear}
                  className="text-purple-500 mr-3 flex-shrink-0 h-6 w-6"
                />
                Settings
              </a>
            </div>
            <div className="space-y-1">
              <a
                href="/settings/plans"
                className="bg-purple-50 border-purple-600 text-purple-600 group border-l-4 py-2 px-3 flex items-center text-sm font-medium"
              >
                <FontAwesomeIcon icon={faGear} className="text-purple-500 mr-3 flex-shrink-0 h-6 w-6" />
                Plans
              </a>
            </div>
          </div>
          {/* <div className="flex-shrink-0 block w-full">
            <a href="#" className="group border-l-4 border-transparent py-2 px-3 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              <CogIcon className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" />
              Logout
            </a>
          </div> */}
        </nav>
      </div>
      <div className="md:pl-64">
        <div className="max-w-4xl mx-auto flex flex-col md:px-8 xl:px-0">
          <div className="py-10">
            <div className="max-w-lg mx-auto px-4">
              <h1 className="text-3xl font-extrabold text-gray-900">
                {header}
              </h1>
              <div className="py-6">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
