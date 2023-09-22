const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  //bearer token
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

app.get("/", (req, res) => {
  res.send("Rental solution running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kd1ztch.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("rentalSolution");
    const usersCollections = db.collection("users");
    const productsCollection = db.collection("productsCollection");
    //user information related api

    // jwt information
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(
        {
          user,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ token });
    });
    //user post to database
    app.post("/user", async (req, res) => {
      const user = req.body;

      console.log(user);
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });
    //user get from database

    // product related api
    //product sort from banner area
    app.get("/sortProducts", async (req, res) => {
      const city = req.query.city;
      const area = req.query.area;
      const category = req.query.category;
      console.log(req.query);
      const result = await productsCollection
        .find({ city, area, category })
        .toArray();
      res.send(result);
    });
    // side bar sorting
    app.get("/products-collection", async (req, res) => {
      const query = {};

      let price = 1;
      if (query?.price) {
        price = query?.price.toLowerCase();
        if (price == "low to high") {
          price = 1;
        } else {
          price = -1;
        }
      }

      if (req.query.rentType != "false") {
        const rentType = req.query?.rentType.split(",");
        query.category = { $in: rentType };
      }
      if (req.query.month) {
        query.month = req.query.month;
      }

      console.log(req.query);
      if (req.query.city) {
        query.city = req.query.city;
      }

      if (req.query.bed != "false") {
        const bedRooms = req.query?.bed.split(",");
        const bedNumber = bedRooms.map((bed) => parseInt(bed));
        query.room = { $in: bedNumber };
      }
      if (req.query.wash != "false") {
        const washRooms = req.query?.wash.split(",");
        const washRoomNumber = washRooms.map((wash) => parseInt(wash));
        query.bath = { $in: washRoomNumber };
      }
      const findProducts = productsCollection.find(query).sort({ rent: price });
      const result = await findProducts.toArray();
      console.log("result", result);
      res.send(result);
    });

    //property details
    app.get('/details/:id',async(req,res)=>{
        const id=req.params.id;
      const query = { _id: new ObjectId(id) };
      const results = await productsCollection.findOne(query);
     
      res.send(results);

    })
    //category wise data
    app.get("/categoryWiseData", async (req, res) => {
      const category = req.query.category;
      console.log(category);
      const result = await productsCollection
        .find({ category: category })
        .toArray();
      res.send(result);
    });
    //post product to database
    app.post("/product", async (req, res) => {
      const product = req.body;

      console.log(product);
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });
    //get all products from database
    app.get("/products", async (req, res) => {
      const result = await productsCollection
        .find()
        .sort({ _id: -1 })
        .toArray();
      res.send(result);
    });
    //get all products from database
    app.get("/sort-products", async (req, res) => {
      console.log(req.query);
      // const result = await productsCollection.find().toArray()
      // res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Listening From: ${port}`);
});
