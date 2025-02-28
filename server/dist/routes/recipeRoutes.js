"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recipeController_1 = require("../controllers/recipeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes are protected
router.use(authMiddleware_1.protect);
router.route('/')
    .get(recipeController_1.getRecipes)
    .post(recipeController_1.createRecipe);
router.route('/:id')
    .get(recipeController_1.getRecipe)
    .put(recipeController_1.updateRecipe)
    .delete(recipeController_1.deleteRecipe);
exports.default = router;
