import { TextRange } from "./types";
import { docRequest } from "../../middleware/docRequest";
import { InsertTextHandler, UpdateTextStyleHandler } from "./utils/handlers";

// export const annotateDoc = docRequest(async (req, res) => {
//   const { documentId, docsClient } = req.docContext;
//   const docRequest: DocRequest[] = req.body.request;
//   await docsClient.documents.batchUpdate({
//     documentId: documentId,
//     requestBody: addDocRequestBody(docRequest),
//   });
//   res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
// });

export const highlightText = docRequest(async (req, res) => {
  const { docHandler } = req.docContext;
  const highlightSections: Array<TextRange> = req.body.sections;

  const styleHandler = new UpdateTextStyleHandler();
  highlightSections.map((section) =>
    styleHandler.addDocRequest({
      startIndex: section.startIndex,
      endIndex: section.endIndex,
    })
  );

  await docHandler.callDocRequest();
  res.send(
    `Feedback Given: https://docs.google.com/document/d/${docHandler.getDocumentId()}/`
  );
});

type Comment = {
  section: TextRange;
  feedback: string;
};

export const addComments = docRequest(async (req, res) => {
  const { docHandler } = req.docContext;
  const comments: Array<Comment> = req.body.comments;

  const styleHandler = new UpdateTextStyleHandler();
  const textHandler = new InsertTextHandler();

  let tag = 1;
  comments.forEach((comment) => {
    // highlight commenting sections
    styleHandler.addDocRequest({
      startIndex: comment.section.startIndex,
      endIndex: comment.section.endIndex,
    });
    // annotate those sections with tags
    textHandler.addDocRequest({
      index: comment.section.startIndex,
      text: `[${tag}]: `,
    });
    // add the feedback comment
    textHandler.addDocRequest({
      index: comment.section.endIndex,
      text: `\n[${tag}]: ${comment.feedback}\n`,
    });

    tag++;
  });

  await docHandler.callDocRequest();

  res.send(
    `Feedback Given: https://docs.google.com/document/d/${docHandler.getDocumentId()}/`
  );
});
