import { HighlightColor } from "../constants";
import { DocRequestBody, TextRange } from "../types/Doc";

export const highlightText = (highlights: Array<TextRange>) => {
  // Create RequestBody for every valid highlight range
  // using reduce to maintain that sweet sweet linear runtime :0
  return highlights.reduce((acc: Array<DocRequestBody>, h) => {
    // Minimum index = 1 for Google Docs compatibility
    if (0 < h.startIndex && h.startIndex < h.endIndex)
      acc.push({
        updateTextStyle: {
          textStyle: {
            backgroundColor: HighlightColor,
          },
          fields: "backgroundColor",
          range: {
            startIndex: h.startIndex,
            endIndex: h.endIndex,
          },
        },
      });
    return acc;
  }, []);
};
