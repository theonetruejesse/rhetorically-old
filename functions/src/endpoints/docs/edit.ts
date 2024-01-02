import { DocRequest, TextRange } from "../../types/Doc";
import { createDocRequestBody } from "../../utils/createDocRequestBody";
import { docRequestMiddleware } from "../../utils/docRequestMiddleware";
import { createHighlightRequests } from "../../utils/highlight";

export const annotateDoc = docRequestMiddleware(async (req, res) => {
  const { documentId, docsClient } = req.docContext;

  const docRequest: DocRequest[] = req.body.request;

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: createDocRequestBody(docRequest),
  });

  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});

export const highlightText = docRequestMiddleware(async (req, res) => {
  const { documentId, docsClient } = req.docContext;
  const highlightSections: Array<TextRange> = req.body.sections;

  const requests = createHighlightRequests(highlightSections);

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: createDocRequestBody(requests),
  });

  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});

// export const addComment = docRequestMiddleware(async (req, res) => {
//   const { documentId, docsClient } = req.docContext;
//   const highlightSections: Array<TextRange> = req.body.feedback;
// });
