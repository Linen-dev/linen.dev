import { Paper, Title } from '@mantine/core';
import type { NextPage } from 'next';
import PageLayout from '../components/layout/PageLayout';
import { channelIndex } from '../lib/models';

const Home: NextPage = (channels) => {
  return (
    <div>Coming soon</div>
    // <PageLayout
    //   navItems={channels}
    //   slackUrl={undefined}
    //   users={[]}
    //   settings={}
    // >
    //   <Paper
    //     shadow="md"
    //     padding="xl"
    //     style={{
    //       width: '100%',
    //       border: '1px solid #e9ecef',
    //       minHeight: '400px',
    //     }}
    //   >
    //     <Title order={4}>Select a channel on the left.</Title>
    //   </Paper>
    // </PageLayout>
  );
};

export const getServerSideProps = async () => {
  const channels = (await channelIndex('')) || [];
  let channelId;
  const result = { props: { channels } } as any;
  const general = channels.find(
    (c) =>
      c.channelName === 'general' || c.channelName === 'feedback-and-requests'
  );
  if (general) {
    channelId = general.id;
  } else if (channels.length > 0) {
    channelId = channels[0].id;
  }
  if (channelId) {
    result.redirect = {
      permanent: false,
      destination: `/c/${channelId}`,
    };
  }
  return result;
};

export default Home;
