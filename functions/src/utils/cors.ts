import { onRequest } from "firebase-functions/v2/https";
import cors = require("cors");
import { HandlerFunction } from "../types/HandlerFunction";

const corsOptions = {
  origin: "https://chat.openai.com/.com/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// (wrapper function, use instead of onRequest)
// handle cors middleware on request
export const corsRequest = (handler: HandlerFunction) => {
  return onRequest(async (req, res) => {
    cors(corsOptions)(req, res, async () => {
      await handler(req, res);
    });
  });
};
