import { DocRequest, TextRange } from "../../types/Doc";

const tagFormat = (tag: number) => `[${tag}]: `;

export type Comment = {
  section: TextRange;
  feedback: string;
};

export const createCommentTag = (comment: Comment, tag: number): DocRequest => {
  return {
    insertText: {
      text: tagFormat(tag),
      location: {
        index: comment.section.startIndex,
      },
    },
  } satisfies DocRequest;
};

export const createCommentFeedback = (
  comment: Comment,
  tag: number
): DocRequest => {
  return {
    insertText: {
      text: `\n${tagFormat(tag)}${comment.feedback}\n`,
      location: {
        index: comment.section.endIndex,
      },
    },
  } satisfies DocRequest;
};
