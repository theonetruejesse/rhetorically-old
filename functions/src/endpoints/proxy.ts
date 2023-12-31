// openai please get your shit together
// redirect workaround for addressing “Auth URL, Token URL and API hostname must share a root domain” issues
import { logger } from "firebase-functions/v2";
import { corsRequest } from "../utils/cors";

// https://accounts.google.com/o/oauth2/auth
export const proxyAuthUrl = corsRequest((req, res) => {
  const params = req.url.split("?")[1];
  logger.log(params);
  res.redirect(`https://accounts.google.com/o/oauth2/auth?${params}`);
});

// https://oauth2.googleapis.com/token
export const proxyTokenUrl = corsRequest((req, res) => {
  // Ensure it's a POST request
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // Convert req.body from JSON to URL-encoded string
  const encodedBody = new URLSearchParams(req.body).toString();
  logger.log("Request Body:", encodedBody);

  // Forward the request to the Google token endpoint
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodedBody,
  };

  fetch("https://oauth2.googleapis.com/token", requestOptions)
    .then(async (response) => {
      if (!response.ok) {
        logger.error(`${response.status} - ${response.statusText}`);
        const text = await response.text();
        logger.error("Response Body:", text);
        throw new Error(text);
      }
      return response.json();
    })
    .then((data) => res.send(data))
    .catch((error) => {
      logger.error("Fetch Error:", error.message);
      res.status(500).send(error.message);
    });
});
