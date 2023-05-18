import Layout from '@linen/ui/CardLayout';
import { GoMailRead } from '@react-icons/all-files/go/GoMailRead';

export default function VerifyRequest({}: {}) {
  return (
    <Layout>
      <div className="flex align-center text-center flex-row justify-center py-3">
        <div>
          <GoMailRead className="text-5xl align-center flex m-auto mb-5" />
          <p className="text-center">
            We&apos;ve sent you an email with a link.
            <br />
            Click the link to continue.
          </p>
        </div>
      </div>
    </Layout>
  );
}
