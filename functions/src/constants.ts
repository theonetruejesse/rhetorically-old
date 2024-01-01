import { OptionalColor } from "./types/Doc";

export const GOOGLE_AUTH_SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/drive.readonly",
];

// use with backgroundColor field
export const HighlightColor: OptionalColor = {
  color: {
    rgbColor: {
      red: 0.85,
      green: 0.9,
      blue: 0.96,
    },
  },
};
