import { Paper, Text, Title } from '@mantine/core';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import prisma from '../client';
import PageLayout from '../components/layout/PageLayout';
import { channels, threads } from '../constants/examples';

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

const Home: NextPage = ({ channels }) => {
  console.log('messages :>> ', channels);
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
        <Title order={4}>Landing Page Dashboard</Title>
      </Paper>
    </PageLayout>
  );
};

export const getServerSideProps = async () => {
  return { props: { channels } };
};

export default Home;
