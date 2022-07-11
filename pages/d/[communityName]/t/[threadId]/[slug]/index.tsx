import {
  GetServerSidePropsContext,
} from 'next';
import { threadGetStaticProps } from '../../../../../../services/threads';
import Thread from '../../../../../../components/Pages/Thread/Thread';

export default Thread;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return threadGetStaticProps(context, false);
}
