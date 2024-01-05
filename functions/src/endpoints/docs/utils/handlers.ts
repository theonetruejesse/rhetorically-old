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
// DocRequestBodyHandler provides interface for requesting the docs api

export class DocHandler {
  private docsClient: docs_v1.Docs;
  private documentId: string;

  constructor(docsClient: docs_v1.Docs, documentId: string) {
    this.docsClient = docsClient;
    this.documentId = documentId;
  }

  getDocumentId = () => this.documentId;

  private getDocRequestBody = () => {
    return {
      requests: DocRequestsHandler.docRequests,
    } as docs_v1.Schema$BatchUpdateDocumentRequest;
  };

  callDocRequest = async () => {
    await this.docsClient.documents.batchUpdate({
      requestBody: this.getDocRequestBody(), // migrate to handler class
    });
    // clean up static data
    // eventually need to save to last version before anything else
    DocRequestsHandler.docRequests = [];
    DocRequestsHandler.offset = [];
  };
}

type Offset = {
  index: number;
  amount: number;
};

abstract class DocRequestsHandler<DocRequestArgs> {
  static offset: Array<Offset> = [];
  static docRequests: Array<DocRequest> = [];

  // each class provide the args necessary for constructing a DocRequest
  // enables a single exposed method, arg types easily identified
  abstract addDocRequest: (request: DocRequestArgs) => DocRequest;

  // binary search lmao
  // accounts for each DocRequest that inserts text offsets the initial index positions
  private findInsertionIndex = (target: number) => {
    let left = 0;
    let right = DocRequestsHandler.offset.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (DocRequestsHandler.offset[mid].index < target) left = mid + 1;
      else right = mid;
    }

    return left;
  };

  // naive implementations, go nuts with optimization
  protected calculateIndex = (index: number): number => {
    const offsetRange = this.findInsertionIndex(index);
    let total = 0;
    for (let i = 0; i < offsetRange; i++) {
      total += DocRequestsHandler.offset[i].amount;
    }
    return total + index;
  };
  protected increaseOffset = (index: number, text: string): void => {
    const insertionIndex = this.findInsertionIndex(index);
    DocRequestsHandler.offset.splice(insertionIndex, 0, {
      index,
      amount: text.length,
    });
  };
}

type InsertTextArgs = {
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

type UpdateTextStyleArgs = {
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
