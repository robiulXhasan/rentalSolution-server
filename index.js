const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware 
app.use(cors());
app.use(express.json());


app.get('/', (req, res) =>{
    res.send("Rental solution running");
})






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kd1ztch.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect(); 
    const db=client.db("rentalSolution")
    const usersCollections = db.collection("users");
    const productsCollection = db.collection("productsCollection");
//user information related api
    //user post to database
    app.post('/user',async(req,res)=>{
      const user=req.body;

      console.log(user);
      const result = await usersCollections.insertOne(user);
      res.send(result)
    })
    //user get from database 

// product related api 
    //post product to database
    app.post('/product',async(req,res)=>{
      const product=req.body;

      console.log(product);
      const result = await productsCollection.insertOne(product);
      res.send(result)
    })
    //get all products from database 
    app.get('/products', async(req, res) =>{
      const result = await productsCollection.find().toArray()
      res.send(result);

    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);




app.listen(port, ()=>{
    console.log(`Listening From: ${port}`);
}
)