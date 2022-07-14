interface NotFoundResponse {
  notFound: boolean;
  revalidate: number;
}

export function NotFound(): NotFoundResponse {
  return {
    notFound: true,
    revalidate: 5,
  };
}
