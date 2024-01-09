import { corsRequest } from "./cors";
import { UnauthorizedError, BadRequestError, HandlerFunction } from "../types";
import { ValidatedData, validateRequest } from "./utils/validate";
import { logger } from "firebase-functions/v2";
import { Request, Response } from "express";
import { handleDocContext } from "./doc";
import { handleDriveContext } from "./drive";

type ContextHandler = (req: Request, validatedData: ValidatedData) => void;

// for selecting handler type
// import contextOptions rather than objects directly
type ContextHandlers = {
  doc: ContextHandler;
  drive: ContextHandler;
};
export const contextOptions: ContextHandlers = {
  doc: handleDocContext,
  drive: handleDriveContext,
};

// middleware for all api requests
// (wrapper function, use instead of onRequest)
type RequestConfig = {
  contextType: ContextHandler;
  documentIdOptional: boolean;
};
export const apiRequest = (
  handler: HandlerFunction,
  config: RequestConfig = {
    // default: assume documentId needed + accessing docs api
    documentIdOptional: false,
    contextType: contextOptions.doc,
  }
) => {
  return corsRequest(async (req: Request, res: Response) => {
    try {
      const validatedData = validateRequest(req, config.documentIdOptional);
      config.contextType(req, validatedData);
      await handler(req, res);
    } catch (error: any) {
      logger.log("error", error); // Log the error for debugging.

      // expand more errors
      if (
        error instanceof UnauthorizedError ||
        error instanceof BadRequestError
      ) {
        res.status(error.statusCode).send(error.message);
      } else {
        // For all other types of errors, send a generic server error response
        res.status(500).send("Internal Server Error!");
      }
    }
  });
};
