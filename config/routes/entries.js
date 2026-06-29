import mongoose, {Schema} from "mongoose";
import User from '../../model/User.js'; //  Import User Model
import {encrypt, decrypt} from '../../Utils/Crypt.js'; // encrypter and decrypter function import

const entrySchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
        description: {
            type: String,
            required: true,
            trim: true
        },
        
    },
    {
        timestamps: true
    }
)

const Entry = mongoose.model("Entry", entrySchema);

const createEntry = async (req, res) => {
    if(!req.isAuthenticated()){
      return res.status(401).json({message: "You are not Authorized, please log in" });
    }
    try {
        let { description} = req.body;
       const userId = req.user.id;
        if( !description){
            return res.status(400).json({
                message: "All fields are required!"
            });
        }
    description = encrypt(description, 5);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          entries: { 
           userId: userId,
            description: description 
          } 
        } 
      },
      { new: true, runValidators: true }
    );
            
        console.log('Entry added successfully');
        res.status(201).json({
            message: "Entry added successfully",
            
        })
        
    } catch (error) {
      console.log('Error occured' + error)
        res.status(500).json({
            message: "Internal Server error",
            error: error.message
        })
        
    }
}

// get all entries
const getEntries = async (req, res) => {
    if(!req.isAuthenticated()){
      return res.status(401).json({message: "You are not Authorized, please log in" });
    }
    try {
        const user = await User.findById(req.user.id);
        let entries = user.entries
        entries = entries.map(e.description => decrypt(e.description, 5))
        res.status(200).json(entries)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// get an entry
const getAnEntry= async (req, res) => {
    if(!req.isAuthenticated()){
      return res.status(401).json({message: "You are not Authorized, please log in" });
    }
    try {
        const post = await Entry.findById(req.params.id);
        res.status(200).json(post)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// update entry
const updateEntry = async (req, res) => {
    if(!req.isAuthenticated()){
      return res.status(401).json({message: "You are not Authorized, please log in" });
   }
    try {
        
        // basic validation to check if the body is empty
        // {name:x, description:y, age:z} --> [name, description, age]
        if(Object.keys(req.body).length === 0){
            return res.status(400).json({
                message: "No data provided for update"
            });
        }
        const entryId = req.params.id;
    const userId = req.user.id; 
    const { description} = req.body;   // The new data to save

    // Find entry by its ID AND ensure it belongs to the logged-in user
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "entries._id": entryId }, // Find user AND specific entry
      { 
        $set: { 
          "entries.$.description": description 
        
        } 
      },
      { new: true, runValidators: true } // Returns the modified document
    );
        if(!updatedUser){
            return res.status(404).json({
                message: "Entry not found"
            })
        }
        res.status(200).json({
            message: "Entry Updated Successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }

}

// delete post
const deleteEntry = async (req, res) =>{
    if(!req.isAuthenticated()){
      return res.status(401).json({message: "You are not Authorized, please log in" });
    }
    try {
    const userId = req.user.id;         
    const entryId = req.params.id; 

    // Strict check: Find the user AND ensure they possess this specific entry ID
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "entries._id": entryId }, 
      { 
        $pull: { entries: { _id: entryId } } 
      },
      { new: true }
    );

    // If updatedUser comes back null, either the user ID or entry ID was wrong
    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'Delete failed. User not found or entry does not belong to this user.' 
      });
    }

    res.status(200).json({
      message: 'Entry deleted successfully'
    });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}
export{createEntry, getEntries, getAnEntry, updateEntry, deleteEntry}
