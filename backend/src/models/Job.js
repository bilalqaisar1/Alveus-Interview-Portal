import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true }, // Legacy formatted string for display
  // Structured location data for filtering
  country: { type: String, default: "" },
  countryCode: { type: String, default: "" },
  state: { type: String, default: "" },
  stateCode: { type: String, default: "" },
  city: { type: String, default: "" },
  level: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: Number, required: true },
  category: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  date: { type: Number, required: true },
  visible: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
});

// Index for location-based queries
jobSchema.index({ country: 1, state: 1, city: 1 });
jobSchema.index({ location: "text" });

const Job = mongoose.model("Job", jobSchema);

export default Job;

