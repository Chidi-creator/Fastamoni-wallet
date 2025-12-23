import Middleware from "./middleware";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";   
import requestLogger from "./logger.middleware"; 
import UserRoutes from "@deliverymen/user.delivery";
import AuthRoutes from "@deliverymen/auth.delivery";

const app = express();
const middleware = new Middleware(app);

const setUpRoutes = (middleware: Middleware) => {
  // Healthcheck route
  middleware.addMiddleware("/healthcheck", (req: Request, res: Response) => {
    res.status(200).send("fastamoni Server is up and running!");
  });

  middleware.addMiddleware("/users", UserRoutes);
  middleware.addMiddleware("/auth", AuthRoutes);

};

const setUpMiddleware = () => {
  middleware.addMiddleware(helmet());
  middleware.addMiddleware(cors());
  middleware.addMiddleware(express.json());
  
  // Add request logging middleware
  middleware.addMiddleware(requestLogger);
  
  middleware.addMiddleware(passport.initialize());

  setUpRoutes(middleware);
};

setUpMiddleware();

export default middleware;
