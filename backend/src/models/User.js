import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  resume: { type: String, default: "" },
  headline: { type: String, default: "" },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  website: { type: String, default: "" },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
});

const User = mongoose.model("User", userSchema);

export default User;

