import { apiRequest, contextOptions } from "../../middleware";

const config = {
  contextType: contextOptions.drive,
  documentIdOptional: true,
};
export const listDocs = apiRequest(async (req, res) => {
  const { driveClient } = req.driveContext;

  const response = await driveClient.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
    pageSize: 10,
    fields: "files(id, name)",
  });

  const docs = response?.data?.files?.map((f: any) => {
    return {
      id: f.id as number,
      title: f.name as string,
    };
  });

  if (!docs) throw Error("no docs found in drive");

  res.send(docs);
}, config);
