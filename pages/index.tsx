import { Paper, Text, Title } from '@mantine/core';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import prisma from '../client';
import PageLayout from '../components/layout/PageLayout';
import { accountId } from '../constants/examples';
import { channelIndex } from '../lib/slack';
// import { channels, threads } from '../constants/examples';

import styles from '../styles/Home.module.css';
import { Community } from './community';

// export async function getStaticProps() {
//   // const messages = await prisma.message.findMany();
//   // const parsedMessage = messages.map((message) => {
//   //   return {
//   //     body: message.body,
//   //     // Have to convert to string b/c Nextjs doesn't support date hydration -
//   //     // see: https://github.com/vercel/next.js/discussions/11498
//   //     sentAt: message.sentAt.toString(),
//   //   };
//   // });

//   return {
//     props: { messages: threads.threads },
//   };
// }

const Home: NextPage = (channels) => {
  return (
    <PageLayout navItems={channels}>
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
  console.log('channels :>> ', channels);
  let channelId;
  const result = { props: { channels } };
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
