const Category = require("../model/category.Model");

class CategoryController {
    //create category
  async createCategory(req, res) {
    try {
      const { name, description, icon } = req.body;

      const slug = name.toLowerCase().replace(/\s+/g, "-");

      const category = await Category.create({
        name,
        slug,
        description,
        icon,
      });

      return res.status(201).json({
        success: true,
        message: "Category created",
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
  //get all category
    async getCategories(req, res) {
    try {
      const categories = await Category.find({ isActive: true });

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
  ///get singale category
    async getCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
  //update category
    async updateCategory(req, res) {
    try {
      const { id } = req.params;

      const updated = await Category.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Updated",
        data: updated,
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
  //delete category
    async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      await Category.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Deleted",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
}

module.exports = new CategoryController()
