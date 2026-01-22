import mongoose from "mongoose";

const companySchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  headline: { type: String, default: "" }, // Tagline
  bio: { type: String, default: "" }, // About
  location: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  website: { type: String, default: "" },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followerCount: { type: Number, default: 0 },
});

const Company = mongoose.model("Company", companySchema);

export default Company;

