import connectDB from './config/db.js';
import MongoStore from 'connect-mongo' // used insted of express session to save session in db
import mongoose from 'mongoose';
import User from './model/User.js'; //  Import User Model
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
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

//let d = new Date();
//let currentTime = d.toLocaleString();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json())

app.use(express.static('icon'));
const __dirname = import.meta.dirname;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

//google sign in

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport Google Strategy
// updated Passport Google Strategy with Async/Await Database Logic
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    // Structure the data coming from Google profile payload
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      profilePic: profile.photos[0].value
    };

    try {
      // Check if user already exists in our database
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // User exists, pass the user object to the next step
        return done(null, user);
      } else {
        // User does not exist, create and save them to MongoDB
        user = await User.create(newUser);
        return done(null, user);
      }
    } catch (err) {
      console.error(err);
      return done(err, null);
    }
  }
));


// Serialize and Deserialize User Session Data
//  Serialize user using the MongoDB object ID (_id) instead of the whole object
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user by fetching them from MongoDB using their ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
// --- Auth Routes ---

// 1. Trigger Google Sign-Up / Login Flow
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2. Google OAuth Callback Route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Successful authentication, redirect to user dashboard or home.
    res.redirect('/dashboard');
  }
);
//user check route
app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false, user: null });
  }
});

// --- Application Routes ---

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized. Please log in.');
  }
  res.send(`<h1>Welcome ${req.user.firstName}</h1><p>Email: ${req.user.email}</p><a href="/logout">Logout</a>`);
});

app.get('/login-failed', (req, res) => {
  res.send('Authentication failed. Please try again.');
});

// Logout Route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

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


// ... (after mongoose.connect)

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Don't create empty sessions
  //sessions are saved for 30 days
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 30 * 24 * 60 * 60 // 30 days in seconds (removes expired sessions automatically)
  }),
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    httpOnly: true, // Prevents cross-site scripting (XSS) attacks
    secure: process.env.NODE_ENV === 'production', // true if using HTTPS
    sameSite: 'lax'
  }
}));
  

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

