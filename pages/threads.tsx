export default function FirstThread() {
  return <h1>First Post</h1>;
}

export async function getServerSideProps(context) {
  return {
    props: {
      // props for your component
    },
  };
}
