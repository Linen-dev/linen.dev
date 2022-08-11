export default function Sentry() {
  return (
    <button
      type="button"
      onClick={() => {
        throw new Error('[test] frontend, forced failure');
      }}
    >
      Throw error
    </button>
  );
}
