const navigation = {
  main: [
    { name: 'Privacy', href: '/legal/privacy' },
    { name: 'Terms', href: '/legal/terms' },
    { name: 'Support', href: 'mailto:help@linen.dev' },
    { name: 'Communities', href: '/communities' },
    { name: 'FAQ', href: '/faq' },
  ],
};

export default function Footer() {
  return (
    <footer>
      <div className="max-w-7xl mx-auto pt-16 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav
          className="-mx-5 -my-2 flex flex-wrap justify-center"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              <a
                href={item.href}
                className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                target="_blank"
                rel="noreferrer"
              >
                {item.name}
              </a>
            </div>
          ))}
        </nav>
        <p className="mt-8 text-center text-base text-gray-500 dark:text-gray-400">
          &copy; 2023 Linen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
