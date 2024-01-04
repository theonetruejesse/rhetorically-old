import { GaxiosResponse } from "gaxios";
import { docs_v1 } from "googleapis";

// will need to extend documentId to include TextRange (make into args typing)
// processes the doc.data response, returns formatted data for getIndexedText(), saveNewDocument()
export const processDocResponse = (
  doc: GaxiosResponse<docs_v1.Schema$Document>
) => {
  // need to extend filtering to support lists
  // filter first for paragraph as content type with text
  const filteredContent = doc.data.body?.content?.filter(
    (i) => i.paragraph !== undefined
  );

  const endIndexes: Array<number> = [];
  let onlyText = "";
  let indexedText = "";

  filteredContent?.forEach((content) => {
    // add index for where paragraph ends
    if (content.endIndex) endIndexes.push(content.endIndex);
    // add raw text from each paragraph, stripped of styling
    content.paragraph!.elements?.forEach((e) => {
      if (e.textRun?.content) {
        onlyText += e.textRun.content;
        indexedText += `<$${e.startIndex}>${e.textRun.content}`;
      }
    });

    // last char of paragraph always '\n', reformatting to start new line after final <$#>
    if (content.endIndex)
      indexedText = indexedText.slice(0, -1) + `<$${content.endIndex - 1}>\n`;
  });

  return {
    onlyText,
    indexedText,
    endIndexes,
  };
};
