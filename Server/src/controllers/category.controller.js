const Category = require("../models/category.model");
const Course = require("../models/course.model");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    return res.status(200).json({
      success: true,
      message: "Categories fetched",
      data: categories,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    return res.status(200).json({
      success: true,
      message: "Category fetched",
      data: category,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.getCategoryWithCourses = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    const courses = await Course.find({
      category: categoryId,
      isPublished: true,
    })
      .populate("instructor", "firstName lastName")
      .sort("-createdAt");
    return res.status(200).json({
      success: true,
      message: "Category fetched",
      data: { category, courses },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    const category = await Category.create({ name, description, icon });
    return res
      .status(201)
      .json({ success: true, message: "Category created", data: category });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon } = req.body;
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, icon },
      { new: true },
    );
    if (!category)
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    return res.status(200).json({
      success: true,
      message: "Category updated",
      data: category,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const courseCount = await Course.countDocuments({ category: categoryId });
    if (courseCount > 0)
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${courseCount} courses use this category`,
      });
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};
