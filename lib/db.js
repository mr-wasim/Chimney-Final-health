import { MongoClient, ServerApiVersion } from "mongodb";

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Missing MONGODB_URI");
    const client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
    });
    cached.promise = client.connect().then((client) => {
      const db = client.db("chimney_solutions");
      return { client, db };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
