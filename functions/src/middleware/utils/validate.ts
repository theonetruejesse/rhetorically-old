import { BadRequestError, UnauthorizedError } from "../../types";
import { Request } from "express";

export interface ValidatedData {
  accessToken: string;
  documentId: string | undefined;
}

export const validateRequest = (
  req: Request,
  documentIdOptional: boolean
): ValidatedData => {
  const documentId = req.query.documentId as string;
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken)
    throw new UnauthorizedError("Unauthorized: no access token provided");

  // listDocs endpoint does not require documentId
  if (!documentId && !documentIdOptional)
    throw new BadRequestError("Missing query: documentId");

  return { accessToken, documentId };
};
