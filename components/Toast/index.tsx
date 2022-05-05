import toast from 'react-hot-toast';
export { Toaster } from 'react-hot-toast';

const customToast = {
  icons: {
    successIcon: (
      <div className="flex-shrink-0">
        <svg
          className="h-6 w-6 text-green-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    ),

    errorIcon: (
      <div className="flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    ),
  },

  success(msg: string) {
    this.custom({ msg, icon: this.icons.successIcon });
  },

  error(msg: string) {
    this.custom({ msg, icon: this.icons.errorIcon });
  },

  custom(props: { msg: string; subText?: string; icon?: JSX.Element }) {
    toast.custom((t) => (
      <div
        className={`${
          t.visible
            ? 'transform ease-out duration-300 transition'
            : 'transition ease-in duration-100'
        } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
      >
        <div className="p-4">
          <div className="flex items-start">
            {props.icon ? props.icon : <></>}
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{props.msg}</p>
              {props.subText ? (
                <p className="mt-1 text-sm text-gray-500">{props.subText}</p>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    ));
  },
};

export { customToast as toast };
export default customToast;
