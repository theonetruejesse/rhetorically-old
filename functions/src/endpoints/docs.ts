import { logger } from "firebase-functions/v2";
import { corsRequest } from "../utils/cors";

import { google } from "googleapis";
import { reqBody } from "../sample";

export const getDocText = corsRequest(async (req, res) => {
  try {
    // Extract the access token from the request headers
    const documentId = req.query.documentId;
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken)
      res.status(401).send("Unauthorized: No access token provided");
    else if (!documentId) res.status(400).send("Missing query: documentId");
    else {
      const docs = google.docs({ version: "v1", auth: accessToken });

      const doc = await docs.documents.get({
        documentId: documentId as string,
      });
      const paragraphs = doc.data.body?.content?.filter(
        (item) => item.paragraph !== undefined
      );

      let text = "";
      paragraphs?.forEach((p) =>
        p.paragraph!.elements?.forEach((e) => (text += e.textRun?.content))
      );

      res.send(text);
    }
  } catch (error: any) {
    logger.log("error", error);
    if (error.response && error.response.status === 401)
      res.status(401).send("Unauthorized: Invalid or expired access token");
    else res.status(405).send("Method Not Allowed");
  }
});

export const updateDoc = corsRequest(async (req, res) => {
  try {
    // Extract the access token from the request headers
    const documentId = req.query.documentId;
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken)
      res.status(401).send("Unauthorized: No access token provided");
    else if (!documentId) res.status(400).send("Missing query: documentId");
    else {
      const docs = google.docs({ version: "v1", auth: accessToken });

      // need to do lol
      await docs.documents.batchUpdate({
        documentId: documentId as string,
        requestBody: reqBody,
      });
    }
  } catch (error: any) {
    logger.log("error", error);
    if (error.response && error.response.status === 401)
      res.status(401).send("Unauthorized: Invalid or expired access token");
    else res.status(405).send("Method Not Allowed");
  }
});
