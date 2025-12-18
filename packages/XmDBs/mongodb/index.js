import { MongoClient, ObjectId } from "mongodb";
import { XmConfig } from "@XmConfig";

class XmMongoDBClient {
  constructor() {
    this.uri = XmConfig.getSubConfig("mongodb", "uri");
    this.dbName = XmConfig.getSubConfig("mongodb", "dbName");
    this.poolSize = XmConfig.getSubConfig("mongodb", "poolSize");
    this.client = new MongoClient(this.uri);
    this.db = null;
  }

  async Connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log("Connected to the mongodb database");
    } catch (err) {
      console.error("Failed to connect to the database:", err);
    }
  }

  async Disconnect() {
    try {
      await this.client.close();
      console.log("Disconnected from the database");
    } catch (err) {
      console.error("Failed to disconnect from the database:", err);
    }
  }
  async InsertManyDocuments(collectionName, documents) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.insertMany(documents);
      return result.insertedIds;
    } catch (err) {
      console.error("Failed to insert documents:", err);
    }
  }

  async UpdateManyDocuments(collectionName, documents) {
    try {
      const collection = this.db.collection(collectionName);
      const bulkUpdateOps = documents.map((update) => ({
        updateOne: {
          filter: { _id: new ObjectId(update._id) },
          update: { $set: { ...update, _id: undefined } },
        },
      }));
      const result = await collection.bulkWrite(bulkUpdateOps);
      return result.modifiedCount;
    } catch (err) {
      console.error("Failed to update documents:", err);
    }
  }
  async DelManyDocuments(collectionName, ids, documents) {
    try {
      const collection = this.db.collection(collectionName);
      const bulkUpdateOps = ids.map((update) => ({
        updateOne: {
          filter: { _id: new ObjectId(update._id) },
          update: { $set: documents },
        },
      }));
      const result = await collection.bulkWrite(bulkUpdateOps);
      return result.modifiedCount;
    } catch (err) {
      console.error("Failed to update documents:", err);
    }
  }
  async UpdateAllDocuments(collectionName, data) {
    try {
      const collection = this.db.collection(collectionName);
      const filter = {}; // 空对象表示匹配所有文档
      const update = { $set: data };
      const result = await collection.updateMany(filter, update);
      return result.modifiedCount;
    } catch (err) {
      console.error("Failed to update documents:", err);
    }
  }

  async UpdateDocuments(collectionName, ids, data) {
    try {
      const collection = this.db.collection(collectionName);
      const upids = ids.map((id) => ObjectId(id));
      const filter = { _id: { $in: upids } };
      const update = { $set: data };
      const result = await collection.updateMany(filter, update);
      return result.modifiedCount;
    } catch (err) {
      console.error("Failed to update documents:", err);
    }
  }

  async DeleteManyDocuments(collectionName, filter) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.deleteMany(filter);
      return result.deletedCount;
    } catch (err) {
      console.error("Failed to delete documents:", err);
    }
  }

  async InsertDocument(collectionName, document) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.insertOne(document);
      return result.insertedId;
    } catch (err) {
      console.error("Failed to insert document:", err);
    }
  }

  async UpdateDocument(collectionName, id, document) {
    try {
      const collection = this.db.collection(collectionName);
      const filter = { _id: new ObjectId(id) };
      const update = { $set: document };
      const result = await collection.updateOne(filter, update);
      return result.modifiedCount;
    } catch (err) {
      console.error("Failed to update document:", err);
    }
  }

  async DeleteDocument(collectionName, documentId) {
    try {
      const collection = this.db.collection(collectionName);
      const filter = { _id: ObjectId(documentId) };
      const result = await collection.deleteOne(filter);
      return result.deletedCount;
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  }

  async FindDocuments(collectionName) {
    try {
      const collection = this.db.collection(collectionName);
      const documents = await collection.find().toArray();
      return documents;
    } catch (err) {
      console.error("Failed to find documents:", err);
    }
  }
  async GetDocumentsMaxId(collectionName) {
    try {
      let result = 0;
      const collection = this.db.collection(collectionName);
      const lastDocument = await collection.find().sort({ _id: -1 }).limit(1)
        .toArray();

      if (lastDocument.length > 0) {
        if (lastDocument[0].id > 0) {
          result = lastDocument[0].id;
        }
        console.log("最后一条数据id:", result);
      }
      return result;
    } catch (err) {
      console.error("Failed to find documents:", err);
    }
  }
  async FindDocumentsByField(collectionName, query) {
    try {
      const collection = this.db.collection(collectionName);
      const documents = await collection.find(query).toArray();
      return documents;
    } catch (err) {
      console.error("Failed to find documents by field:", err);
    }
  }
}

export default XmMongoDBClient;
