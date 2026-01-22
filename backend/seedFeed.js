import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./src/models/Post.js";
import User from "./src/models/User.js";
import Company from "./src/models/Company.js";

dotenv.config();

const seedDummyFeed = async () => {
    try {
        await mongoose.connect(`${process.env.DATABASE_CONNECTION_URL}/superio-job-portal`);
        console.log("Connected to MongoDB");

        // Clear existing posts (optional, but good for clean seed)
        // await Post.deleteMany({});

        const user = await User.findOne({});
        const company = await Company.findOne({});

        if (!user || !company) {
            console.log("Error: Need at least one user and one company in DB to seed feed.");
            process.exit(1);
        }

        const dummyPosts = [
            {
                content: "Just finished a productive coding session! There's nothing like the feeling of clean, optimized code. Excited to see where this project goes! 💻✨ #CodingLife #SoftwareEngineering",
                imageUrl: "/uploads/dummy/post2.png",
                authorId: user._id,
                authorType: "User",
                likes: [company._id],
                comments: [
                    {
                        userId: company._id,
                        userType: "Company",
                        text: "Great work! Keep it up. We're always looking for talented engineers who value clean code.",
                        date: new Date()
                    }
                ]
            },
            {
                content: "Big news! Our recruitment team is expanding. We're looking for passionate individuals to join our mission of connecting top talent with amazing opportunities. Check out our latest openings! 🚀 #Hiring #TechJobs #Recruitment",
                imageUrl: "/uploads/dummy/post3.png",
                authorId: company._id,
                authorType: "Company",
                likes: [user._id],
                comments: []
            },
            {
                content: "Morning vibes at the office. A clear workspace leads to a clear mind. Ready to tackle today's challenges! ☕🖥️ #OfficeVibes #Productivity #Tech",
                imageUrl: "/uploads/dummy/post1.png",
                authorId: user._id,
                authorType: "User",
                likes: [],
                comments: []
            }
        ];

        await Post.insertMany(dummyPosts);
        console.log("Dummy feed seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding feed:", error);
        process.exit(1);
    }
};

seedDummyFeed();
