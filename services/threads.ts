import { threadIndex, threadCount } from '../lib/slack';
import serializeThread from '../serializers/thread';

interface IndexProps {
  channelId?: string;
  page: number;
}

export async function index({ channelId, page }: IndexProps) {
  const take = 10;
  const skip = (page - 1) * take;
  const [threads, total] = await Promise.all([
    threadIndex(channelId, take, skip),
    threadCount(channelId),
  ]);

  return {
    data: {
      threads: threads.map(serializeThread),
    },
    pagination: {
      totalCount: total,
      pageCount: Math.ceil(total / take),
      currentPage: page,
      perPage: take,
    },
  };
}
