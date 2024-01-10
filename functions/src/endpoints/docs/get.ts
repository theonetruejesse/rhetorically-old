import { apiRequest } from "../../middleware";
import { processDoc } from "./utils/processDoc";

// actions endpoint for retrieving doc
export const getIndexedText = apiRequest(async (req, res) => {
  const { documentId, docClient } = req.docContext;

  const doc = await docClient.documents.get({
    documentId,
  });

  const { indexedText } = processDoc(doc);

  res.send(indexedText);
});
