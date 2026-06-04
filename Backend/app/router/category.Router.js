const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.Controller");
const authcheck = require("../middleware/authChek");
const Rolecheck = require("../middleware/roleCheck");
router.post(
  "/create/category",
  authcheck,
  Rolecheck("admin"),
  categoryController.createCategory,
);
router.get(
  "/category",
  categoryController.getCategories,
);
router.get(
  "/category/single/:id",
  categoryController.getCategory,
);
router.patch(
  "/update/category/:id",
  authcheck,
  Rolecheck("admin"),
  categoryController.updateCategory,
);
router.delete(
  "/delete/category/:id",
  authcheck,
  Rolecheck("admin"),
  categoryController.deleteCategory,
);

module.exports = router;
