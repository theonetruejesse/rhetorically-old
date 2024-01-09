import { onRequest } from "firebase-functions/v2/https";
import cors = require("cors");
import { HandlerFunction } from "../types";

const corsOptions = {
  origin: "https://chat.openai.com/.com/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// cors middleware for handling requests
// (wrapper function, use instead of onRequest)
export const corsRequest = (handler: HandlerFunction) => {
  return onRequest(async (req, res) => {
    cors(corsOptions)(req, res, async () => {
      await handler(req, res);
    });
  });
};
