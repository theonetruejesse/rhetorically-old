import { logger } from "firebase-functions/v2";
import { Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "../types/Errors";
import { docs_v1, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { corsRequest } from "./cors";
import { HandlerFunction } from "../types/HandlerFunction";

interface ValidatedData {
  documentId: string;
  accessToken: string;
}

export interface DocRequestContext {
  documentId: string;
  docsClient: docs_v1.Docs;
}

const validateDocRequest = (req: Request): ValidatedData => {
  const documentId = req.query.documentId as string;
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken)
    throw new UnauthorizedError("Unauthorized: no access token provided");

  if (!documentId) throw new BadRequestError("Missing query: documentId");

  return { documentId, accessToken };
};

// (wrapper function, use instead of onRequest)
// handle cors middleware on request
export const docRequest = (handler: HandlerFunction) => {
  return corsRequest(async (req: Request, res: Response) => {
    try {
      const validatedData = validateDocRequest(req);

      const authClient = new OAuth2Client();
      authClient.setCredentials({
        access_token: validatedData.accessToken,
      });

      const docsClient = google.docs({
        version: "v1",
        auth: authClient,
      });

      // docContext defined in src/types/express.d.ts
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
