
import mongoose, {Schema} from "mongoose";

const entrySchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
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

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  password: { type: String, required: function() { return !this.googleId; } },
  refreshToken: { type: String },
  tokenExpiration: { type: Date },
  entries:[entrySchema],
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
    role: {
    type: String,
    enum: ['user', 'moderator', 'admin'], // Restricts values to this array
    default: 'user'                      // Standard fallback role
  },
  profilePic: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
export default User;

    
