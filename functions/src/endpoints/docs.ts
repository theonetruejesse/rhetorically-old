import { TextRange } from "../types/Doc";
import { docRequestMiddleware } from "../utils/docRequestMiddleware";
import { createHighlightRequests } from "../utils/highlight";
import { createDocRequestBody } from "../utils/createDocRequestBody";

// returns the entire text, with indexes added: <$#>...text element...<$#>
// this is used by gpt to select text for feedback
// ex: <$1>hello world
export const getIndexedText = docRequestMiddleware(async (req, res) => {
  const { documentId, docsClient } = req.docContext;

  const doc = await docsClient.documents.get({
    documentId: documentId,
  });

  // filter first for paragraph as content type with text
  const paragraphs = doc.data.body?.content?.filter(
    (i) => i.paragraph !== undefined
  );

  // loop through paragraph, elements for ouputting formatted text
  let text = "";
  paragraphs?.forEach((p) => {
    p.paragraph!.elements?.forEach((e) => {
      // check if content exist + ignore empty lines (lines with only '\n')
      if (e.textRun?.content) text += `<$${e.startIndex}>${e.textRun.content}`;
    });
    // last char of paragraph always '\n', reformatting to start new line after final <$#>
    if (p.endIndex) text = text.slice(0, -1) + `<$${p.endIndex - 1}>\n`;
  });
  res.send(text);
});

export const annotateDoc = docRequestMiddleware(async (req, res) => {
  const { documentId, docsClient } = req.docContext;

  // need validator function to check, also adjust openapi specification
  const docRequest = req.body; // should be type DocRequestBody

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: docRequest,
  });

  res.send(
    `Feedback Given: https://docs.google.com/document/d/${documentId}/edit`
  );
});

export const highlightText = docRequestMiddleware(async (req, res) => {
  const { documentId, docsClient } = req.docContext;
  const highlightSections: Array<TextRange> = req.body.sections;

  const requests = createHighlightRequests(highlightSections);

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: createDocRequestBody(requests),
  });

  res.send(
    `Feedback Given: https://docs.google.com/document/d/${documentId}/edit`
  );
});
