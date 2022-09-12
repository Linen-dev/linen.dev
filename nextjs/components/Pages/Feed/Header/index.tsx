import React from 'react';

export default function Header() {
  return (
    <div className="p-6">
      <h1 className="inline-block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-200">
        Feed
      </h1>
      <p className="mt-2 text-md text-slate-700 dark:text-slate-400">
        Manage your community with ease.
      </p>
    </div>
  );
}
