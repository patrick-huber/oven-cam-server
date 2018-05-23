const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'oven-cam',
  keyFilename: './oven-cam-keyfile.json',
});

const document = firestore.doc('posts/intro-to-firestore');

// Enter new data into the document.
document.set({
  title: 'Welcome to Firestore',
  body: 'Macbook test',
}).then(() => {
  // Document created successfully.
  console.log('doc update!');
});