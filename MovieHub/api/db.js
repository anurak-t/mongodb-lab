import { MongoClient } from "mongodb";

const connectionString = process.env.MONGODB_URI;
const client = connectionString ? new MongoClient(connectionString) : null;
const movieDatabaseName = process.env.MOVIE_DB_NAME || "sample_mflix";
const appDatabaseName = process.env.APP_DB_NAME || "moviehub";

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) return;

  if (!client) {
    throw new Error("MONGODB_URI is missing. Create api/.env from api/.env.example first.");
  }

  await client.connect();
  await getUsersCollection().createIndex({ email: 1 }, { unique: true });
  isConnected = true;
}

export function getMoviesCollection() {
  return getClient().db(movieDatabaseName).collection("movies");
}

export function getCommentsCollection() {
  return getClient().db(movieDatabaseName).collection("comments");
}

export function getUsersCollection() {
  return getClient().db(appDatabaseName).collection("users");
}

export async function closeDatabase() {
  if (isConnected && client) {
    await client.close();
    isConnected = false;
  }
}

function getClient() {
  if (!client) {
    throw new Error("MONGODB_URI is missing. Create api/.env from api/.env.example first.");
  }

  return client;
}
