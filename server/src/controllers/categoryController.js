const Category = require("../models/categoryModel");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ message: "Category already exists" });

    const category = await Category.create({
      name: name.trim(),
      description
    });
    res.status(201).json({
      success: true,
      category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("courses");
    res.status(200).json({
      success: true,
      categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate("courses");
    if (!category) return res.status(404).json({
      message: "Category not found"
    });
    res.status(200).json({
      success: true,
      category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const category = await Category.findByIdAndUpdate(id, updates, { new: true });

    if (!category) return res.status(404).json({
      message: "Category not found"
    });
    res.status(200).json({
      success: true,
      category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ 
      message: "Category not found" });
    res.status(200).json({
       success: true,
        message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
       message: "Server error" });
  }
};
