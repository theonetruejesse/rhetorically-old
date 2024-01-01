import { DocRequest, DocRequestBody } from "../types/Doc";

export const createDocRequestBody = (
  docRequests: DocRequest[]
): DocRequestBody => {
  return {
    request: docRequests,
  };
};
