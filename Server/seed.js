const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);


// Student Email      : seed_1791165442975_300@eduflect.test
// Student Password   : Test@12345
// Instructor Email   : seed_1791165442975_0@eduflect.test
// Instructor Password: Test@12345

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");

// ==========================================
// MODELS
// ==========================================

const User = require("./src/models/user.model");
const Profile = require("./src/models/profile.model");
const Category = require("./src/models/category.model");
const Course = require("./src/models/course.model");
const Section = require("./src/models/section.model");
const SubSection = require("./src/models/subSection.model");
const RatingAndReview = require("./src/models/ratingAndReview.model");
const CourseProgress = require("./src/models/courseProgress.model");

// ==========================================
// CONFIG
// ==========================================

const COURSE_COUNT = 2000;
const USER_COUNT = 3000;

// Har seed run ka unique ID
const SEED_ID = Date.now();

// Login ke liye same password
const SEED_PASSWORD = "Test@12345";

// Bulk insert batch size
const BATCH_SIZE = 500;

// Public test video
const VIDEO_URLS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
];

// ==========================================
// CATEGORIES
// ==========================================

const categoryNames = [
  "Web Development",
  "Data Science",
  "Design",
  "Marketing",
  "Mobile Development",
  "DevOps",
  "AI/ML",
  "Business",
  "Photography",
  "Music",
];

// ==========================================
// HELPERS
// ==========================================

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
}

// ==========================================
// DATABASE
// ==========================================

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("\n=================================");
  console.log("MongoDB Connected");
  console.log("=================================\n");
}

// ==========================================
// CATEGORIES
// ==========================================

async function seedCategories() {
  console.log("Creating/reusing categories...");

  const categories = [];

  for (const name of categoryNames) {
    const category = await Category.findOneAndUpdate(
      { name },

      {
        $setOnInsert: {
          name,
          description: `${name} courses`,
          icon: null,
        },
      },

      {
        new: true,
        upsert: true,
      }
    );

    categories.push(category);
  }

  console.log(
    `✅ Categories ready: ${categories.length}`
  );

  return categories;
}

// ==========================================
// USERS
// ==========================================

async function seedUsers() {
  console.log(
    `\nCreating ${USER_COUNT} users...`
  );

  // IMPORTANT:
  // Real bcrypt hash
  const passwordHash = await bcrypt.hash(
    SEED_PASSWORD,
    10
  );

  const users = [];

  // 10% instructors
  const instructorCount = Math.floor(
    USER_COUNT * 0.10
  );

  for (let i = 0; i < USER_COUNT; i++) {
    const role =
      i < instructorCount
        ? "instructor"
        : "student";

    users.push({
      firstName: faker.person.firstName(),

      lastName: faker.person.lastName(),

      // Guaranteed unique
      email: `seed_${SEED_ID}_${i}@eduflect.test`,

      // Valid bcrypt hash
      password: passwordHash,

      refreshToken: null,

      role,

      isVerified: true,

      profile: null,

      enrolledCourses: [],
    });
  }

  const insertedUsers = [];

  for (
    let i = 0;
    i < users.length;
    i += BATCH_SIZE
  ) {
    const batch = users.slice(
      i,
      i + BATCH_SIZE
    );

    const result = await User.insertMany(
      batch
    );

    insertedUsers.push(...result);

    console.log(
      `Users: ${insertedUsers.length}/${USER_COUNT}`
    );
  }

  console.log(
    `✅ Users inserted: ${insertedUsers.length}`
  );

  return insertedUsers;
}

// ==========================================
// PROFILES
// ==========================================

