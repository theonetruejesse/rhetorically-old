import { apiRequest } from "../../middleware";
import { processDoc } from "./utils/processDoc";

// primary endpoint for gpt to retrieve text documents
export const getIndexedText = apiRequest(async (req, res) => {
  const { documentId, docClient } = req.docContext;

  const doc = await docClient.documents.get({
    documentId,
  });

  const { indexedText } = processDoc(doc);

  res.send(indexedText);
});
