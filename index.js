const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
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

// Api for my maunfacturer Items
app.get('/manufacturerItems', async(req,res)=>{

  const query ={}
  const cursor = itemsCollection.find(query)
  const items = await cursor.toArray()
  res.send(items)

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