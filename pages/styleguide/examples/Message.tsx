import Example from '../Example';
import Message from '../../../components/Message';

export default function Styleguide() {
  return (
    <Example header="Message">
      <Message text="Hello, world!" />
      <Message text="Hello, world! :)" />
      <Message text="Hey, <@John>!" />
      <Message text="Hey, <@John>!" />
      <Message text="Hey, <https://linen.dev>!" />
      <Message text="Hey, <http://linen.dev>!" />
      <Message text="Hey, `const answer = 42`!" />
      <Message text="Has anyone ran into this error before? Just trying to run a spec. Other things like `db:migrate` fail for `PG:InsufficientPrivilege` as well. ```An error occured while loading ./spec/models/user.rb```" />
    </Example>
  );
}
