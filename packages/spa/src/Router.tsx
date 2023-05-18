import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import ErrorPage from '@/pages/Error';
import SignIn from '@/pages/SignIn';
import RequireAuth from '@/hoc/RequireAuth';
import RedirectToLastPageViewed from '@/components/RedirectToLastPageViewed';
import Loading from '@/components/Loading';
import RedirectToLinen from '@/components/RedirectToLinen';
import RedirectToS from '@/components/RedirectToS';
const InboxPage = lazy(() => import('@/pages/Inbox'));
const StarredPage = lazy(() => import('@/pages/Starred'));
const AllPage = lazy(() => import('@/pages/All'));
const ChannelPage = lazy(() => import('@/pages/Channel'));
const ThreadPage = lazy(() => import('@/pages/Thread'));

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
                          element: (
                            <Suspense fallback={<Loading />}>
                              <ChannelPage />
                            </Suspense>
                          ),
                        },
                        {
                          path: 'c/:channelName/:page',
                          element: (
                            <Suspense fallback={<Loading />}>
                              <ChannelPage />
                            </Suspense>
                          ),
                        },
                        {
                          path: 't/:threadId',
                          element: (
                            <Suspense fallback={<Loading />}>
                              <ThreadPage />
                            </Suspense>
                          ),
                        },
                        {
                          path: 't/:threadId/:slug',
                          element: (
                            <Suspense fallback={<Loading />}>
                              <ThreadPage />
                            </Suspense>
                          ),
                        },
                        {
                          path: 'inbox',
                          element: (
                            <Suspense fallback={<Loading />}>
                              <InboxPage />
                            </Suspense>
                          ),
                        },
                        {
                          path: 'starred',
                          element: (
                            <Suspense fallback={<Loading />}>
                              <StarredPage />
                            </Suspense>
                          ),
                        },
                        {
                          path: 'all',
                          element: (
                            <Suspense fallback={<Loading />}>
                              <AllPage />
                            </Suspense>
                          ),
                        },
                        {
                          path: 'branding',
                          element: <RedirectToLinen path="/branding" />,
                        },
                        {
                          path: 'configurations',
                          element: <RedirectToLinen path="/configurations" />,
                        },
                        {
                          path: 'members',
                          element: <RedirectToLinen path="/members" />,
                        },
                        {
                          path: 'metrics',
                          element: <RedirectToLinen path="/metrics" />,
                        },
                        {
                          path: 'plans',
                          element: <RedirectToLinen path="/plans" />,
                        },
                        {
                          path: '',
                          element: (
                            <Suspense fallback={<Loading />}>
                              <ChannelPage />
                            </Suspense>
                          ),
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
