FROM node:10 as build-env
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run build

FROM node:10-alpine
WORKDIR /app
COPY --from=build-env /app /app
ENV PATH=$PATH:/app/node_modules/.bin
EXPOSE 80
ENTRYPOINT ["npm", "run"]
CMD ["start"]