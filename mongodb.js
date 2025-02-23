import {MongoClient, ObjectId} from'mongodb';

const dbHost = "localhost:27017"
const dbAdmin = "mongoAdmin"
const dbAdminPassword = "Chi_g0ld"
const authDb = "admin"
const destConnString = `mongodb://${dbAdmin}:${dbAdminPassword}@${destHost}?authSource=${authDb}`
const dbMongo = "testi"
const dbMongoUser = "chioma"
const dbMongoPassword = "Chi_g0ld"
const dataCollection = "data"
const usersCollection = "user"

const copyDataFromMariaToMongo = async () => {
    const pool = createPool({
        host: sourceHost,
        user: dbMariaUser,
        password: dbMariaPassword,
        database: dbMaria
    })

    let conn
    try {
        conn = await pool.getConnection()
        const users = await conn.query("SELECT * FROM users")
        const data = await conn.query("SELECT * FROM data")

        createCollections(users, data)
    } catch (err) {
        throw err
    } finally {
        if(conn) await conn.close()
        await pool.end()
    }
}

const createCollections = async (usersData, dataData) => {
    const dbServer = new MongoClient(destConnString)

    try {
        await dbServer.connect()
        const db = dbServer.db(dbMongo)

        const dbs = await db.admin().listDatabases()
        if(dbs.databases.find(d => d.name === dbMongo))
            await db.dropDatabase()

        const users = db.collection( usersCollection, {
            validator: {
                $jsonSchema: {
                    bsonType: "Object",
                    required: ["username", "password"],
                    properties: {
                        username: {
                            bsonType: "string",
                            description: "must be a string and it is required"
                        },
                        password: {
                            bsonType: "string",
                            decription: "must be a string and it is required"
                        }
                    }
                }
            }
        })
        users.createIndex({"username": 1}, {unique: true})

        let result = await users.insertMany(usersData)
        console.log(`${result.insertedCount} users were inserted`)

        const data = db.collection( dataCollection, {
            validator: { $jsonSchema: {
                bsonType: "object",
                required: ["id", "Firstname", "Surname", "userid"],
                properties: {
                    _id: {
                        bsonType: ObjectId,
                        description: "Must contain unique hex value"
                    },
                    Firstname: {
                        bsonType: "string",
                        description: "must be a string and is required"
                    },
                    Surname: {
                        bsonType: "string",
                        description: "must be a string and is required"
                    },
                    userid: {
                        bsonType: "string",
                        description: "must be a string and it should be in users colelction, too"
                    },
                }
            }}
        })

        const processedData = await dataData.map(doc => {
            return {
                _id: ObjectId.createFromHexString(doc.id.toString(16).padStart(24,'0')),
                Firstname: doc.Firstname,
                Surname: doc.Surname,
                userid: doc.userid
            }
        })
        
        console.log(processedData)

        result = await data.insertMany(processedData)
        console.log(`${result.insertedCount} data records were inserted`)
        
        const userExist = await db.command({ usersInfo: dbMongoUser})
        if(!userExist.users[0]) {
            result = await db.command({
                createUser: dbMongoUser,
                pwd: dbMongoPassword,
                roles: [{role: 'readWrite', db: dbMongo}]
            })
            console.log("User created successfully", result)
        } else
            console.log("User", userExist.users[0].user, "already exist with roles:", 
                        userExist.users[0].roles)
    } catch (e) {
        console.log(e)
    } finally {
        await dbServer.close()
    }

}

copyDataFromMariaToMongo()