import { docRequest } from "../../middleware/docRequest";
import { processDocResponse } from "./utils/processDocResponse";

// primary endpoint for gpt to retrieve text documents
export const getIndexedText = docRequest(async (req, res) => {
  const { documentId, docsClient } = req.docContext;

  const doc = await docsClient.documents.get({
    documentId,
  });

  const { indexedText } = processDocResponse(doc);

  res.send(indexedText);
});
