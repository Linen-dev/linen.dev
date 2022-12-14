import { SerializedReadStatus } from '@linen/types'

function serialize (status: any): SerializedReadStatus {
  const thread = status.channel.threads[0]
  const lastReplyAt = thread?.sentAt?.toString() || null
  return {
    channelId: status.channelId,
    lastReadAt: status.lastReadAt.toString(),
    lastReplyAt
  }
}

export default serialize
