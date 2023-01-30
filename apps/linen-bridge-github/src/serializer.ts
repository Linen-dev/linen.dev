import * as LinenTypes from '@linen/types';
import * as GitHubTypes from '@octokit/webhooks-types';

export default class Serializer {
  static buildExternalId(
    channelId: string,
    owner: string,
    repo: string,
    issueNumber: number
  ) {
    return `${channelId}:${owner}:${repo}:issue:${issueNumber}`;
  }

  static extractDataFromExternalId(externalId: string): {
    channelId: string;
    owner: string;
    repo: string;
    issueNumber: number;
  } {
    const [channelId, owner, repo, _, issueNumber] = externalId.split(':');
    return { channelId, owner, repo, issueNumber: Number(issueNumber) };
  }

  static buildExternalMessageId(
    channelId: string,
    owner: string,
    repo: string,
    issueNumber: number,
    messageId: number
  ) {
    return `${this.buildExternalId(
      channelId,
      owner,
      repo,
      issueNumber
    )}:${messageId}`;
  }

  static githubIssueToLinenThread(
    issue: GitHubTypes.Issue,
    authorId: string,
    channelId: string,
    accountId: string,
    externalThreadId: string
  ): LinenTypes.threadPostType {
    return {
      title: `${issue.title} #${issue.number}`,
      body: issue.body || '',
      authorId,
      channelId,
      externalThreadId,
      accountId,
    };
  }

  static githubUserToLinenUser(
    input: GitHubTypes.User,
    accountsId: string
  ): LinenTypes.userPostType {
    return {
      accountsId,
      displayName: input.name || input.login,
      profileImageUrl: input.avatar_url,
      externalUserId: input.id.toString(),
    };
  }

  static githubCommentToLinenMessage(
    input: GitHubTypes.IssueCommentCreatedEvent,
    authorId: string,
    channelId: string,
    accountId: string,
    threadId: string
  ): LinenTypes.messagePostType {
    return {
      body: input.comment.body || '',
      authorId,
      channelId,
      externalMessageId: this.buildExternalMessageId(
        channelId,
        input.repository.owner.login,
        input.repository.name,
        input.issue.number,
        input.comment.id
      ),
      accountId,
      threadId,
    };
  }
}
