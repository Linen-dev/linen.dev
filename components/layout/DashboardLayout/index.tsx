import React from 'react';
import {
  faGear,
  faMoneyBill,
  faPalette,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SidebarLink from './SidebarLink';
import { useRouter } from 'next/router';
import featureFlags from 'utilities/featureFlags';
import { SerializedAccount } from 'serializers/account';
import Logo from './Logo';

interface Props {
  children: React.ReactNode;
  header?: string;
  account?: SerializedAccount;
}
const iconClassName = 'flex-shrink-0 h-5 w-5';

export default function DashboardLayout({ children, header, account }: Props) {
  const { route } = useRouter();
  return (
    <div>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <nav className="bg-gray-50 border-r border-gray-200 pt-5 pb-4 flex flex-col flex-grow overflow-y-auto">
          <Logo account={account} />
          <div className="flex-grow mt-5">
            <div className="space-y-1">
              <SidebarLink
                href="/settings"
                icon={
                  <FontAwesomeIcon icon={faGear} className={iconClassName} />
                }
                text="Settings"
                active={route === '/settings'}
              />
            </div>
            <div className="space-y-1">
              <SidebarLink
                href="/settings/branding"
                icon={
                  <FontAwesomeIcon icon={faPalette} className={iconClassName} />
                }
                text="Branding"
                active={route === '/settings/branding'}
              />
            </div>
            <div className="space-y-1">
              <SidebarLink
                href="/settings/plans"
                icon={
                  <FontAwesomeIcon
                    icon={faMoneyBill}
                    className={iconClassName}
                  />
                }
                text="Plans"
                active={route === '/settings/plans'}
              />
            </div>
            {featureFlags.isVercelDNSEnabled && (
              <div className="space-y-1">
                <SidebarLink
                  href="/settings/dns"
                  icon={
                    <FontAwesomeIcon
                      icon={faMoneyBill}
                      className={iconClassName}
                    />
                  }
                  text="DNS"
                  active={route === '/settings/dns'}
                />
              </div>
            )}
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
            <div className="max-w-4xl mx-auto px-4">
              {header && (
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {header}
                </h1>
              )}
              <div className="py-6">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
