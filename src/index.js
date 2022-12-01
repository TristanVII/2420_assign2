// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });
const fs = require("fs").promises;

// Declare a route
fastify.get("/", async (request, reply) => {
  const indx = await fs.readFile("../html/index.html", { encoding: "utf-8" });
  reply.type("text/html");
  return indx;
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
