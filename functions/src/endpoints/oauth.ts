import { defineString } from "firebase-functions/params";
import { google } from "googleapis";
import { GOOGLE_AUTH_SCOPES } from "../constants";
import { corsRequest } from "../middleware/cors";

const CLIENT_ID = defineString("CLIENT_ID");
const CLIENT_SECRET = defineString("CLIENT_SECRET");
const REDIRECT_URL = defineString("REDIRECT_URL");

// these functions are used for local testing purposes

export const googleSignIn = corsRequest((_, res) => {
  // Google OAuth2 configuration
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID.value(),
    CLIENT_SECRET.value(),
    REDIRECT_URL.value() // calls oauth2callback() on redirect
  );

  // Generate an authentication URL and redirect the user to Google's OAuth2 service
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_AUTH_SCOPES,
  });
  res.redirect(authUrl);
});

export const oauth2callback = corsRequest(async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID.value(),
    CLIENT_SECRET.value(),
    REDIRECT_URL.value()
  );

  try {
    const { tokens } = await oauth2Client.getToken(req.query.code as string);
    res.send(tokens);
  } catch (error) {
    res.status(403).send("No code found");
  }
});
