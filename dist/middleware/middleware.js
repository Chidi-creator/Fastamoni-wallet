"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Middleware {
    constructor(app) {
        this._app = app;
    }
    getApp() {
        return this._app;
    }
    addMiddleware(pathorHandler, handler) {
        if (typeof pathorHandler === "string" && handler) {
            this._app.use(pathorHandler, ...(Array.isArray(handler) ? handler : [handler]));
        }
        else if (Array.isArray(pathorHandler)) {
            this._app.use(...pathorHandler);
        }
        else {
            this._app.use(pathorHandler);
        }
    }
}
exports.default = Middleware;
//# sourceMappingURL=middleware.js.map