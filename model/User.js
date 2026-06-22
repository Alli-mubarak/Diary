
import mongoose, {Schema} from "mongoose";


const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  entries:[
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
  ],
  displayName: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePic: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
export default User;

    
