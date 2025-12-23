import { Application, RequestHandler } from "express";

export default class Middleware {
  _app: Application;

  constructor(app: Application) {
    this._app = app;
  }

  getApp(): Application {
    return this._app;
  }

 addMiddleware(
  pathorHandler: string | RequestHandler | RequestHandler[],
  handler?: RequestHandler | RequestHandler[]
): void {
  if (typeof pathorHandler === "string" && handler) {
    this._app.use(pathorHandler, ...(Array.isArray(handler) ? handler : [handler]));
  } else if (Array.isArray(pathorHandler)) {
    this._app.use(...pathorHandler);
  } else {
    this._app.use(pathorHandler as RequestHandler);
  }
}
}
