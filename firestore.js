const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'oven-cam',
  keyFilename: './oven-cam-keystore.json',
});

let collectionRef = firestore.collection('cameras');

// Test to add new camera document and return document id
collectionRef.add({foo: 'bar'}).then(documentReference => {
  let doc_id = documentReference.id;
  console.log(`New document id: ${doc_id}`);
});
