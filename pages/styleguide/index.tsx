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
        <Message text="Hey, <https://linen.dev>!" />
        <Message text="Hey, <http://linen.dev>!" />
        <Message text="Hey, `const answer = 42`!" />
      </Example>
    </Layout>
  );
}
