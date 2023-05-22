import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import ErrorPage from '@/pages/Error';
import SignIn from '@/pages/SignIn';
import RequireAuth from '@/hoc/RequireAuth';
import RedirectToLastPageViewed from '@/components/RedirectToLastPageViewed';
import InProgress from '@/components/InProgress';
import RedirectToS from '@/components/RedirectToS';
import RequireManagerAuth from '@/hoc/RequireManagerAuth';
import InboxPage from '@/pages/Inbox';
import StarredPage from '@/pages/Starred';
import AllPage from '@/pages/All';
import ChannelPage from '@/pages/Channel';
import ThreadPage from '@/pages/Thread';
import BrandingPage from '@/pages/Branding';
import ConfigurationsPage from '@/pages/Configurations';
import MembersPage from '@/pages/Members';
import PlansPage from '@/pages/Plans';

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
                      element: <Outlet />,
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
                          element: <InboxPage />,
                        },
                        {
                          path: 'starred',
                          element: <StarredPage />,
                        },
                        {
                          path: 'all',
                          element: <AllPage />,
                        },
                        {
                          path: 'branding',
                          element: (
                            <RequireManagerAuth children={<BrandingPage />} />
                          ),
                        },
                        {
                          path: 'configurations',
                          element: (
                            <RequireManagerAuth
                              children={<ConfigurationsPage />}
                            />
                          ),
                        },
                        {
                          path: 'members',
                          element: (
                            <RequireManagerAuth children={<MembersPage />} />
                          ),
                        },
                        {
                          path: 'metrics',
                          element: <InProgress />,
                        },
                        {
                          path: 'plans',
                          element: (
                            <RequireManagerAuth children={<PlansPage />} />
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
