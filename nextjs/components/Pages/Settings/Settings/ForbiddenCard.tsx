import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export function ForbiddenCard() {
  return (
    <div className="rounded-md bg-yellow-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Attention needed
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              To manage the community you need to be an admin. You current role
              doesn&apos;t have enough permissions. If you have any questions,
              please contact your community manager or send us an email at{' '}
              <a href="mailto:help@linen.dev">help@linen.dev</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
