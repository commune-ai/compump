import { MongoClient, ServerApiVersion } from "mongodb";
import * as dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || "";
// mongoose.connect(uri).then(()=>{
//     console.log("MongoDB successfully connected");
// })
// .catch(()=>{
//     console.log("Couldn't connect mongodb");
// });
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
  // Connect the client to the server
  await client.connect();
  // Send a ping to confirm a successful connection
  //   await client.db("admin").command({ ping: 1 });
  //   console.log(
  //    "Pinged your deployment. You successfully connected to MongoDB!"
  //   );
} catch (err) {
  console.error(err);
}

let db = client.db("compump");

export default db;