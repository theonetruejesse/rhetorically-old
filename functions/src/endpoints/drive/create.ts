import { apiRequest, contextOptions } from "../../middleware";

// createCopy() gpt actions endpoint
// 1. create copy of doc
// todo, 2. adjust title
const config = {
  contextType: contextOptions.drive,
  documentIdOptional: false,
};
export const createCopy = apiRequest(async (req, res) => {
  const { driveClient, documentId } = req.driveContext;

  const copy = await driveClient.files
    .copy({
      fileId: documentId,
    })
    .catch((e) => {
      throw Error(`error copying file: ${e}`);
    });

  res.send({ newDocumentId: copy.data.id });
}, config);
