const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

// Api for my maunfacturer Items
app.get('/manufacturerItems', async(req,res)=>{

  const query ={}
  const cursor = itemsCollection.find(query)
  const items = await cursor.toArray()
  res.send(items)

})


app.get('/user', verifyJwt,async(req,res)=>{

  const users =await userCollection.find().toArray()
  res.send(users)

})
//user ADMIN  API
app.put('/user/admin/:email', async (req,res) =>{

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

// ///  single user
// app.get('/user/:id', async(req,res)=>{

//   const id =req.params.id;
//   const query ={_id:ObjectId(id)}
//   const result= await userCollection.findOne(query)
//   res.send(result)
// })

// Post User add new user api
// app.post('/user',async(req,res)=>{
//   const newUser =req.body;
//   console.log('add new user',newUser);
//   const result =await userCollection.insertOne(newUser)
//   res.send(result)

// })

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