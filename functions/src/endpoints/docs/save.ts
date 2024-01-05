import { docRequest } from "../../middleware/docRequest";
import {
  DocumentData,
  DocumentReference,
  FieldValue,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import { processDoc } from "./utils/processDoc";
import { getStorage } from "firebase-admin/storage";
import { docs_v1 } from "googleapis";
import { GaxiosResponse } from "gaxios";
import { BUCKET_URL_REQUEST } from "../../constants";

// Firestore Setup:
// docs / {documentId} / versions / {versionId}
//
// - 'docs' is default collection
// - '{documentId}' contains fields:
//     - createdAt (timestamp)
//
// - 'versions' is a nested collection
// - '{versionId}' contains fields:
//     - createdAt (timestamp)
//     - endIndexes (array[number])
//     - onlyTextUrl (string)
//     - docDataUrl (string)

// Storage Setup:
// docs / {userId} / {documentId} / {versionId}
//
// - within '{versionId}' two objects are uploaded
//     - onlyText (string) -> onlyTextUrl
//     - docData (string) -> docDataUrl
//
// - no '{userId}' directory at the moment

// eventually decide which segment to work on, will need index args
// processes new document, save it into firestore + upload content into storage
export const saveDocVersion = docRequest(async (req, res) => {
  const { documentId, docClient } = req.docContext;

  const db = getFirestore();
  const docRef = db.collection("docs").doc(documentId);

  await saveDoc(docRef, db);

  // save version based on most current google doc data

  const doc = await docClient.documents.get({
    documentId,
  });

  const verRef = db
    .collection("docs")
    .doc(documentId)
    .collection("versions")
    .doc();

  await saveVersion(verRef, doc, documentId); // pubsub this

  res.send({ versionId: verRef.id });
});

// saves createdAt (timestamp) into 'docs / {documentId}' if it doesn't exist already
const saveDoc = async (
  docRef: DocumentReference<DocumentData>,
  db: Firestore
) => {
  await db.runTransaction(async (transaction) => {
    const docSnapshot = await transaction.get(docRef);

    if (!docSnapshot.exists)
      // Document doesn't exist, create and add timestamp
      transaction.set(docRef, {
        createdAt: FieldValue.serverTimestamp(), // timestamp for rn
      });
    else {
      // Document exists, check if createdAt needs to be added
      const docData = docSnapshot.data();
      if (!docData || !docData.createdAt) {
        transaction.update(docRef, {
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }
  });
};

// refractor later, make it 'dry' er
// saves data into storage (textOnly, Data) and store (docs / {documentId} / versions / {versionId}) fields
const saveVersion = async (
  verRef: DocumentReference<DocumentData>,
  doc: GaxiosResponse<docs_v1.Schema$Document>,
  documentId: string
) => {
  const { endIndexes, onlyText } = processDoc(doc);

  // firestore
  verRef.set({
    createdAt: FieldValue.serverTimestamp(),
    endIndexes,
  });

  // firebase storage
  // goddamn it, why cant i use firebase sdk with cloud functions :(
  const bucket = getStorage().bucket();
  const onlyTextBuffer = Buffer.from(onlyText);
  const docDataBuffer = Buffer.from(JSON.stringify(doc.data));

  // need to do error handling, middleware stuff
  try {
    const fileLocation = `docs/${documentId}/${verRef.id}`;
    const onlyTextFile = bucket.file(`${fileLocation}/onlyText.txt`);
    const docDataFile = bucket.file(`${fileLocation}/docData.txt`);

    // store text files into bucket
    await onlyTextFile.save(onlyTextBuffer, { resumable: false }).catch((e) => {
      throw new Error(`onlyTextFile error: ${e}`);
    });
    await docDataFile.save(docDataBuffer, { resumable: false }).catch((e) => {
      throw new Error(`docDataFile error: ${e}`);
    });
    // get permanent reference url to bucket files, add to firestore
    await onlyTextFile
      .getSignedUrl(BUCKET_URL_REQUEST)
      .then((signedUrls) => verRef.update({ onlyTextUrl: signedUrls[0] }))
      .catch((e) => {
        throw new Error(`onlyTextUrl error: ${e}`);
      });
    await docDataFile
      .getSignedUrl(BUCKET_URL_REQUEST)
      .then((signedUrls) => verRef.update({ docDataUrl: signedUrls[0] }))
      .catch((e) => {
        throw new Error(`docDataUrl error: ${e}`);
      });
  } catch (error) {
    console.error(error);
  }
};
