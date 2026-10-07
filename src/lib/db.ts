import mongoose from "mongoose";

type MongooseCache = {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalWithMongoose.__mongooseCache ??
  ({ conn: null, promise: null } satisfies MongooseCache);

globalWithMongoose.__mongooseCache = cache;

export function getMongoUri(): string {
  const uri =
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_PROD
      : process.env.MONGO_DEV;

  if (!uri) {
    throw new Error(
      `Missing MongoDB connection string (NODE_ENV=${process.env.NODE_ENV})`,
    );
  }
  return uri;
}

export async function connectDB(): Promise<mongoose.Mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(getMongoUri(), { bufferCommands: false });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
