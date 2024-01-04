import { GetSignedUrlConfig } from "@google-cloud/storage";

export const GOOGLE_AUTH_SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/drive.readonly",
];

export const STORAGE_BUCKET = "gs://rhetorically-98ba2.appspot.com";

// read request, never expire
export const BUCKET_URL_REQUEST = {
  action: "read",
  expires: "12-31-9999", // A far future date
} as GetSignedUrlConfig;
