const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ehyud.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// /function for jwt
function verifyJwt (req, res, next) {
  const autHeader = req.headers.authorization;
  if (!autHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = autHeader.split(' ')[1];
  jwt.verify(token, '8e0351db8cc426e24f1dbb80e7490af1688419707e1c77254cb32a63ab4ca21f2a312da82b894a9436f3da45c1fdb26af4f864ebd70ae094fa1f8a70c1e76c56', function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run (){
try{
 await client.connect()
  const itemsCollection = client.db('lather_database').collection('manufacturerItems')
  const userCollection = client.db('lather_database').collection('user')
  const blogsCollection = client.db('lather_database').collection("blogs");
  const reviewCollection = client.db('lather_database').collection("reviews");
  const ordersCollection = client.db('lather_database').collection("orders");

// Api for blogs data
app.get("/blogs", async (req, res) => {
  const query = {};
  const cursor = blogsCollection.find(query);
  const blogs = await cursor.toArray();
  res.send(blogs);
});
// Blog Details APi
app.get('/blogs/:id',async(req,res)=> {

  const id =req.params.id;
  const query= {_id: ObjectId(id)};
  const blog=await blogsCollection.findOne(query);
  res.send(blog)
})

  


// Api for my maunfacturer Items
app.get('/manufacturerItems', async(req,res)=>{

  const query ={}
  const cursor = itemsCollection.find(query)
  const items = await cursor.toArray()
  res.send(items)

})

//single items API
app.get('/manufacturerItems/:id', async(req,res)=>{
  const id = req.params.id;
  const query ={_id: ObjectId(id) };
  const singleItem = await itemsCollection.findOne(query);
  res.send(singleItem);

})
// APi for upload data on database 

app.post("/manufacturerItems", async (req, res)=> {
  const newItem = req.body;
  const result = await itemsCollection.insertOne(newItem);
  res.send(result);

});

//Delete

    app.delete("/manufacturerItems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

// Api for my maunfacturer Items
app.get('/reviews', async(req,res)=>{

  const query ={}
  const cursor = reviewCollection.find(query)
  const items = await cursor.toArray()
  res.send(items)

})
// Api for my add review
app.post("/reviews", async (req, res)=> {
  const newItem = req.body;
  const result = await reviewCollection.insertOne(newItem);
  res.send(result);

});
// all user api
app.get('/user',  async(req,res)=>{

  const users =await userCollection.find().toArray()
  res.send(users)

})

// single User api
app.get('/user/:email', async(req,res)=>{
const email =req.params.email;
const user =await userCollection.findOne({email:email})
res.send(user)

});

// admin
app.get('/admin/:email',async(req,res)=>{
const email= req.params.email;
const user =await userCollection.findOne({email:email})
const isAdmin = user.role === "admin";
res.send({admin: isAdmin});

})
//user ADMIN  API
app.put('/user/admin/:email',  async (req,res) =>{

  const email =req.params.email;
    const filter = {email: email};
    const updateDoc ={
      $set: {role:'admin'}, 
    }
    const result =await userCollection.updateOne(filter,updateDoc);
    res.send(result ) 
})

app.put('/user/:email', async (req,res) =>{

  const email =req.params.email;
  const user = req.body;
  const filter = {email: email};
  const options = {upsert: true};
  const updateDoc ={
    $set: user, 
  };
  const result =await userCollection.updateOne(filter,updateDoc,options);

  const token =jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'2h'})
  res.send({result, token} )
})

app.get('/orders', async(req,res)=>{

  const query ={}
  const cursor = ordersCollection.find(query)
  const allOrder = await cursor.toArray()
  res.send(allOrder)

})

app.get('/orders', async(req,res)=>{
  const email =req.query.email
  const query ={}
  const cursor = ordersCollection.find(query)
  const SingleOrder = await cursor.toArray()
  res.send(SingleOrder)

})

// Api post for orders
app.post("/orders", async (req, res)=> {
  const newOrder = req.body;
  const result = await ordersCollection.insertOne(newOrder);
  res.send(result);

});

app.delete("/orders/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await ordersCollection.deleteOne(query);
  res.send(result);
});



}



finally{

}
}
run ().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Leather Factory Running')
})

app.listen(port, () => {
  console.log(`leather factory server app listening on port ${port}`)
})