import Spinner from '@linen/ui/Spinner';

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100vh',
        alignItems: 'center',
      }}
    >
      <Spinner />
    </div>
  );
}
