const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const questionController = require("../controllers/questionController");
const answerController = require("../controllers/answerController");
const middleware= require("../middleware/author");


router.post("/user_register", userController.createUser)
router.post("/login", userController.userLogin)

//Authentication and authorisation required
router.get("/user/:userId/profile", middleware.authentication,userController.getProfile)
router.put("/user/:userId/profile", middleware.authentication, userController.updateProfile)


//F2
router.post("/questions", questionController.createQuestion )
router.get("/questions", questionController.getQuestion)
router.get("/questions/:questionId", questionController.getQuestionById)
//Authentication and authorisation required
router.put("/questions/:questionId", middleware.authentication, questionController.updateQuestionById)
router.delete("/questions/:questionId", questionController.deleteQuestionById)


//f3
router.post("/answers",answerController.createAnswer)
router.get("/questions/:questionId/answer", answerController.getAnswerById)
//Authentication and authorisation required
router.put("/answer/:answerId", answerController.updateAnswer)



module.exports = router;