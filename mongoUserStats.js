const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

const dbHost = "localhost:27017";
const dbAdmin = "mongoAdmin";
const dbAdminPassword = "Chi_g0ld";
const authDb = "admin";
const destConnString = `mongodb://${dbAdmin}:${dbAdminPassword}@${dbHost}?authSource=${authDb}`;
const dbMongo = "testi";
const dataCollection = "data";
const usersCollection = "user";

const client = new MongoClient(destConnString);

app.get("/user-records", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbMongo);

        const result = await db.collection(usersCollection).aggregate([
            {
                $lookup: {
                    from: dataCollection,
                    localField: "username",
                    foreignField: "userid",
                    as: "user_data"
                }
            },
            {
                $project: {
                    _id: 0,
                    username: 1,
                    "Users records": { $size: "$user_data" }
                }
            }
        ]).toArray();

        res.json(result);
    } catch (e) {
        console.error("Error fetching data:", e);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await client.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${3000}`);
});
