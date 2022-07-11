interface NotFoundResponse {
  notFound: boolean;
}

export function NotFound(): NotFoundResponse {
  return {
    notFound: true,
  };
}
