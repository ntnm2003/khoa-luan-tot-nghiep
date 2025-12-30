// This script initializes the MongoDB replica set
// It runs automatically when the container starts

// Give MongoDB time to start up properly
sleep(8000);

db = db.getSiblingDB("admin");

// Try to get replica set status
try {
    var status = rs.status();
    print("Replica set already initialized with status: " + status.myState);
} catch(e) {
    // Replica set is not initialized yet
    print("Replica set not yet initialized. Error: " + e);
    print("Attempting to initialize replica set...");

    try {
        // Initialize replica set with 3 nodes
        var initResult = rs.initiate({
            _id: "myreplicaset",
            members: [
                {
                    _id: 0,
                    host: "mongodb-primary:27017"
                },
                {
                    _id: 1,
                    host: "mongodb-secondary-1:27017"
                },
                {
                    _id: 2,
                    host: "mongodb-secondary-2:27017"
                }
            ]
        });

        print("Replica set initiate response: " + JSON.stringify(initResult));

        // Give replica set time to stabilize
        sleep(3000);

        // Verify replica set is initialized
        try {
            var status = rs.status();
            print("Replica set is now initialized. My state: " + status.myState);
        } catch(statusError) {
            print("Could not verify replica set status: " + statusError);
        }

    } catch(initError) {
        print("Error initializing replica set: " + initError);
    }
}

// Try to create the root user if it doesn't exist
try {
    var rootUser = db.getUser("root");
    if (rootUser) {
        print("Root user already exists");
    }
} catch(getUserError) {
    print("Root user does not exist. Creating...");

    try {
        db.createUser({
            user: "root",
            pwd: "root",
            roles: [{role: "root", db: "admin"}]
        });
        print("Root user created successfully");
    } catch(createUserError) {
        print("Error creating root user: " + createUserError);
    }
}

