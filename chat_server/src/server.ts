import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import * as express from "express";
import * as cors from "cors";
import { ApolloServer } from "apollo-server-express";

import { schema } from "./schema";
import { context } from "./context";

(async function () {
  const app = express();

  app.use(
    cors({
      origin: "*",
    })
  );

  const httpServer = createServer(app);

  const server = new ApolloServer({
    schema,
    context,
    introspection: true,
  });

  await server.start();

  server.applyMiddleware({ app });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect() {
        return context;
      },
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    }
  );

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => subscriptionServer.close());
  });

  const PORT = 4000;

  httpServer.listen(PORT, () => {
    console.log(
      `\tServer is now running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
})();

// const server = new ApolloServer({
//   schema,
//   context,
// });

// server.listen().then(async ({ url }) => {
//   console.log(`\
//     🚀 Server ready at: ${url}
//     ⭐️ See sample queries: http://pris.ly/e/ts/graphql#using-the-graphql-api
//       `);
// });
