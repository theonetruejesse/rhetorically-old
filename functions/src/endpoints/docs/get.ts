import { docRequestMiddleware } from "../../utils/docRequestMiddleware";

// primary endpoint for gpt to retrieve a document after we process it
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
