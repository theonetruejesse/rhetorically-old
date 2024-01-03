import { docRequestMiddleware } from "../../utils/docRequestMiddleware";
import { processDocResponse } from "../../utils/processDocResponse";

// primary endpoint for gpt to retrieve text documents
export const getIndexedText = docRequestMiddleware(async (req, res) => {
  const { documentId, docsClient } = req.docContext;

  const doc = await docsClient.documents.get({
    documentId,
  });

  const { indexedText } = processDocResponse(doc);

  res.send(indexedText);
});
