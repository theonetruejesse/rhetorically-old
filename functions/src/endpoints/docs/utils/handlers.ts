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

// export class DocRequestBodyHandler {
//   createDocRequestBody = (docRequests: DocRequest[]) => {
//     const requestBody = {
//       requests: docRequests,
//     } as DocRequestBody;
//     // need to cast it as the googleapi type so that i can actually call api
//     return requestBody as docs_v1.Schema$BatchUpdateDocumentRequest;
//   };
// }

// rn just directly returning the static object
// but should have global docBody handler deal with this, cuz we do need to clean up the object + storage
export const getDocRequestBody = () => {
  return DocRequestsHandler.docRequests as docs_v1.Schema$BatchUpdateDocumentRequest;
};

// type Offset = {
//   index: number;
//   length: number;
// };

abstract class DocRequestsHandler<DocRequestArgs> {
  //   static offsets: Array<Offset> = []; changed private functions
  static docRequests: Array<DocRequest> = [];
  static offset: number = 0; // this is inaccurate, migrate

  // each class provide the args necessary for constructing a DocRequest
  abstract createDocRequest: (request: DocRequestArgs) => DocRequest;

  // accounts for each DocRequest that inserts text offsets the initial index positions
  protected calculateIndex = (index: number): number =>
    DocRequestsHandler.offset + index;

  protected increaseOffset = (text: string): void => {
    DocRequestsHandler.offset += text.length;
  };
}

type InsertTextArgs = {
  index: number;
  text: string;
};

export class InsertTextHandler extends DocRequestsHandler<InsertTextArgs> {
  createDocRequest = (insertTextArgs: InsertTextArgs) => {
    const insertText = this.createInsertTextRequest(insertTextArgs);
    return {
      insertText,
    };
  };

  private createInsertTextRequest = (
    args: InsertTextArgs
  ): InsertTextRequest => {
    this.increaseOffset(args.text);
    return {
      text: args.text,
      location: {
        index: this.calculateIndex(args.index),
      },
    };
  };
}

type UpdateTextStyleArgs = {
  startIndex: number;
  endIndex: number;
};

export class UpdateTextStyleHandler extends DocRequestsHandler<UpdateTextStyleArgs> {
  createDocRequest = (updateTextStyleArgs: UpdateTextStyleArgs) => {
    const updateTextStyle =
      this.createUpdateTextStyleRequest(updateTextStyleArgs);
    return {
      updateTextStyle,
    };
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
