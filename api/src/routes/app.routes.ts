import { Router } from "express";
import { userRouter } from "@/app/user/user.routes";
import { shipmentRouter } from "@/app/shipment/shipment.routes";
import { quoteRouter } from "@/app/quote/quote.routes";

import { csrfRouter } from "@/routes/csrf.route";

interface RouteConfig {
  path: string;
  router: Router;
}

const healthRouter = Router();
healthRouter.get("/", (req, res) => {
  res.status(200).send("ok");
});

export const routes: RouteConfig[] = [
  { path: "/health", router: healthRouter },
  { path: "/users", router: userRouter },
  { path: "/csrf-token", router: csrfRouter },
  { path: "/shipments", router: shipmentRouter },
  { path: "/quotes", router: quoteRouter },
];
