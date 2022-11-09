const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Happy toast server is running , HappyLy!!!!')
})


const uri = `mongodb+srv://${process.env.ADD_USER}:${process.env.ADD_PASSWORD}@cluster0.ex1o8oo.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded
        next()
    })
}

async function run() {
    try {
        const serviceCollection = client.db('happyToastDb').collection('services')
        const reviewCollection = client.db('happyToastDb').collection('reviews')

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN)
            res.send({ token })
        })

        app.get('/servicesHome', async (req, res) => {
            const query = {}
            const services = await serviceCollection.find(query).limit(3).toArray()
            res.send(services)
        })
        app.get('/services', async (req, res) => {
            const query = {}
            const services = await serviceCollection.find(query).toArray()
            res.send(services)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)

        })

        // REVIEW api
        app.get('/reviews', async(req, res) => {
            const query = {}
            const reviews = await reviewCollection.find(query).toArray()
            res.send(reviews)
        })
        
        app.get('/userReviews', verifyJwt, async (req, res) => {
            const decoded = req.decoded
            if(decoded.email !== req.query.email){
                return  res.status(403).send({ message: 'Forbidden access' })
            }
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews)
            res.send(result)
        })

        app.patch('/reviews/:id', async(req, res) => {
            const id = req.params.id
            const status = req.body.status
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set:{
                    status: status
                }
            }
            const result = await reviewCollection.updateOne(query,updatedDoc)
            res.send(result)

        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(err => console.error(err))




app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})