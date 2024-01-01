import { DocRequestContext } from "../utils/docRequest";

declare global {
  namespace Express {
    interface Request {
      docContext: DocRequestContext;
    }
  }
}
