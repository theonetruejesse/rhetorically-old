import { docs_v1, google } from "googleapis";
import { DocHandler } from "../endpoints/docs/utils/handlers";
import { OAuth2Client } from "google-auth-library";
import { ValidatedData } from "./utils/validate";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      docContext: DocRequestContext;
    }
  }
}

interface DocRequestContext {
  documentId: string;
  docClient: docs_v1.Docs;
  docHandler: DocHandler;
}

export const handleDocContext = (
  req: Request,
  validatedData: ValidatedData
) => {
  const docClient = createDocClient(validatedData.accessToken);
  if (!validatedData.documentId) throw new Error("invalid documentId");
  req.docContext = {
    documentId: validatedData.documentId,
    docClient: docClient,
    docHandler: new DocHandler(docClient, validatedData.documentId),
  } as DocRequestContext;
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
