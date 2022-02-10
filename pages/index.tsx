import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import prisma from "../client";

import styles from "../styles/Home.module.css";
import { Community } from "./community";

export async function getStaticProps() {
  const messages = await prisma.message.findMany();
  const parsedMessage = messages.map((message) => {
    return {
      body: message.body,
      // Have to convert to string b/c Nextjs doesn't support date hydration -
      // see: https://github.com/vercel/next.js/discussions/11498
      sentAt: message.sentAt.toString(),
    };
  });
  return {
    props: { messages: parsedMessage },
  };
}

const Home: NextPage = ({ messages }) => {
  {
    console.log(messages);
  }
  return (
    <ul>
      hmmm
      {messages.map((message) => (
        <li>{message.body}</li>
      ))}
    </ul>
  );
};

export default Home;
