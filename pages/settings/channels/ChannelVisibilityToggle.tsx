import { channels } from '@prisma/client';
import { Field, Form, Formik } from 'formik';
import Button from '../../../components/Button';

interface Props {
  channels: channels[];
}

export default function ChannelVisibilityToggle({ channels }: Props) {
  const rows = channels.map((channel, channelIdx) => (
    <div className="relative flex items-start" key={channel.id}>
      <div className="flex items-center h-5">
        <Field
          name={`channels.${channelIdx}.hidden`}
          type="checkbox"
          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor="comments" className="font-medium text-gray-700">
          {channel.channelName}
        </label>
      </div>
    </div>
  ));

  return (
    <Formik
      initialValues={{
        channels,
      }}
      onSubmit={async (values) => {
        const channels = values.channels.map((channel) => ({
          id: channel.id,
          hidden: channel.hidden,
        }));
        fetch('/api/channels', {
          method: 'PUT',
          body: JSON.stringify({ channels }),
        })
          .then((response) => response.json())
          .then(() => {
            alert('Saved successfully!');
          });
      }}
    >
      <Form>
        <fieldset className="space-y-2">
          <legend className="text-lg font-medium text-gray-900">
            Hidden Channels
          </legend>
          {rows}
          <Button type="submit">Submit</Button>
        </fieldset>
      </Form>
    </Formik>
  );
}
