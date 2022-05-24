const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ehyud.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
try{
 await client.connect()
  const itemsCollection = client.db('lather_database').collection('manufacturerItems')
  const userCollection = client.db('lather_database').collection('user')

// Api for my maunfacturer Items
app.get('/manufacturerItems', async(req,res)=>{

  const query ={}
  const cursor = itemsCollection.find(query)
  const items = await cursor.toArray()
  res.send(items)

})


app.get('/user', async(req,res)=>{

  const query = {}
  const cursor = userCollection.find(query)
  const users =await cursor.toArray()
  res.send(users)

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
  res.send(result)
})
///  single user
app.get('/user/:id', async(req,res)=>{

  const id =req.params.id;
  const query ={_id:ObjectId(id)}
  const result= await userCollection.findOne(query)
  res.send(result)
})

// Post User add new user api

app.post('/user',async(req,res)=>{
  const newUser =req.body;
  console.log('add new user',newUser);
  const result =await userCollection.insertOne(newUser)
  res.send(result)

})

}
finally{

}
}
run ().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Leather Factory Running')
})

app.listen(port, () => {
  console.log(`leather factory app listening on port ${port}`)
})