const express = require('express')
const app = express();
var cors = require('cors')
// DATEN übertragung läuft über Middleware bodyparser oder express.json()
app.use(express.json())
app.use(cors())
const PORT = process.env.PORT || 3001
const { MongoClient, Db } = require('mongodb')
const uri = 'mongodb+srv://pngu:AB0dNaJUXo9bdS27@tedavi100.2dpkus9.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(uri)
const mongoose = require('mongoose')
const User = require('./userschema');



async function loadMember(response) {
            try {
            //connection
            let database = client.db('trackerdb')

            let collection = database.collection('members')   
            //findall method is CURSOR (hasNext()) or toArray Promise
    
            const cursor = collection.find({});
            const collectionArr = cursor.toArray()
            collectionArr.then((item)=> { 
                response.json(item)
            })
        }
        catch (e) {
            console.error(e)
        }
}


function insertMember (request) {
            let database = client.db('trackerdb')
            let collection = database.collection('members')  
            collection.insertOne(request.body)
        }



 async function insertLogs(requestBody) {
            try {
                client.db('trackerdb')
                const database = client.db('trackerdb')
                const logs = database.collection('logs')
        
                logs.insertOne(requestBody).then((res)=> {
                    console.log("Inserted!: "+res )
                })  

            }
            catch (e) {
                console.error(e)
            }
}


async function getLogs(logs,members,response) {
        const cursor = logs.find();
        while (await cursor.hasNext()) {
        let item = await cursor.next()
        members.push(item)
        }
        
        console.log(members)
        response.json(members)
}

////////////////////////////////////////////////////////////////


// RUN DATABASE FIRST!
app.route('/members').get((req,res)=> {
    console.log("GET METHOD")
    loadMember(res)
}).post((req,res)=> {
    console.log("POST METHOD")
    console.log(req.body)
    insertMember(req)
    res.end()
})


app.post('/login', (req,res)=> {
   
    console.log(req.body)
    const database = client.db('trackerdb')
    const logs = database.collection('members')
    const query = {name:req.body.name}
    logs.findOne(query).then((result)=> {  
        if (result === null) {
            res.status(403).send()
        }
        else {
            res.send({result})
        }
        })
})



app.route('/logs')
    .get((req,res)=> {
        try {
            let members = []
            const database = client.db('trackerdb')
            const logs = database.collection('logs')
            getLogs(logs,members,res)
        }

        catch (e) {
            console.log("error")
        }})
    .post((req,res)=> {
        console.log("Timestamped!")
        insertLogs(req.body)
        res.end()
    })


app.get('/user', (req,res)=> {

    try {
         mongoose.connect(uri, {useNewUrlParser: true,
            useUnifiedTopology: true, dbName:"timestamps" })

        const user =  new User({
             name:"Aleyna",
             time: new Date() ,
             online:false
         })


         res.json(user)
        }

    catch (e) {
        console.log(e)
    }
  
    
})



app.listen(PORT, ()=> {
    console.log("Server is running..")
})