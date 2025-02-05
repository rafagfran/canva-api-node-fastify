import axios from "axios";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { app } from "../../index.js";

export const DesignRoutes = () => {
	app.register(create);
	app.register(read);
};

async function create(app: FastifyInstance) {
	app.post("/", (request: FastifyRequest, reply: FastifyReply) => {
		const response = axios.post(
			"https://api.canva.com/rest/v1/designs",
			{
				design_type: {
					type: "preset",
					name: "doc",
				},
				asset_id: "Msd59349ff",
				title: "My Holiday Presentation",
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.CANVA_API_KEY}`,
					"Content-Type": "application/json",
				},
			},
		);
		return reply.status(201).send(response);
	});
}

async function read(app: FastifyInstance) {
	app.get("/", (request: FastifyRequest, reply: FastifyReply) => {
		return reply.status(200).send({ message: "Hello World" });
	});
}
