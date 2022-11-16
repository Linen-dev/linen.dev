import toast from 'react-hot-toast';
export { Toaster } from 'react-hot-toast';
import { GoCheck, GoInfo, GoAlert } from 'react-icons/go';

const customToast = {
  icons: {
    successIcon: <GoCheck className="h-6 w-6 text-green-400" />,
    errorIcon: <GoAlert className="h-6 w-6 text-red-400" />,
    infoIcon: <GoInfo className="h-6 w-6 text-blue-400" />,
  },

  success(msg: string, subText?: string) {
    this.custom({ msg, subText, icon: this.icons.successIcon });
  },

  error(msg: string, subText?: string) {
    this.custom({ msg, subText, icon: this.icons.errorIcon });
  },

  info(msg: string, subText?: string) {
    this.custom({ msg, subText, icon: this.icons.infoIcon });
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
