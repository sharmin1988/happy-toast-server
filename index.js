const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT||5000

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Happy toast server is running , HappyLy!!!!')
})


const uri = `mongodb+srv://${process.env.ADD_USER}:${process.env.ADD_PASSWORD}@cluster0.ex1o8oo.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
        const serviceCollection = client.db('happyToastDb').collection('services')

        app.get('/servicesHome', async(req, res) => {
            const query = {}
            const services = await serviceCollection.find(query).limit(3).toArray()
            res.send(services)
        })
        app.get('/services', async(req, res) => {
            const query = {}
            const services = await serviceCollection.find(query).toArray()
            res.send(services)
        })
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id
            console.log(id)
            const query = {_id:ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)
            
        })

    }
    finally{

    }
}
run().catch(err => console.error(err))




app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})