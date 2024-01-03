import { OptionalColor } from "./types/Doc";
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

// lowkey move me lol
// use with backgroundColor field
// collegiate highlight blue
export const HighlightColor: OptionalColor = {
  color: {
    rgbColor: {
      red: 0.85,
      green: 0.9,
      blue: 0.96,
    },
  },
};
