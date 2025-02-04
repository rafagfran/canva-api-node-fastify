import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { app } from "../../index.js";

export const DesignRoutes = () => {
	app.register(create);
	app.register(read);
};

async function create(app: FastifyInstance) {
	app.post("/", (request: FastifyRequest, reply: FastifyReply) => {
		const data = request.body;
		return reply.status(200).send(data);
	});
}

async function read(app: FastifyInstance) {
	app.get("/", (request: FastifyRequest, reply: FastifyReply) => {
		return reply.status(200).send({ message: "Hello World" });
	});
}

