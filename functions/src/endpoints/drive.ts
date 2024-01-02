import { logger } from "firebase-functions/v2";
import axios from "axios";
import { corsRequest } from "../utils/cors";

// todo, refactor to use googleapi
export const listDocs = corsRequest(async (req, res) => {
  try {
    // Extract the access token from the request headers
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      res.status(401).send("Unauthorized: No access token provided");
      return;
    }
    // Call to Google Drive API
    const response = await axios.get(
      "https://www.googleapis.com/drive/v3/files",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: "mimeType='application/vnd.google-apps.document'",
          pageSize: 10,
          fields: "files(id, name)",
        },
      }
    );
    // Process and return the list of documents
    const docs = response.data.files.map((f: any) => {
      return {
        id: f.id,
        title: f.name,
      };
    });
    res.send(docs);
  } catch (error: any) {
    logger.log("error", error);
    if (error.response && error.response.status === 401) {
      res.status(401).send("Unauthorized: Invalid or expired access token");
    } else {
      res.status(405).send("Method Not Allowed");
    }
  }
});