async function seedProfiles(users) {
  console.log("\nCreating profiles...");

  const profiles = users.map((user, index) => ({
    user: user._id,

    gender: faker.helpers.arrayElement([
      "male",
      "female",
      "other",
    ]),

    phone: `9${String(
      SEED_ID
    ).slice(-9)}${String(index).padStart(5, "0")}`.slice(
      0,
      15
    ),

    avatar: null,

    avatarPublicId: null,

    bio: faker.lorem.sentence(),
  }));

  const insertedProfiles = [];

  for (
    let i = 0;
    i < profiles.length;
    i += BATCH_SIZE
  ) {
    const batch = profiles.slice(
      i,
      i + BATCH_SIZE
    );

    const result =
      await Profile.insertMany(batch);

    insertedProfiles.push(...result);

    console.log(
      `Profiles: ${insertedProfiles.length}/${users.length}`
    );
  }

  // User -> Profile
  const userUpdates =
    insertedProfiles.map((profile) => ({
      updateOne: {
        filter: {
          _id: profile.user,
        },

        update: {
          $set: {
            profile: profile._id,
          },
        },
      },
    }));

  await User.bulkWrite(userUpdates);

  console.log(
    `✅ Profiles inserted: ${insertedProfiles.length}`
  );
}

// ==========================================
// COURSES
// ==========================================

async function seedCourses(
  users,
  categories
) {
  console.log(
    `\nCreating ${COURSE_COUNT} courses...`
  );

  const instructorIds = users
    .filter(
      (user) => user.role === "instructor"
    )
    .map((user) => user._id);

  const studentIds = users
    .filter(
      (user) => user.role === "student"
    )
    .map((user) => user._id);

  if (!instructorIds.length) {
    throw new Error(
      "No instructors available"
    );
  }

  if (!studentIds.length) {
    throw new Error(
      "No students available"
    );
  }

  console.log(
    `Instructors: ${instructorIds.length}`
  );

  console.log(
    `Students: ${studentIds.length}`
  );

  const courses = [];

  // Student -> courses mapping
  const studentEnrollments =
    new Map();

  studentIds.forEach((id) => {
    studentEnrollments.set(
      id.toString(),
      []
    );
  });

  for (let i = 0; i < COURSE_COUNT; i++) {
    const instructor =
      randomItem(instructorIds);

    const category =
      randomItem(categories);

    // 5-20 students per course
    const enrolledStudents =
      faker.helpers.arrayElements(
        studentIds,
        {
          min: 5,
          max: 20,
        }
      );

    // Save User -> Course relation
    enrolledStudents.forEach(
      (studentId) => {
        const key =
          studentId.toString();

        studentEnrollments
          .get(key)
          .push(null);
      }
    );

    courses.push({
      // Unique course name
      name: `${faker.lorem.words({
        min: 3,
        max: 6,
      })} - Seed ${SEED_ID}-${i}`,

      description:
        faker.lorem.paragraphs(2),

      thumbnail:
        `https://picsum.photos/seed/eduflect-${SEED_ID}-${i}/800/450`,

      thumbnailPublicId: null,

      instructor,

      category: category._id,

      // Will be filled later
      sections: [],

      price: faker.number.int({
        min: 499,
        max: 4999,
      }),

      discount: randomItem([
        0,
        10,
        20,
        30,
        40,
      ]),

      ratingAndReviews: [],

      studentsEnrolled: enrolledStudents,

      isPublished: true,

      level: randomItem([
        "beginner",
        "intermediate",
        "advanced",
      ]),

      language: randomItem([
        "Hindi/English",
        "English",
        "Hindi",
      ]),

      totalDuration: randomInt(
        60,
        1200
      ),

      whatYouWillLearn: [
        "Learn practical concepts",
        "Build real-world projects",
        "Understand production development",
        "Learn best practices",
        "Improve problem-solving skills",
      ],

      requirements: [
        "Basic programming knowledge",
        "Laptop or computer",
        "Internet connection",
      ],
    });
  }

  const insertedCourses = [];

  for (
    let i = 0;
    i < courses.length;
    i += BATCH_SIZE
  ) {
    const batch = courses.slice(
      i,
      i + BATCH_SIZE
    );

    const result =
      await Course.insertMany(batch);

    insertedCourses.push(...result);

    console.log(
      `Courses: ${insertedCourses.length}/${COURSE_COUNT}`
    );
  }

  // ========================================
  // Build User -> Course enrollment map
  // ========================================

  const courseEnrollmentMap =
    new Map();

  insertedCourses.forEach((course) => {
    course.studentsEnrolled.forEach(
      (studentId) => {
        const key =
          studentId.toString();

        if (
          !courseEnrollmentMap.has(
            key
          )
        ) {
          courseEnrollmentMap.set(
            key,
            []
          );
        }

        courseEnrollmentMap
          .get(key)
          .push(course._id);
      }
    );
  });

  // ========================================
  // Update Users
  // ========================================

  const userBulkOperations = [];

  for (const [
    studentId,
    courseIds,
  ] of courseEnrollmentMap) {
    userBulkOperations.push({
      updateOne: {
        filter: {
          _id: studentId,
        },

        update: {
          $set: {
            enrolledCourses:
              courseIds,
          },
        },
      },
    });
  }

  if (userBulkOperations.length) {
    await User.bulkWrite(
      userBulkOperations
    );
  }

  console.log(
    "✅ User enrollments updated"
  );

  return {
    insertedCourses,
    studentIds,
  };
}

