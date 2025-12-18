// 使用示例
const uri = "mongodb://localhost:27017";
const dbName = "mydatabase";

async function run() {
  const client = new MongoDBClient(uri, dbName);
  await client.connect();

  const collectionName = "mycollection";
  const document = { name: "John", age: 30 };

  const insertedId = await client.insertDocument(collectionName, document);

  const update = { $set: { age: 31 } };
  await client.updateDocument(collectionName, insertedId, update);

  await client.deleteDocument(collectionName, insertedId);

  await client.findDocuments(collectionName);

  await client.disconnect();
}

run().catch((err) => {
  console.error("An error occurred:", err);
});
