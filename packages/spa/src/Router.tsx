import { lazy } from 'react';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorPage from './pages/Error';
import SignIn from './pages/SignIn';
import RequireAuth from './hoc/RequireAuth';
import RedirectToLastPageViewed from './components/RedirectToLastPageViewed';
import InboxPage from './pages/Inbox';
const ChannelPage = lazy(() => import('./pages/Channel'));
const ThreadPage = lazy(() => import('./pages/Thread'));

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
