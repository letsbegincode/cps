const mongoose = require("mongoose");
const dotenv = require("dotenv");
const coursesData = require("./course-data");
const Course = require("./models/Course"); // Adjust path as needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/MasterlyDB";

async function injectCourses() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    for (const course of coursesData) {
      const exists = await Course.findOne({ _id: course._id });

      if (exists) {
        console.log(`⚠️ Skipping existing course: ${course._id}`);
        continue;
      }

      await Course.create(course);
      console.log(`✅ Inserted: ${course.title}`);
    }

    console.log("🎉 All courses injected successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error injecting courses:", error);
    process.exit(1);
  }
}

injectCourses();