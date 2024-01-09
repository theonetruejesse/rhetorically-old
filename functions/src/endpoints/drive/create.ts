import { apiRequest, contextOptions } from "../../middleware";

// createCopy() gpt actions endpoint
// 1. create copy of doc
// 2. move doc to right folder location + adjust title
const config = {
  contextType: contextOptions.drive,
  documentIdOptional: false,
};
export const createCopy = apiRequest(async (req, res) => {
  const { driveClient, documentId } = req.driveContext;

  await driveClient.files.copy({
    fileId: documentId,
  });
}, config);
