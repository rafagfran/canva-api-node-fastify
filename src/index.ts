import Fastify, { type FastifyReply } from "fastify";
import { routes } from "./routes/routes.js";

export const app = Fastify({
	logger: true,
});

app.get("/ping", async (request, reply: FastifyReply) => {
	return reply.status(200).send({ message: "pong" , status: "Server is Runing"});
});

app.register(routes);

try {
	await app.listen({ port: 3000 });
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
