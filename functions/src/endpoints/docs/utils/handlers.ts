import { docs_v1 } from "googleapis";
import {
  // DocRequestBody,
  DocRequest,
  InsertTextRequest,
  UpdateTextStyleRequest,
  OptionalColor,
} from "../types";

// see functions/src/docs/types.ts
// these classes handle docs api Request objects
// (from types.ts): DocRequest -> InsertTextRequest, UpdateTextStyleRequest
// DocHandler provides interface for requesting the docs api
export class DocHandler {
  private docsClient: docs_v1.Docs;
  private documentId: string;

  constructor(docsClient: docs_v1.Docs, documentId: string) {
    this.docsClient = docsClient;
    this.documentId = documentId;
  }

  private getDocRequestBody = () => {
    return {
      requests: DocRequestsHandler.docRequests,
    } as docs_v1.Schema$BatchUpdateDocumentRequest;
  };

  callDocRequest = async () => {
    await this.docsClient.documents.batchUpdate({
      requestBody: this.getDocRequestBody(),
      documentId: this.documentId,
    });
    // clean up static data
    // eventually need to save to last version before anything else
    DocRequestsHandler.docRequests = [];
    DocRequestsHandler.offsets = [];
  };
}

type Offset = {
  index: number;
  amount: number;
};
abstract class DocRequestsHandler<DocRequestArgs> {
  static offsets: Array<Offset> = [];
  static docRequests: Array<DocRequest> = [];

  // each class provide the args necessary for constructing a DocRequest
  abstract addDocRequest: (request: DocRequestArgs) => DocRequest;

  // the plural version for multiple requests
  addDocRequests = (requests: Array<DocRequestArgs>) => {
    const res: Array<DocRequest> = [];
    requests.forEach((r) => res.push(this.addDocRequest(r)));
    return res;
  };

  // binary search lmao
  // accounts for each DocRequest that inserts text offset the initial index positions
  private findInsertionIndex = (target: number) => {
    let left = 0;
    let right = DocRequestsHandler.offsets.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (DocRequestsHandler.offsets[mid].index < target) left = mid + 1;
      else right = mid;
    }

    return left;
  };

  // naive implementations, feel free to go nuts with optimization
  // needed since every docs text update we do changes the index we based things on
  // ex: <$1>hello world<$12> to insert ',' and '!' such that we get "hello, world!""
  // we'd need to first insert ',' at 6, then insert '!' at 14 (not 13 since first insert adds offset of 1)
  // the approach using offsets (Array<Offset>) is necessary for varying index inserting orders
  protected calculateIndex = (index: number): number => {
    const offsetRange = this.findInsertionIndex(index);
    // after we find the max, we add up the offset values up till that value
    let total = 0;
    for (let i = 0; i < offsetRange; i++)
      total += DocRequestsHandler.offsets[i].amount;
    return total + index;
  };
  protected increaseOffset = (index: number, text: string): void => {
    // inserts the new offset while perserving order
    const insertionIndex = this.findInsertionIndex(index);
    DocRequestsHandler.offsets.splice(insertionIndex, 0, {
      index,
      amount: text.length,
    });
  };
}

export type InsertTextArgs = {
  index: number;
  text: string;
};
export class InsertTextHandler extends DocRequestsHandler<InsertTextArgs> {
  addDocRequest = (insertTextArgs: InsertTextArgs) => {
    const insertText = this.createInsertTextRequest(insertTextArgs);
    const docRequest = {
      insertText,
    } as DocRequest;
    DocRequestsHandler.docRequests.push(docRequest);
    return docRequest;
  };

  private createInsertTextRequest = (
    args: InsertTextArgs
  ): InsertTextRequest => {
    // calculateIndex then increaseOffset since increaseOffset changes state
    const calculatedIndex = this.calculateIndex(args.index);
    this.increaseOffset(args.index, args.text);
    return {
      text: args.text,
      location: {
        index: calculatedIndex,
      },
    };
  };
}

export type UpdateTextStyleArgs = {
  startIndex: number;
  endIndex: number;
};
export class UpdateTextStyleHandler extends DocRequestsHandler<UpdateTextStyleArgs> {
  addDocRequest = (updateTextStyleArgs: UpdateTextStyleArgs) => {
    const updateTextStyle =
      this.createUpdateTextStyleRequest(updateTextStyleArgs);
    const docRequest = {
      updateTextStyle,
    } as DocRequest;
    DocRequestsHandler.docRequests.push(docRequest);
    return docRequest;
  };

  // collegiate highlight blue lol
  private HighlightColor: OptionalColor = {
    color: {
      rgbColor: {
        red: 0.85,
        green: 0.9,
        blue: 0.96,
      },
    },
  };

  // assumes each StyleRequest is for highlighting text
  private createUpdateTextStyleRequest = (
    args: UpdateTextStyleArgs
  ): UpdateTextStyleRequest => {
    return {
      textStyle: {
        backgroundColor: this.HighlightColor,
      },
      fields: "backgroundColor",
      range: {
        startIndex: this.calculateIndex(args.startIndex),
        endIndex: this.calculateIndex(args.endIndex),
      },
    };
  };
}
