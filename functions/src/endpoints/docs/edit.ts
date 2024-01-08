import { TextRange } from "./types";
import { docRequest } from "./utils/middleware";
import {
  InsertTextArgs,
  InsertTextHandler,
  UpdateTextStyleHandler,
} from "./utils/handlers";
import { getFirestore } from "firebase-admin/firestore";

export const highlightText = docRequest(async (req, res) => {
  const { documentId, docHandler } = req.docContext;
  const highlightSections: Array<TextRange> = req.body.sections;

  const styleHandler = new UpdateTextStyleHandler();
  highlightSections.map((section) =>
    styleHandler.addDocRequest({
      startIndex: section.startIndex,
      endIndex: section.endIndex,
    })
  );

  await docHandler.callDocRequest();
  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});

type Comment = {
  section: TextRange;
  feedback: string;
};

export const addComments = docRequest(async (req, res) => {
  const { documentId, docHandler } = req.docContext;
  const comments: Array<Comment> = req.body.comments;
  const versionId: string = req.body.versionId;

  const styleHandler = new UpdateTextStyleHandler();
  const textHandler = new InsertTextHandler();

  // lowkey db interaction can be class-ified
  const db = getFirestore();
  const doc = await db
    .collection("docs")
    .doc(documentId)
    .collection("versions")
    .doc(versionId)
    .get();
  const data = doc.data();
  if (!data || !data.endIndexes) throw new Error("doc version does not exist");
  const endIndexes: Array<number> = data.endIndexes;

  const commentFormatter = new CommentFormatter(endIndexes);

  let tag = 1;
  comments.forEach(({ section, feedback }) => {
    // highlight commenting sections
    styleHandler.addDocRequest({
      startIndex: section.startIndex,
      endIndex: section.endIndex,
    });
    // annotate those sections with tags
    textHandler.addDocRequest({
      index: section.startIndex,
      text: `[${tag}]: `,
    });
    // add the comment's feedback into formatter first
    commentFormatter.addComment(section.endIndex, `[${tag}]: ${feedback}`);
    tag++;
  });
  // batch add comment reqs to handler
  textHandler.addDocRequests(commentFormatter.getCommentRequests());

  await docHandler.callDocRequest();

  res.send(`Feedback Given: https://docs.google.com/document/d/${documentId}/`);
});

// insert each comment after the end of each paragraph
// batch it up first for formatting
class CommentFormatter {
  private paragraphComments: Map<number, Array<string>>;

  constructor(endIndexes: Array<number>) {
    if (endIndexes.length <= 0) throw new Error("empty endIndexes");

    this.paragraphComments = new Map();
    endIndexes.forEach((i) => this.paragraphComments.set(i, []));
  }

  private findParagraphKey = (commentIndex: number) => {
    let key; // iterator
    for (key of this.paragraphComments.keys())
      if (commentIndex < key) return key;
    return key as number;
  };

  addComment = (index: number, comment: string) => {
    const key = this.findParagraphKey(index);
    this.paragraphComments.get(key)?.push(comment);
  };

  getCommentRequests = (): Array<InsertTextArgs> => {
    const res = [];

    // comment formatting for batching
    const formatComment = (
      index: number,
      lastIndex: number,
      comment: string
    ) => {
      // assumes standarized doc formatting
      const base = `\t${comment}\n`;
      switch (index) {
        case 0:
          return "--\n" + base;
        case lastIndex:
          return base + "--\n";
        default:
          return base;
      }
    };

    // iterate through map, handle formatting logic
    for (let key of this.paragraphComments.keys()) {
      let comments = this.paragraphComments.get(key);
      if (comments) {
        const lastIndex = comments.length - 1;
        // reverse order to appease how google batch request order works
        for (let i = lastIndex; i >= 0; i--)
          res.push({
            index: key,
            text: formatComment(i, lastIndex, comments[i]),
          });
      }
    }
    return res;
  };
}
