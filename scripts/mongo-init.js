// MongoDB initialization script
// This script runs when MongoDB container starts
// It sets up the replica set for the first time

db.adminCommand({
  replSetInitiate: {
    _id: "rs0",
    members: [
      {
        _id: 0,
        host: "mongodb:27017"
      }
    ]
  }
}).catch(() => {
  // Replica set might already be initialized
  print("Replica set already initialized or not primary");
});

// Switch to smartlearn database
db = db.getSiblingDB("smartlearn");

// Create collections if they don't exist
db.createCollection("users").catch(() => {
  print("Users collection already exists");
});

db.createCollection("courses").catch(() => {
  print("Courses collection already exists");
});

db.createCollection("materials").catch(() => {
  print("Materials collection already exists");
});

db.createCollection("activities").catch(() => {
  print("Activities collection already exists");
});

print("MongoDB initialized successfully!");

