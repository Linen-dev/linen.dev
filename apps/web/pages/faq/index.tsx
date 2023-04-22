import Layout from 'components/layout/BlankLayout';
import Accordion from '@linen/ui/Accordion';
import Logo from '@linen/ui/LinenLogo';
import H1 from '@linen/ui/H1';
import styles from './index.module.scss';

const faqs = [
  {
    question: 'How do I make sure our Linen content show up at Google?',
    answer: `      
    Make sure you add links to your Linen community.
    The more links you have the more likely Google will index your content. 
    Most commonly we see users add links to their Linen instance in their landing page footer or Github repo. We see a 2-3x difference between traffic of communities who has backlinks and those who don’t.
      `,
  },
  {
    question: 'How long does it take to get my content indexed by Google?',
    answer: `Depending on the community and the number of links to it it can take anywhere from a few days to a few weeks. 
    If you are not seeing any traffic after a few weeks please contact us at help@linen.dev`,
  },
  {
    question: 'How do I check if my content is showing up on Google?',
    answer: `
    You can check by Googling site:linen.dev/s/YOUR_COMMUNITY_NAME or your custom domain if you have set one
    `,
  },
  {
    question: 'Does the free version get indexed by Google?',
    answer: 'Yes! Google will index all the content on the free tier.',
  },
  {
    question: 'How does Linen Slack syncing work?',
    answer: `Linen will sync all conversations that it has access to. If you are on the free tier it will pull the last 90 days of history from Slack. If you are on the premium tier it will sync your entire history of conversation
      
      If you would like access to the entire history without upgrading to a premium Slack account you can download the link https://slack.com/help/articles/201658943-Export-your-workspace-data. Then you have to upload it to our server and it will automatically pull the data. 
      
      For the file upload sync please check back after a few hours to verify if it is there. If the history isn’t there feel free to contact us at help@linen.dev
      `,
  },
  {
    question: 'How can I get my entire Slack history on Linen?',
    answer: `If you are on the preimum version of Slack it will automatically fetch the entire history.
    If you would like access to the entire history without upgrading to a premium Slack account you can download the link https://slack.com/help/articles/201658943-Export-your-workspace-data. 
    You can then upload it under linen.dev/s/YOUR_COMMUNITY_NAME/configurations
    `,
  },
  {
    question: 'How long does the sync take?',
    answer: `
    It should take a few minutes to a few hours depending on the size of your Slack/Discord community. If it takes longer than 24 hours please contact us at help@linen.dev
    `,
  },
  {
    question: 'Why does my Discord content is not being synced?',
    answer: `
    For Discord we sync on an hourly basis. We're working on making that near real time soon. If you are not seeing content after 24 hours please contact us at help@linen.dev
    `,
  },
  {
    question: 'How do I get Linen on my domain after upgrading to Premium?',
    answer: `      
      Navigate to Linen.dev/s/YOUR_COMMUNITY_NAME/branding and set your domain. You will need to add a CNAME record to your DNS provider. The CNAME record should show up once you fill in the Custom domain.
      `,
  },
];

export default function Example() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className={styles.container}>
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <H1 className="text-center">Frequently asked questions</H1>
          <dl className="mt-6 space-y-6 divide-y divide-gray-200">
            {faqs.map((faq) => (
              <Accordion
                key={faq.question}
                header={faq.question}
                expanded={false}
              >
                {faq.answer}
              </Accordion>
            ))}
          </dl>
        </div>
      </div>
    </Layout>
  );
}
