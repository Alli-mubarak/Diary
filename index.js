import connectDB from './config/db.js';
import mongoose from 'mongoose';
import User from './model/User.js'; //  Import User Model
import {createEntry, getEntries, getAnEntry, updateEntry, deleteEntry} from './config/routes/entries.js';
import express from 'express';
import bcrypt from 'bcrypt';
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
import MongoStore from 'connect-mongo'; // used insted of express session to save session in db

//let d = new Date();
//let currentTime = d.toLocaleString();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json())

// Middleware (e.g., JSON parsing)
app.use(express.json());

app.use(express.static('icon'));
const __dirname = import.meta.dirname;

//app.use(cors());

app.use(cors({
  origin: 'https://diary-app-omega-lime.vercel.app/', 
  credentials: true // Crucial: Allows the browser to send cookies back and forth
}));


// Connect to the database
connectDB();


// ... (after mongoose.connect)
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true
// }));
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,                            // Prevents resaving unchanged sessions
    saveUninitialized: false,                 // Prevents storing empty sessions
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 7 * 24 * 60 * 60,                // Time to live in MongoDB: 7 days (in seconds)
        autoRemove: 'native'                  // Let MongoDB handle expired session cleanup
    }),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,      // Cookie expiration: 7 days (in milliseconds)
        httpOnly: true,                       // Protects against XSS attacks
        secure: false                      // Set to true if using HTTPS in production
    }
}));


app.use(express.static(path.join(__dirname, 'public')));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

//middleware - logs the method, path, ip address and time to the console
app.use(function middleware(req,res,next){
let d = new Date();
let currentTime = d.toLocaleString();
console.log(req.method, req.path, req.ip, currentTime,);
   console.log('--- Session Debug ---');
  console.log('Incoming Cookie:', req.headers.cookie);
  console.log('Session ID:', req.sessionID);
  console.log('Session Data in memory:', req.session);
  console.log('Is Authenticated?:', req.isAuthenticated ? req.isAuthenticated() : 'No passport');
  console.log('User object:', req.user);
next();
});



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


//default route
app.get('/',(req, res)=>{
console.log(req.query)
console.log('default path requested! \n');
    res.sendFile(__dirname + '/public/pages/index.html');

});

//sign up route
app.get('/sign-up',(req, res)=>{
console.log(req.query)
console.log('sign up page  requested! \n');
  if (req.isAuthenticated()){
   return  res.redirect('/');
  }
    res.sendFile(__dirname + '/public/pages/signup.html');

});

//sign in route
app.get('/sign-in',(req, res)=>{
console.log(req.query)
console.log('sign in page  requested! \n');
  if (req.isAuthenticated()){
   return  res.redirect('/');
  }
    res.sendFile(__dirname + '/public/pages/signin.html');

});

//sign up API
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email is taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
// Hash password and save user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
  // res.send(`<h1>Welcome ${req.user.firstName}</h1><p>Email: ${req.user.email}</p><a href="/logout">Logout</a>`);
  res.redirect('/');
});

app.get('/login-failed', (req, res) => {
  res.send('Authentication failed. Please try again.');
});

// Logout Route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    
    // Destroy the session in MongoDB
    req.session.destroy((err) => {
      if (err) return res.send('Error logging out');
      
      // Clear the cookie on the client side
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});



//add entry route
app.post('/add' createEntry);

//get all entries route
app.get('/getEntries', getEntries);

//edit an entry
app.post('/editEntry/:id', updateEntry);

//delete an entry
app.delete('/deleteEntry/:id', deleteEntry);



  



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

