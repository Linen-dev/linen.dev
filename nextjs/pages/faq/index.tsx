import Layout from 'components/layout/BlankLayout';
import classNames from 'classnames';
import { Disclosure } from '@headlessui/react';
import { FiChevronDown } from 'react-icons/fi';
import Logo from 'components/Logo/Linen';
import H1 from 'components/H1';

const faqs = [
  {
    question: "What's the best thing about Linen?",
    answer:
      'Linen is an async first, open source community chat tool designed to be searchable by crawlers.',
  },
  // More questions...
];

export default function Example() {
  return (
    <Layout>
      <div className="flex justify-center mt-12">
        <Logo />
      </div>
      <div className="mx-auto max-w-7xl py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl divide-y-2 divide-gray-200">
          <H1 className="text-center">Frequently asked questions</H1>
          <dl className="mt-6 space-y-6 divide-y divide-gray-200">
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt className="text-lg">
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-400">
                        <span className="font-medium text-gray-900">
                          {faq.question}
                        </span>
                        <span className="ml-6 flex h-7 items-center">
                          <FiChevronDown
                            className={classNames(
                              open ? '-rotate-180' : 'rotate-0',
                              'h-6 w-6 transform'
                            )}
                            aria-hidden="true"
                          />
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base text-gray-500">{faq.answer}</p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </Layout>
  );
}
