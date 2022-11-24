# Common build stage
FROM public.ecr.aws/docker/library/node:16 AS common-build-stage
COPY . ./app
WORKDIR /app
RUN npm install yarn -g
RUN yarn install
EXPOSE 3000


# Production build stage
FROM common-build-stage as production-build-stage
ENV NODE_ENV production
RUN yarn build:api
CMD ["yarn", "start:api"]
