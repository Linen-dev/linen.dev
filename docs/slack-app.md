## Set up Slack for local development.

The way to test Slack sync requires each developer to have their own Slack app since Slack API requires a specific a publically webhook and redirect url to be set.

To set up Linen's Slack app you need to follow the steps below:

1. Get an invite to Linen's Ngrok account and set up ngrok's local CLI
2. Setup ngrok with `ngrok http --region=us --hostname=linen-kam.ngrok.io 3000` Replace kam with your name
3. Make a copy of devSetup/sampleAppManifest.yml and change redirect_urls to https://linen-YOURNAME.ngrok.io/api/oauth and request_url to https://linen-YOURNAME.ngrok.io/api/webhook
4. Create a new Slack app at https://api.slack.com/apps?new_app=1 and click `From an app manifest`
5. Paste in the copy of manifest with your modifications
6. Navigate to the newly created app's `Basic Information` in slack
7. Copy `Client ID` and `Client Secret` and paste them into the `.env` file for `NEXT_PUBLIC_SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`
8. Set `NEXT_PUBLIC_REDIRECT_URI` to `https://linen-YOURNAME.ngrok.io/api/oauth` in .env file
9. Start linen with `yarn start` and sign up for a new account localhost:3000/signup and install the app to a workspace i.e Linen's workspace or your own custom one (Linen only shows channels with more than 20 threads so probably best to use Linen's workspace)
10. Open up Postman or use curl and hit `localhost:3000/api/sync?account_id=7649c602-5a12-4f29-a8f6-66e288a243eb` - replace account_id with your account id - you can find the accountId in your local postgres database. This will sync all the Slack channels and threads with your Linen account.

## Slack sync

#### Users

We have implemented these ways to sync users data into our app:

- [x] initial slack sync, triggered by onboarding process. The sync list all users and persist into our database.
- [x] team_join events from slack webhook, this event contains new users data that we persist into our database.
- [x] user_profile_changed event from slack webhook, this event contains updated data from users
- [x] update existing users when re-run sync process
- [ ] validate if the event has newer data than the existing one
- [ ] implement a queue service to work with the webhook

> Slack Events API: The app should respond to the event request with an HTTP 2xx within three seconds. If it does not, we'll consider the event delivery attempt failed. After a failure, we'll retry three times, backing off exponentially.
