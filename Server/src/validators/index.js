const { z } = require('zod');

const objectId = z.string().min(1);

const authSchemas = {
  register: z.object({
    body: z.object({
      firstName: z.string().min(2, 'First name must be at least 2 characters'),
      lastName: z.string().min(2, 'Last name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      role: z.enum(['student', 'instructor', 'admin']).optional(),
    }),
  }),
  verifyOtp: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
    }),
  }),
  resendOtp: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),
  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
    }),
  }),
  resetPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    }),
  }),
  changePassword: z.object({
    body: z.object({
      oldPassword: z.string().min(1, 'Old password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    }),
  }),
  refreshToken: z.object({ body: z.object({}) }),
};

const categorySchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1, 'Category name is required'),
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
  }),
  update: z.object({
    params: z.object({ categoryId: objectId }),
    body: z.object({
      name: z.string().min(1, 'Category name is required').optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
  }),
};

const courseSchemas = {
  courseIdParam: z.object({ params: z.object({ courseId: objectId }) }),
  create: z.object({
    body: z.object({
      name: z.string().min(1, 'Course name is required'),
      description: z.string().optional(),
      category: objectId,
      price: z.union([z.string().min(1), z.number()]),
      discount: z.union([z.string(), z.number()]).optional(),
      level: z.string().optional(),
      language: z.string().optional(),
      whatYouWillLearn: z.any().optional(),
      requirements: z.any().optional(),
    }),
  }),
  update: z.object({
    params: z.object({ courseId: objectId }),
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      category: objectId.optional(),
      price: z.union([z.string(), z.number()]).optional(),
      discount: z.union([z.string(), z.number()]).optional(),
      level: z.string().optional(),
      language: z.string().optional(),
      isPublished: z.union([z.string(), z.boolean()]).optional(),
      whatYouWillLearn: z.any().optional(),
      requirements: z.any().optional(),
    }).partial(),
  }),
};

const sectionSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1, 'Section name is required'),
      description: z.string().optional(),
      courseId: objectId,
      order: z.union([z.string(), z.number()]).optional(),
    }),
  }),
  update: z.object({
    params: z.object({ sectionId: objectId }),
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      order: z.union([z.string(), z.number()]).optional(),
    }),
  }),
};

const subSectionSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1, 'Lesson name is required'),
      description: z.string().optional(),
      content: z.string().optional(),
      sectionId: objectId,
      duration: z.union([z.string(), z.number()]).optional(),
      order: z.union([z.string(), z.number()]).optional(),
    }),
  }),
  update: z.object({
    params: z.object({ subSectionId: objectId }),
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      duration: z.union([z.string(), z.number()]).optional(),
      order: z.union([z.string(), z.number()]).optional(),
    }),
  }),
};

const profileSchemas = {
  updateProfile: z.object({
    body: z.object({
      gender: z.string().optional(),
      phone: z.string().optional(),
      bio: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    }),
  }),
  updateUserRole: z.object({
    params: z.object({ userId: objectId }),
    body: z.object({ role: z.enum(['student', 'instructor', 'admin']) }),
  }),
};

const ratingSchemas = {
  createRating: z.object({
    body: z.object({
      courseId: objectId,
      rating: z.number().min(1).max(5),
      review: z.string().optional(),
    }),
  }),
};

const paymentSchemas = {
  createOrder: z.object({
    body: z.object({
      courseId: objectId,
    }),
  }),
  verifyPayment: z.object({
    body: z.object({
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().min(1),
      courseId: objectId,
    }),
  }),
};

const enrollmentSchemas = {
  progressAction: z.object({
    body: z.object({
      courseId: objectId,
      subSectionId: objectId,
    }),
  }),
};

module.exports = {
  authSchemas,
  categorySchemas,
  courseSchemas,
  sectionSchemas,
  subSectionSchemas,
  profileSchemas,
  ratingSchemas,
  paymentSchemas,
  enrollmentSchemas,
};
