import { signOut, useSession } from '@linen/auth/client';
import CardLayout from '@linen/ui/CardLayout';
import ProfileForm from '@linen/ui/ProfileForm';
import axios, { AxiosRequestConfig } from 'axios';
import { api } from 'utilities/requests';

export default function Profile() {
  const session = useSession({ required: true });

  // dup with apps/web/components/layout/PageLayout/index.tsx
  const updateProfile = ({ displayName }: { displayName: string }) => {
    return api
      .put('/api/profile', {
        displayName,
      })
      .then(() => {
        window.location.reload();
      });
  };

  // dup with apps/web/components/layout/PageLayout/index.tsx
  const uploadAvatar = (data: FormData, options: AxiosRequestConfig) => {
    return axios.post('/api/profile/avatar', data, options).then(() => {
      window.location.reload();
    });
  };

  return (
    <>
      <CardLayout>
        {session.status === 'loading' ? (
          <>Loading...</>
        ) : (
          <>
            <ProfileForm
              currentUser={{
                id: session.data.user?.id!,
                displayName: session.data.user?.name!,
                profileImageUrl: session.data.user?.image!,
                authsId: session.data.user?.id!,
                username: session.data.user?.name!,
                externalUserId: null,
              }}
              onSubmit={async ({ displayName }) => {
                await updateProfile({ displayName });
              }}
              onUpload={uploadAvatar}
              api={api}
            />
            <div className="flex justify-center">
              <button
                className="cursor-pointer text-xs text-gray-400"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </CardLayout>
    </>
  );
}
