import cors from "@fastify/cors";
import axios from "axios";
import "dotenv/config";
import Fastify, { type FastifyReply } from "fastify";
import crypto from "node:crypto";
import { routes } from "./routes/routes.js";

const verifierStore = new Map<string, string>();
const redirectUrl = encodeURIComponent("http://127.0.0.1:3001/oauth/redirect");

export const app = Fastify({
	// logger: {
	// 	transport: {
	// 		target: "pino-pretty",
	// 		options: {
	// 			colorize: true,
	// 			translateTime: "HH:MM:ss Z",
	// 			ignore: "pid,hostname",
	// 		},
	// 	},
	// },
});

await app.register(cors);

app.get("/ping", async (request, reply: FastifyReply) => {
	return reply
		.status(200)
		.send({ message: "pong", status: "Server is Runing" });
});

app.get("/auth", async (request, reply: FastifyReply) => {
	const codeVerifier = crypto.randomBytes(96).toString("base64url");
	const codeChallenge = crypto
		.createHash("sha256")
		.update(codeVerifier)
		.digest("base64url");

	const sessionId = crypto.randomUUID();
	verifierStore.set(sessionId, codeVerifier);

	const oauthUrl = `https://www.canva.com/api/oauth/authorize?code_challenge_method=s256&response_type=code&client_id=${process.env.CANVA_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=app:read%20app:write%20design:content:read%20design:meta:read%20design:content:write%20design:permission:read%20design:permission:write%20folder:read%20folder:write%20folder:permission:read%20folder:permission:write%20asset:read%20asset:write%20comment:read%20comment:write%20brandtemplate:meta:read%20brandtemplate:content:read%20profile:read&code_challenge=${codeChallenge}&state=${sessionId}`;

	return reply.status(200).send({ url: oauthUrl });
});

app.get("/oauth/redirect", async (request, reply: FastifyReply) => {
	const { code, state } = request.query as { code?: string; state?: string };

	if (!code) {
		return reply.status(400).send({ message: "Authorization code is missing" });
	}

	const codeVerifier = verifierStore.get(state || "");

	if (!codeVerifier) {
		return reply
			.status(400)
			.send({ message: "Invalid or expired code_verifier" });
	}

	verifierStore.delete(state || "");

	try {

		const credentials = `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`;
		const encodedCredentials = Buffer.from(credentials).toString("base64");

		const body = new URLSearchParams({
			grant_type: "authorization_code",
			code_verifier: codeVerifier,
			code,
			redirect_uri: "http://127.0.0.1:3001/oauth/redirect",
		}).toString();

		const reponse = await axios.post(
			"https://www.canva.com/api/oauth/token",
			body,
			{
				headers: {
					Authorization: `Basic ${encodedCredentials}`,
					"Content-Type": "application/x-www-form-urlencoded",
				},
			},
		);

		return reply.status(200).send(reponse.data);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.log({ message: error.message, status: error.status });
			return reply
				.status(error.status || 500)
				.send({ message: error.message, status: error.status });
		}

		return reply.status(500).send({ message: "Internal Server Error", error });
	}
});

app.register(routes);

try {
	await app.listen({ port: 3001 });
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