// ==========================================
// SECTIONS + SUBSECTIONS
// ==========================================

async function seedSections(
  courses
) {
  console.log(
    "\nCreating sections and subsections..."
  );

  const sections = [];
  const subsections = [];

  // ========================================
  // Every course
  // 5 sections
  // Each section = 4 subsections
  //
  // 2000 courses
  // x 5 sections
  // = 10,000 sections
  //
  // 10,000 sections
  // x 4 subsections
  // = 40,000 subsections
  // ========================================

  for (
    let courseIndex = 0;
    courseIndex < courses.length;
    courseIndex++
  ) {
    const course =
      courses[courseIndex];

    const courseSectionIds = [];

    for (
      let sectionIndex = 1;
      sectionIndex <= 5;
      sectionIndex++
    ) {
      const sectionId =
        new mongoose.Types.ObjectId();

      sections.push({
        _id: sectionId,

        name: `Section ${sectionIndex}: ${randomItem(
          [
            "Introduction",
            "Fundamentals",
            "Core Concepts",
            "Advanced Concepts",
            "Project",
          ]
        )}`,

        description:
          faker.lorem.paragraph(),

        course: course._id,

        subSections: [],

        order: sectionIndex,
      });

      courseSectionIds.push(
        sectionId
      );

      // 4 lessons per section
      for (
        let subIndex = 1;
        subIndex <= 4;
        subIndex++
      ) {
        const subSectionId =
          new mongoose.Types.ObjectId();

        subsections.push({
          _id: subSectionId,

          name: `Lesson ${subIndex}: ${faker.lorem.words(
            {
              min: 2,
              max: 5,
            }
          )}`,

          description:
            faker.lorem.sentence(),

          section: sectionId,

          content:
            faker.lorem.paragraphs(2),

          // Actual video URL
          videoUrl:
            VIDEO_URLS[
              (subIndex - 1) %
                VIDEO_URLS.length
            ],

          duration: randomInt(
            5,
            45
          ),

          order: subIndex,
        });

        // Add subsection reference
        const section =
          sections[
            sections.length - 1
          ];

        section.subSections.push(
          subSectionId
        );
      }
    }

    // Course -> Sections
    course.sections =
      courseSectionIds;
  }

  // ========================================
  // Insert Sections
  // ========================================

  const insertedSections = [];

  for (
    let i = 0;
    i < sections.length;
    i += BATCH_SIZE
  ) {
    const batch = sections.slice(
      i,
      i + BATCH_SIZE
    );

    const result =
      await Section.insertMany(batch);

    insertedSections.push(...result);

    console.log(
      `Sections: ${insertedSections.length}/${sections.length}`
    );
  }

  // ========================================
  // Insert SubSections
  // ========================================

  const insertedSubSections = [];

  for (
    let i = 0;
    i < subsections.length;
    i += BATCH_SIZE
  ) {
    const batch = subsections.slice(
      i,
      i + BATCH_SIZE
    );

    const result =
      await SubSection.insertMany(
        batch
      );

    insertedSubSections.push(
      ...result
    );

    console.log(
      `SubSections: ${insertedSubSections.length}/${subsections.length}`
    );
  }

  // ========================================
  // Update Courses with section IDs
  // ========================================

  const courseUpdates =
    courses.map((course) => ({
      updateOne: {
        filter: {
          _id: course._id,
        },

        update: {
          $set: {
            sections:
              course.sections,
          },
        },
      },
    }));

  for (
    let i = 0;
    i < courseUpdates.length;
    i += BATCH_SIZE
  ) {
    await Course.bulkWrite(
      courseUpdates.slice(
        i,
        i + BATCH_SIZE
      )
    );
  }

  console.log(
    `\n✅ Sections created: ${insertedSections.length}`
  );

  console.log(
    `✅ SubSections created: ${insertedSubSections.length}`
  );

  return {
    insertedSections,
    insertedSubSections,
  };
}

