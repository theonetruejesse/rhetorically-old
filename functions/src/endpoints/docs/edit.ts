import { TextRange } from "./types";
import { docRequest } from "../../middleware/docRequest";
import {
  InsertTextHandler,
  UpdateTextStyleHandler,
  getDocRequestBody,
} from "./utils/handlers";

// export const annotateDoc = docRequest(async (req, res) => {
//   const { documentId, docsClient } = req.docContext;
//   const docRequest: DocRequest[] = req.body.request;
//   await docsClient.documents.batchUpdate({
//     documentId: documentId,
//     requestBody: createDocRequestBody(docRequest),
//   });
//   res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
// });

export const highlightText = docRequest(async (req, res) => {
  const { documentId, docsClient } = req.docContext;
  const highlightSections: Array<TextRange> = req.body.sections;

  const handler = new UpdateTextStyleHandler();

  highlightSections.map((section) =>
    handler.createDocRequest({
      startIndex: section.startIndex,
      endIndex: section.endIndex,
    })
  );

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: getDocRequestBody(), // migrate to handler class
  });

  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});

type Comment = {
  section: TextRange;
  feedback: string;
};

export const addComments = docRequest(async (req, res) => {
  const { documentId, docsClient } = req.docContext;
  const comments: Array<Comment> = req.body.comments;

  const styleHandler = new UpdateTextStyleHandler();
  const textHandler = new InsertTextHandler();

  let tag = 1;
  comments.forEach((comment) => {
    // highlight commenting sections
    styleHandler.createDocRequest({
      startIndex: comment.section.startIndex,
      endIndex: comment.section.endIndex,
    });
    // annotate those sections with tags
    textHandler.createDocRequest({
      index: comment.section.startIndex,
      text: `[${tag}]: `,
    });
    // add the feedback comments
    textHandler.createDocRequest({
      index: comment.section.startIndex,
      text: `\n[${tag}]: ${comment.feedback}\n`,
    });

    tag++;
  });

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: getDocRequestBody(),
  });

  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});
