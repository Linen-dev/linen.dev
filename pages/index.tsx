import { Paper, Title } from '@mantine/core';
import type { NextPage } from 'next';
import PageLayout from '../components/layout/PageLayout';
import { accountId } from '../constants/examples';
import { channelIndex } from '../lib/slack';

const Home: NextPage = (channels) => {
  return (
    <PageLayout navItems={channels} communityName={undefined}>
      <Paper
        shadow="md"
        padding="xl"
        style={{
          width: '100%',
          border: '1px solid #e9ecef',
          minHeight: '400px',
        }}
      >
        <Title order={4}>Select a channel on the left.</Title>
      </Paper>
    </PageLayout>
  );
};

export const getServerSideProps = async () => {
  const channels = (await channelIndex(accountId)) || [];
  let channelId;
  const result = { props: { channels } } as any;
  const general = channels.find((c) => c.channelName === 'general');
  if (general) {
    channelId = general.id;
  } else if (channels.length > 0) {
    channelId = channels[0].id;
  }
  if (channelId) {
    result.redirect = {
      permanent: false,
      destination: `/channel/${channelId}`,
    };
  }
  return result;
};

export default Home;
