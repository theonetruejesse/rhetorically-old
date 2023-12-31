import { logger } from "firebase-functions/v2";
import axios from "axios";
import { corsRequest } from "../utils/cors";

export const getDocText = corsRequest(async (req, res) => {
  try {
    // Extract the access token from the request headers
    const documentId = req.query.documentId;
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      res.status(401).send("Unauthorized: No access token provided");
      return;
    }

    if (!documentId) {
      res.status(400).send("Missing query: documentId");
      return;
    }

    // Call to Google Drive API
    const response = await axios.get(
      `https://docs.googleapis.com/v1/documents/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // filter only for text content
    const paragraphs = response.data.body.content.filter(
      (item: any) => item.paragraph !== undefined
    );

    // output only the text
    let text = "";
    paragraphs.forEach((p: any) =>
      p.paragraph.elements.forEach((e: any) => (text += e.textRun.content))
    );

    res.send(text);
  } catch (error: any) {
    logger.log("error", error);
    if (error.response && error.response.status === 401) {
      res.status(401).send("Unauthorized: Invalid or expired access token");
    } else {
      res.status(405).send("Method Not Allowed");
    }
  }
});
