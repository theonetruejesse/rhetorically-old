import { logger } from "firebase-functions/v2";
import { docRequest } from "../utils/docRequest";

// returns the entire text, with indexes added: <$#> ... <#$>
// this is used by gpt to select text for feedback
// ex: <$1>hello world<12$>
export const getIndexedText = docRequest(async (req, res) => {
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
  paragraphs?.forEach((p) =>
    p.paragraph!.elements?.forEach((e) => {
      // check if content exist + ignore empty lines (only '\n')
      if (e.textRun?.content && e.textRun.content.length > 1) {
        // all textRun.content end with '\n' char, moved to after <#$>
        const slicedText = e.textRun.content.slice(0, -1);
        text += `<$${e.startIndex}>${slicedText}<${e.endIndex}$>\n`;
      }
    })
  );

  logger.log(text);
  res.send(text);
});

export const annotateDoc = docRequest(async (req, res) => {
  const { documentId, docsClient } = req.docContext;

  // need validator function to check, also adjust openapi specification
  const docRequest = req.body; // should be type DocRequestBody

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: docRequest,
  });

  res.send(
    `Feedback Given: https://docs.google.com/document/d/${documentId}/edit `
  );
});

// export const highlightText = corsRequest(async (req, res) => {});
