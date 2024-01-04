import { docRequest } from "../../middleware/docRequest";
import { processDoc } from "./utils/processDoc";

// primary endpoint for gpt to retrieve text documents
export const getIndexedText = docRequest(async (req, res) => {
  const { documentId, docsClient } = req.docContext;

  const doc = await docsClient.documents.get({
    documentId,
  });

  const { indexedText } = processDoc(doc);

  res.send(indexedText);
});
