import { DocRequest, TextRange } from "./types";
import { createDocRequestBody } from "./utils/requestFormatting/requestBody";
import { docRequest } from "../../middleware/docRequest";
import { createHighlightRequest } from "./utils/requestFormatting/highlight";
import {
  createCommentFeedback,
  createCommentTag,
  Comment,
} from "./utils/requestFormatting/comment";

export const annotateDoc = docRequest(async (req, res) => {
  const { documentId, docsClient } = req.docContext;

  const docRequest: DocRequest[] = req.body.request;

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: createDocRequestBody(docRequest),
  });

  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});

export const highlightText = docRequest(async (req, res) => {
  const { documentId, docsClient } = req.docContext;
  const highlightSections: Array<TextRange> = req.body.sections;

  const highlightRequests = highlightSections.map((section) =>
    createHighlightRequest(section)
  );

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: createDocRequestBody(highlightRequests),
  });

  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});

export const addComments = docRequest(async (req, res) => {
  const { documentId, docsClient } = req.docContext;
  const comments: Array<Comment> = req.body.comments;

  const docRequests: Array<DocRequest> = [];
  let tag = 1;

  comments.forEach((comment) => {
    docRequests.push(
      createHighlightRequest(comment.section),
      createCommentTag(comment, tag),
      createCommentFeedback(comment, tag) // adjust formatting logic
    );
    tag++;
  });

  await docsClient.documents.batchUpdate({
    documentId: documentId,
    requestBody: createDocRequestBody(docRequests),
  });

  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});
