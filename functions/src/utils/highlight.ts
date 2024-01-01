import { HighlightColor } from "../constants";
import { DocRequest, TextRange } from "../types/Doc";

export const createHighlightRequests = (
  highlightSections: Array<TextRange>
): DocRequest[] => {
  // Create RequestBody for every valid highlight section
  // using reduce to maintain that sweet sweet linear runtime :0
  return highlightSections.reduce((acc: Array<DocRequest>, highlight) => {
    // Minimum index = 1 for Google Docs compatibility
    // would be nice to also do an endIndex check too
    if (0 < highlight.startIndex && highlight.startIndex < highlight.endIndex)
      acc.push({
        updateTextStyle: {
          textStyle: {
            backgroundColor: HighlightColor,
          },
          fields: "backgroundColor",
          range: {
            startIndex: highlight.startIndex,
            endIndex: highlight.endIndex,
          },
        },
      });

    return acc;
  }, []);
};
