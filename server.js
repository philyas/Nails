const express = require('express')
const app = express();
var cors = require('cors')
// DATEN übertragung läuft über Middleware bodyparser oder express.json()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())
const PORT = process.env.PORT || 3000
const { MongoClient, Db } = require('mongodb')
const uri = process.env.URI 
const client = new MongoClient(uri)
const mongoose = require('mongoose')
const User = require('./userschema');
const Product = require('./productschema')
const Log = require('./logschema');
const UserCredential = require('./credentialschema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
app.use(cookieParser())
require("dotenv").config();



const checkToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];
        req.token = token;
        next();
    } else {
        //If header is undefined return Forbidden (403)
        res.sendStatus(403)
    }
}

const verifyToken = (req,res)=> {
    jwt.verify(req.token, process.env.JWT_KEY, (err, authorizedData) => {
        if(err){
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            //If token is successfully verified, we can send the autorized data 
            res.json({
                message: 'Successful log in',
                authorizedData
            });
            console.log('SUCCESS: Connected to protected route');
        }
    })
}



function getUser(request,response) {
          const query = request.query.username === "admin" ? {} : {name: request.query.username}

            try {
            //connection
            let database = client.db('tracker')
            let collection = database.collection('users')   
            const cursor = collection.find(query);
            const collectionArr = cursor.toArray()
            collectionArr.then((item)=> { 
            response.json(item)
            })
        }
        catch (e) {
            console.error(e)
        }
}


function postUser (request,response) {
    try {
        mongoose.connect(uri, {useNewUrlParser: true,
           useUnifiedTopology: true, dbName:"tracker" })

        const user =  new User({
            key: request.body.key,
            name:request.body.name,
            percentage: request.body.percentage,
            uri: request.body.uri
            })

            let database = client.db('tracker')
            let collection = database.collection('users')  
            collection.insertOne(user)

        response.json(user)
       }

   catch (e) {
       console.log(e)
   }  
    }



    function getProduct(response) {
        try {
        //connection
        let database = client.db('tracker')

        let collection = database.collection('products')   
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



    function postProduct(request,response) {
            try {
                mongoose.connect(uri, {useNewUrlParser: true,
                   useUnifiedTopology: true, dbName:"tracker" })
        
                const product =  new Product({
                    key: request.body.key,
                    name:request.body.name,
                    price: request.body.price,
                    colorStart: request.body.colorStart,
                    colorEnd: request.body.colorEnd
                    })
        
                    let database = client.db('tracker')
                    let collection = database.collection('products')  
                    collection.insertOne(product)
        
                response.json(product)
               }
        
           catch (e) {
               console.log(e)
           }  
        }        
    





 function postLog(request,response) {
            try {
                mongoose.connect(uri, {useNewUrlParser: true,
                    useUnifiedTopology: true, dbName:"tracker" })
         
                 const log =  new Log({
                     key: request.body.key,
                     product:request.body.product,
                     name:request.body.name,
                     date:request.body.date,
                     price:request.body.price,
                     percentage: request.body.percentage
                  })

                console.log("posted log")
            
                let database = client.db('tracker')
                let collection = database.collection('logs')   
             
                collection.insertOne(log)
                
                   response.json(log)
            }

            catch (e) {
                console.error(e)
            }
}


 function getLog(request,response) {
    const query = request.query.username === "admin" ? {} : {name: request.query.username}

    try {
        let database = client.db('tracker')
        let collection = database.collection('logs')   
        //findall method is CURSOR (hasNext()) or toArray Promise

        const cursor = collection.find(query);
        const collectionArr = cursor.toArray()
        collectionArr.then((item)=> { 
        response.json(item)
        })
    }

    catch (e) {
        console.error(e)
    }

}

////////////////////////////////////////////////////////////////

app.route('/logs')
        .get((req,res)=> {
            getLog(req,res)
        })
        .post((req,res)=> {
            postLog(req,res)
        })


// RUN DATABASE FIRST!
app.route('/users')
    .get((req,res)=> {
        console.log("GET METHOD")
            getUser(req,res)})
    .post((req,res)=> {
            console.log("POST METHOD")
            postUser(req,res)
})

app.route('/products')
    .get((req,res)=> {
        console.log("GET METHOD")
            getProduct(res)})
    .post((req,res)=> {
            console.log("POST METHOD")
            console.log(req.body)
            postProduct(req,res)
  
})



// Test QUERYS IN MONGODB for calculations


app.get('/total',   async (req,res)=> {
    let arr = []
    const name = req.query.name
    const month = parseInt(req.query.month)
    const year = parseInt(req.query.year)
    let database = client.db('tracker')
    let collection = database.collection('logs')   
    //findall method is CURSOR (hasNext()) or toArray Promise
    let pipeline=[]
    if (month !== 12) {
         pipeline = 
        [                                                //month as Index 0
            {$match: {name:name,   date: {$gt: new Date(year,month) , $lt: new Date(year,month+1) } }},
            // group for sum and multiplay _id required!!!
            // project for each row?
            { $group: { _id: "$name",  total:  {$sum :{$multiply: [ "$price", "$percentage" ], }},
                
       }},
        ]
    }

    else {
        pipeline = [                                                //month as Index 0 hier 12 für das januar im nächsten jahr
        {$match: {name:name,   date: {$gt: new Date(year,0) , $lt: new Date(year,month) } }},
        // group for sum and multiplay _id required!!!
        // project for each row?
        { $group: { _id: "$name",  total:  {$sum :{$multiply: [ "$price", "$percentage" ], }},
            
   }},
    ]
    }
  
    const cursor = collection.aggregate(pipeline)
    for await (const i of cursor) {
        arr = [...arr, i]
    }

    res.json(arr[0])

  }
)

function signupMiddleware(req,res,next) {
    if (req.body.password !== req.body.repeatpassword) {   
      return res.status(200).send({msg:"Passwords do not match!"})
    }
    else {
      next()
    }
}

app.post('/sign-up', signupMiddleware,async (req,res)=> {
    //sign in process
    const name = req.body.name
    const hashpassword = await bcrypt.hash(req.body.password,10)
    let user = new UserCredential({
        name:name,
        password:hashpassword
    })
     
    const token = jwt.sign({user_id: user.name}, process.env.JWT_KEY , {
        expiresIn: "1h"
    })
    
    let database = client.db('tracker')
    let collection = database.collection('credentials')
    collection.insertOne(user).then(()=> {
        console.log("Sent!")
    })

    res.status(201).cookie("token", token,{maxAge: 1000* 1000 }).send({token:token})


    res.end()
 })
 

 async function checkPassword (req,res,next) {
    const name = req.body.name
    const password = req.body.password

    let database = client.db('tracker')
    let collection = database.collection('credentials')
    const user = await collection.find({name:name}).toArray()

    if (user.length === 0) {
        return res.status(401).send({msg:"user not found!"})
    }

    else {
        // Wait for asynchronous!
       let hashBool = await bcrypt.compare(password,user[0].password)
        console.log(hashBool)
        if (!hashBool) {
            return res.status(401).send({msg:"password not correct!"})
        }

        const token = jwt.sign({user_id: user[0].name}, process.env.JWT_KEY, {
            expiresIn: "1h"
        })

        req.token = token
      //  res.status(201).cookie("token", token,{maxAge: 1000* 1000 }).send({token:token})

        next()
    }
 }


 app.post('/login',checkPassword ,(req,res)=> {
      res.status(201).send({token: req.token})
      res.end()
 })





 app.get('/home', checkToken, verifyToken)
/////////////

app.listen(PORT, ()=> {
    console.log("Server is running on PORT "+ PORT)
})
