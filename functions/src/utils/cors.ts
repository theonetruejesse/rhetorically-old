import { onRequest } from "firebase-functions/v2/https";
import cors = require("cors");
import * as express from "express";

// Define the HandlerFunction type
type HandlerFunction = (
  req: express.Request,
  res: express.Response
) => Promise<void> | void;

// Define CORS options
const corsOptions = {
  origin: "https://chat.openai.com/.com/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// Utility function to apply CORS
// (wrapper function, use instead of onRequest)
export const corsRequest = (handler: HandlerFunction) => {
  return onRequest(async (req, res) => {
    cors(corsOptions)(req, res, async () => {
      await handler(req, res);
    });
  });
};
