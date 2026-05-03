const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { 
  getGoals, 
  createGoal, 
  deleteGoal,
  contributeToGoal
} = require("../controllers/goalController");

router.get("/", auth, getGoals);
router.post("/", auth, createGoal);
router.delete("/:id", auth, deleteGoal); 
router.patch("/:id/contribute", auth, contributeToGoal);
module.exports = router;