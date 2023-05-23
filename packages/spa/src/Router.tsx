import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import RedirectToLastPageViewed from '@/components/RedirectToLastPageViewed';
import RedirectToS from '@/components/RedirectToS';
// hoc
import RequireAuth from '@/hoc/RequireAuth';
import RequireInboxProps from '@/hoc/RequireInboxProps';
import RequirePermissionInbox from '@/hoc/RequirePermissionInbox';
import RequirePermissionManage from '@/hoc/RequirePermissionManage';
// pages
import ErrorPage from '@/pages/Error';
import SignIn from '@/pages/SignIn';
import InboxPage from '@/pages/Inbox';
import StarredPage from '@/pages/Starred';
import AllPage from '@/pages/All';
import ChannelPage from '@/pages/Channel';
import ThreadPage from '@/pages/Thread';
import BrandingPage from '@/pages/Branding';
import ConfigurationsPage from '@/pages/Configurations';
import MembersPage from '@/pages/Members';
import PlansPage from '@/pages/Plans';
import MetricsPage from '@/pages/Metrics';

export default function Router() {
  const isCustomDomain = false;

  return (
    <RouterProvider
      router={createBrowserRouter([
        {
          path: '/signin',
          element: <SignIn />,
          errorElement: <ErrorPage />,
        },

        {
          path: '',
          element: <RequireAuth children={<Outlet />} />,
          errorElement: <ErrorPage />,
          children: [
            isCustomDomain
              ? {
                  path: '/',
                  element: <>TODO</>,
                }
              : {
                  path: '/',
                  element: <Layout />,
                  children: [
                    {
                      path: '/d/*',
                      element: <RedirectToS />,
                    },
                    {
                      path: '/s/:communityName',
                      element: <RequireInboxProps children={<Outlet />} />,
                      children: [
                        {
                          path: 'c/:channelName',
                          element: <ChannelPage />,
                        },
                        {
                          path: 'c/:channelName/:page',
                          element: <ChannelPage />,
                        },
                        {
                          path: 't/:threadId',
                          element: <ThreadPage />,
                        },
                        {
                          path: 't/:threadId/:slug',
                          element: <ThreadPage />,
                        },
                        {
                          path: 'inbox',
                          element: (
                            <RequirePermissionInbox children={<InboxPage />} />
                          ),
                        },
                        {
                          path: 'starred',
                          element: (
                            <RequirePermissionInbox
                              children={<StarredPage />}
                            />
                          ),
                        },
                        {
                          path: 'all',
                          element: (
                            <RequirePermissionInbox children={<AllPage />} />
                          ),
                        },
                        {
                          path: 'branding',
                          element: (
                            <RequirePermissionManage
                              children={<BrandingPage />}
                            />
                          ),
                        },
                        {
                          path: 'configurations',
                          element: (
                            <RequirePermissionManage
                              children={<ConfigurationsPage />}
                            />
                          ),
                        },
                        {
                          path: 'members',
                          element: (
                            <RequirePermissionManage
                              children={<MembersPage />}
                            />
                          ),
                        },
                        {
                          path: 'metrics',
                          element: (
                            <RequirePermissionManage
                              children={<MetricsPage />}
                            />
                          ),
                        },
                        {
                          path: 'plans',
                          element: (
                            <RequirePermissionManage children={<PlansPage />} />
                          ),
                        },
                        {
                          path: '',
                          element: <ChannelPage />,
                        },
                      ],
                    },
                    {
                      path: '',
                      element: <RedirectToLastPageViewed />,
                    },
                  ],
                },
          ],
        },
      ])}
    />
  );
}
