import { docs_v1 } from "googleapis";
import { DocRequest, DocRequestBody } from "../../types/Doc";

export const createDocRequestBody = (docRequests: DocRequest[]) => {
  // just learned satisifes today lol, mainly using it as a type checker
  const requestBody = {
    requests: docRequests,
  } satisfies DocRequestBody;

  // need to cast it as the googleapi type so that i can actually call api
  return requestBody as docs_v1.Schema$BatchUpdateDocumentRequest;
};
