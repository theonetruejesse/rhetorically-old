import { logger } from "firebase-functions/v2";
import { Request, Response } from "express";
import { docs_v1, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { corsRequest } from "./cors";
import { BadRequestError, HandlerFunction, UnauthorizedError } from "./types";

declare global {
  namespace Express {
    interface Request {
      docContext: DocRequestContext;
    }
  }
}

export interface DocRequestContext {
  documentId: string;
  docsClient: docs_v1.Docs;
}

interface ValidatedData {
  documentId: string;
  accessToken: string;
}

const validateDocRequest = (req: Request): ValidatedData => {
  const documentId = req.query.documentId as string;
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken)
    throw new UnauthorizedError("Unauthorized: no access token provided");

  if (!documentId) throw new BadRequestError("Missing query: documentId");

  return { documentId, accessToken };
};

const createDocClient = (access_token: string) => {
  const authClient = new OAuth2Client();
  authClient.setCredentials({
    access_token,
  });

  return google.docs({
    version: "v1",
    auth: authClient,
  });
};

// middleware for all google doc api requests
// (wrapper function, use instead of onRequest)
// output: inserts documentContent into req, with validated id + google doc api client
export const docRequest = (handler: HandlerFunction) => {
  return corsRequest(async (req: Request, res: Response) => {
    try {
      const validatedData = validateDocRequest(req);
      const docsClient = createDocClient(validatedData.accessToken);

      req.docContext = {
        documentId: validatedData.documentId,
        docsClient,
      };

      await handler(req, res);
    } catch (error: any) {
      logger.log("error", error); // Log the error for debugging.

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
