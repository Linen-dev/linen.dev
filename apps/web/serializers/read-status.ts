import { SerializedReadStatus } from '@linen/types'

function serialize (status: any): SerializedReadStatus {
  const thread = status.channel.threads[0]
  const message = thread?.messages[0]
  const lastReplyAt = message?.sentAt?.getTime()?.toString()
  return {
    channelId: status.channelId,
    lastReadAt: status.lastReadAt.toString(),
    lastReplyAt
  }
}

export default serialize
