import { app } from "../index.js";
import { DesignRoutes } from "./v1/designRoutes.js";

export const routes = async () => {
	app.register(DesignRoutes, { prefix: "/design" });
};