// ==========================================
// RATINGS + REVIEWS
// ==========================================

async function seedRatings(
  courses,
  students
) {
  console.log(
    "\nCreating ratings and reviews..."
  );

  const ratings = [];

  for (const course of courses) {
    // 2-5 reviews per course
    const reviewUsers =
      faker.helpers.arrayElements(
        students,
        {
          min: 2,
          max: 5,
        }
      );

    for (const student of reviewUsers) {
      ratings.push({
        user: student._id,

        course: course._id,

        rating: randomInt(3, 5),

        review: faker.lorem.sentences(
          2
        ),
      });
    }
  }

  const insertedRatings = [];

  for (
    let i = 0;
    i < ratings.length;
    i += BATCH_SIZE
  ) {
    const batch = ratings.slice(
      i,
      i + BATCH_SIZE
    );

    const result =
      await RatingAndReview.insertMany(
        batch
      );

    insertedRatings.push(...result);

    console.log(
      `Ratings: ${insertedRatings.length}/${ratings.length}`
    );
  }

  // ========================================
  // Course -> ratingAndReviews
  // ========================================

  const ratingMap = new Map();

  insertedRatings.forEach(
    (rating) => {
      const key =
        rating.course.toString();

      if (!ratingMap.has(key)) {
        ratingMap.set(key, []);
      }

      ratingMap
        .get(key)
        .push(rating._id);
    }
  );

  const courseUpdates = [];

  for (const [
    courseId,
    ratingIds,
  ] of ratingMap) {
    courseUpdates.push({
      updateOne: {
        filter: {
          _id: courseId,
        },

        update: {
          $set: {
            ratingAndReviews:
              ratingIds,
          },
        },
      },
    });
  }

  if (courseUpdates.length) {
    await Course.bulkWrite(
      courseUpdates
    );
  }

  console.log(
    `✅ Ratings created: ${insertedRatings.length}`
  );
}

// ==========================================
// COURSE PROGRESS
// ==========================================

async function seedCourseProgress(
  courses,
  students,
  sections,
  subsections
) {
  console.log(
    "\nCreating course progress..."
  );

  const progress = [];

  // Limit progress data
  // so DB doesn't become unnecessarily huge
  const sampleCourses =
    courses.slice(0, 500);

  for (const course of sampleCourses) {
    const enrolledStudents =
      course.studentsEnrolled;

    const selectedStudents =
      faker.helpers.arrayElements(
        enrolledStudents,
        {
          min: Math.min(
            1,
            enrolledStudents.length
          ),
          max: Math.min(
            3,
            enrolledStudents.length
          ),
        }
      );

    const courseSections =
      sections.filter(
        (section) =>
          section.course.toString() ===
          course._id.toString()
      );

    const courseSubSections =
      subsections.filter((sub) => {
        const sectionExists =
          courseSections.some(
            (section) =>
              section._id.toString() ===
              sub.section.toString()
          );

        return sectionExists;
      });

    for (const studentId of selectedStudents) {
      const completed =
        faker.helpers.arrayElements(
          courseSubSections,
          {
            min: 0,
            max: Math.min(
              3,
              courseSubSections.length
            ),
          }
        );

      const completionPercentage =
        courseSubSections.length
          ? Math.min(
              100,
              Math.round(
                (completed.length /
                  courseSubSections.length) *
                  100
              )
            )
          : 0;

      progress.push({
        user: studentId,

        course: course._id,

        completedSubSections:
          completed.map(
            (sub) => sub._id
          ),

        completionPercentage,

        lastAccessed: new Date(),

        isCompleted:
          completionPercentage === 100,
      });
    }
  }

  if (!progress.length) {
    console.log(
      "No course progress generated."
    );

    return;
  }

  const insertedProgress = [];

  for (
    let i = 0;
    i < progress.length;
    i += BATCH_SIZE
  ) {
    const batch = progress.slice(
      i,
      i + BATCH_SIZE
    );

    const result =
      await CourseProgress.insertMany(
        batch,
        {
          ordered: false,
        }
      );

    insertedProgress.push(...result);

    console.log(
      `Progress: ${insertedProgress.length}/${progress.length}`
    );
  }

  console.log(
    `✅ Course progress created: ${insertedProgress.length}`
  );
}

