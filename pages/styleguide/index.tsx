import Layout from './Layout';
import Example from './Example';
import Message from '../../components/Message';

export default function Styleguide() {
  return (
    <Layout>
      <Example header="Message">
        <Message text="Hello, world!" />
        <Message text="Hello, world! :)" />
        <Message text="Hey, <@John>!" />
        <Message text="Hey, <@John>!" />
      </Example>
    </Layout>
  );
}
