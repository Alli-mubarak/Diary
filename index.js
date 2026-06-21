import connectDB from './config/db.js';
import mongoose from 'mongoose'
import {createEntry, getEntries, getAnEntry, updateEntry, deleteEntry} from './config/add.js';
import express from 'express';
import {Router} from 'express'
const app = express();
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config();
import bodyParser from 'body-parser';
import { OAuth2Client } from 'google-auth-library';

//let d = new Date();
//let currentTime = d.toLocaleString();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json())

app.use(express.static('icon'));
const __dirname = import.meta.dirname;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


//middleware
app.use(function middleware(req,res,next){
let d = new Date();
let currentTime = d.toLocaleString();
console.log(req.method, req.path, req.ip, currentTime,);
next();
});

//default route
app.get('/',(req, res)=>{
//res.sendFile(__dirname, 'views/index.html');
console.log(req.query)
console.log('default path requested! \n');
    res.sendFile(__dirname + '/public/index.html');
});

//add entry route
app.post('/add', createEntry);

//get all entries route
app.get('/getEntries', getEntries);

//edit an entry
app.post('/editEntry/:id', updateEntry);

//delete an entry
app.delete('/deleteEntry/:id', deleteEntry);


// Connect to the database
connectDB();

// Middleware (e.g., JSON parsing)
app.use(express.json());


// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});


//google login
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Endpoint where frontend sends the Google ID Token
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        // Verify the token integrity with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });

        // Extract the user profile data
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        // DATABASE LOGIC GOES HERE:
        // 1. Check if user with 'sub' (Google ID) or 'email' exists in database.
        // 2. If not, create a new user record.
        // 3. Generate your own session token (like a JWT) for your app.

        res.status(200).json({
            message: 'Authentication successful',
            user: { id: sub, email, name, picture }
        });

    } catch (error) {
        res.status(401).json({ message: 'Invalid Google token', error: error.message });
    }
});

    //response to all wrong paths
app.use((req, res)=>{
console.log('wrong path invoked \n');
res.status(404).json({
error:'path not found'
});
});

const listener = app.listen(process.env.PORT,()=>{
console.log("app is listening on port ", listener.address().port,'\n');
});