// ==========================================
// MAIN SEED
// ==========================================

async function seed() {
  try {
    console.log("\n");
    console.log(
      "=========================================="
    );
    console.log(
      "        EDUFLECT PERFORMANCE SEED"
    );
    console.log(
      "=========================================="
    );

    console.log(`Seed ID       : ${SEED_ID}`);
    console.log(`Users         : ${USER_COUNT}`);
    console.log(`Courses       : ${COURSE_COUNT}`);
    console.log(
      `Password      : ${SEED_PASSWORD}`
    );

    await connectDB();

    // ======================================
    // 1. Categories
    // ======================================

    const categories =
      await seedCategories();

    // ======================================
    // 2. Users
    // ======================================

    const users =
      await seedUsers();

    // ======================================
    // 3. Profiles
    // ======================================

    await seedProfiles(users);

    // ======================================
    // 4. Courses
    // ======================================

    const {
      insertedCourses,
      studentIds,
    } = await seedCourses(
      users,
      categories
    );

    // ======================================
    // Students
    // ======================================

    const students = users.filter(
      (user) =>
        user.role === "student"
    );

    // ======================================
    // 5. Sections + SubSections
    // ======================================

    const {
      insertedSections,
      insertedSubSections,
    } = await seedSections(
      insertedCourses
    );

    // ======================================
    // 6. Ratings + Reviews
    // ======================================

    await seedRatings(
      insertedCourses,
      students
    );

    // ======================================
    // 7. Course Progress
    // ======================================

    await seedCourseProgress(
      insertedCourses,
      students,
      insertedSections,
      insertedSubSections
    );

    // ======================================
    // FINAL
    // ======================================

    console.log("\n");
    console.log(
      "=========================================="
    );
    console.log(
      "       🎉 SEED COMPLETED SUCCESSFULLY"
    );
    console.log(
      "=========================================="
    );

    console.log(
      `Users           : ${users.length}`
    );

    console.log(
      `Profiles        : ${users.length}`
    );

    console.log(
      `Categories      : ${categories.length}`
    );

    console.log(
      `Courses         : ${insertedCourses.length}`
    );

    console.log(
      `Sections        : ${insertedSections.length}`
    );

    console.log(
      `SubSections     : ${insertedSubSections.length}`
    );

    console.log("\n");
    console.log(
      "=========================================="
    );
    console.log(
      "           TEST LOGIN ACCOUNT"
    );
    console.log(
      "=========================================="
    );

    const testStudent =
      users.find(
        (user) =>
          user.role === "student"
      );

    const testInstructor =
      users.find(
        (user) =>
          user.role === "instructor"
      );

    console.log(
      `Student Email      : ${testStudent.email}`
    );

    console.log(
      `Student Password   : ${SEED_PASSWORD}`
    );

    console.log(
      `Instructor Email   : ${testInstructor.email}`
    );

    console.log(
      `Instructor Password: ${SEED_PASSWORD}`
    );

    console.log(
      "=========================================="
    );

    await mongoose.connection.close();

    console.log(
      "\nMongoDB connection closed."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ SEEDING FAILED"
    );

    console.error(error);

    await mongoose.connection.close();

    process.exit(1);
  }
}

seed();