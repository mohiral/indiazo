const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // This will store the mobile number
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // Password field
  clientId: { type: String },
  isLoggedIn: { type: Boolean, default: false },
})

module.exports = mongoose.model("User", UserSchema)

