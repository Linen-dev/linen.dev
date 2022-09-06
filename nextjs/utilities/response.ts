interface NotFoundResponse {
  notFound: boolean;
}

export function NotFound(): NotFoundResponse {
  return {
    notFound: true,
  };
}

export function RedirectTo(url: string) {
  return {
    redirect: {
      destination: url,
      permanent: false,
    },
  };
}
