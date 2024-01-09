import { Request } from "express";
import { OAuth2Client } from "google-auth-library";
import { drive_v3, google } from "googleapis";
import { ValidatedData } from "./utils/validate";

declare global {
  namespace Express {
    interface Request {
      driveContext: DriveRequestContext;
    }
  }
}

interface DriveRequestContext {
  driveClient: drive_v3.Drive;
  documentId?: string;
}

export const handleDriveContext = (
  req: Request,
  validatedData: ValidatedData
) => {
  const driveClient = createDriveClient(validatedData.accessToken);
  req.driveContext = {
    driveClient: driveClient,
    documentId: validatedData.documentId,
  };
};

const createDriveClient = (access_token: string) => {
  const authClient = new OAuth2Client();
  authClient.setCredentials({
    access_token,
  });

  return google.drive({
    version: "v3",
    auth: authClient,
  });
};
