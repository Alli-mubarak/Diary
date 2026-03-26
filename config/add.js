import mongoose, {Schema} from "mongoose";

const entrySchema = new Schema(
    {
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
    try {
        const { description} = req.body;
        if( !description){
            return res.status(400).json({
                message: "All fields are required!"
            });
        }
        const newEntry = await Entry.create({ description});
        console.log('Entry added successfully')
        res.status(201).json({
            message: "Entry added successfully",
            entry:  newEntry
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
    try {
        const entries = await Entry.find();
        res.status(200).json(entries)
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// get an entry
const getAnEntry= async (req, res) => {
    try {
        const post = await Entry.findById(req.params.id);
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// update entry
const updateEntry = async (req, res) => {
    try {
        console.log(Object.keys(req.body).length);
        // basic validation to check if the body is empty
        // {name:x, description:y, age:z} --> [name, description, age]
        if(Object.keys(req.body).length === 0){
            return res.status(400).json({
                message: "No data provided for update"
            });
        }
        const entry = await Entry.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!entry){
            return res.status(404).json({
                message: "Entry not found"
            })
        }
        res.status(200).json({
            message: "Entry Updated Successfully",
            entry: entry
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

// delete post
const deleteEntry = async (req, res) =>{
    try {
        const deleted = await Entry.findByIdAndDelete(req.params.id);
        if(!deleted){
            return res.status(404).json({
                message: "Entry not found!"
            })
        }
        res.status(200).json({
            message: "Entry deleted successfully!"
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}
export{createEntry, getEntries, getAnEntry, updateEntry, deleteEntry}