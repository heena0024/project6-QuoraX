const questionModel = require('../models/questionModel.js');
const userModel = require('../models/userModel.js');
const answerModel = require('../models/answerModel.js');
const validator = require("../validator/validator");



//----------------------------------------                       CREATE ANSWER                           ------------------------
const createAnswer = async function (req, res) {
    try {
        const requestBody = req.body
        const { questionId, userId, text } = requestBody
        let userIdFromToken = req.userId
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "please provide valid request body" })
        }
        if (!validator.isValidObjectId(questionId)) {
            res.status(400).send({ status: false, message: `${questionId} is not a valid question id` })
            return
        }

        if (!validator.isValid(questionId)) {
            return res.status(400).send({ status: false, message: "questionId is required" })
        }
        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
            return
        }

        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: "answerId is required" })
        } if (!validator.isValid(text)) {
            return res.status(400).send({ status: false, message: "text detail is required" })
        }
        const findQuestion = await questionModel.findOne({ _id: questionId ,isDeleted:false})
       // console.log("QUESTION DETAILS:::::", findQuestion)
        if (!findQuestion) {
            return res.status(400).send({
                status: false,
                message: `question doesn't exists by ${questionId}`
            })
        }
        const findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({
                status: false,
                message: `user doesn't exists by ${userId}`
            })
        }
        // Authentication & authorization
        if (findUser._id.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        } 
        const userIdFromUserCollection = findUser._id.toString()
        console.log("user id from user collection", userIdFromUserCollection)
        const askedByFromQuestionCollection = findQuestion.askedBy.toString()
        console.log("askedby from question collection", askedByFromQuestionCollection)
        if (userIdFromUserCollection == askedByFromQuestionCollection) {
            console.log("hy hy same same ")
            return res.status(400).send({
                status: false,
                message: `can't write answer becouse  ${userId} is author of question`
            })
        }
        const userScoreIncrease = findUser.creditScore + 200
        console.log("userScoreIncrease::", userScoreIncrease)
        const userDetails2 = await userModel.updateOne({ _id:userId }, { creditScore: userScoreIncrease })

        const answer =
        {
            answeredBy: findUser._id,
            questionId: questionId,
            text: text
        };
        //console.log(answer, "answer")

        const saveAnswerData = await answerModel.create(answer);
       
       // console.log("answer by main maian", saveAnswerData)
        return res
            .status(201)
            .send({
                status: true,
                message: "answer created successfully.",
                data: saveAnswerData
            });



    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

//---------------------------                              GET ANSWER BY ID                       --------------------------//

const getAnswerById = async function (req, res) {
    try {
        const questionId = req.params.questionId
        //validation starts
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: "Invalid questionId in params." })
        }
        //validation ends
        const findQuestion = await questionModel.findOne({ _id: questionId ,isDeleted:false})
        if (!findQuestion) {
            return res.status(400).send({
                status: false,
                message: `question doesn't exists by ${questionId}`
            })
        }
        const findAnswerByQuestionId = await answerModel.find({ questionId: questionId,isDeleted:false }).select({ text: 1, answeredBy: 1 }).sort({createdAt:-1})
        if (!findAnswerByQuestionId) {
            return res.status(400).send({
                status: false,
                message: `answer doesn't exists by ${questionId}`
            })
        }
        // console.log("answer", findAnswerByQuestionId)
        let Data = {
            questionDetails: findQuestion,
            answer: findAnswerByQuestionId
        };
        res.status(200).send({
            status: true,
            message: `Successfully fetched all answer of question `,
            data: Data,
        });


    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
//--------------------------------------              UPDATE ANSWER                             -----------------------------//
const updateAnswer = async function (req, res) {
    try {
        let requestBody = req.body
        const answerId = req.params.answerId
        let userIdFromToken = req.userId

        //validation starts
        if (!validator.isValidObjectId(answerId)) {
            return res.status(400).send({ status: false, message: "Invalid answerId in params." })
        }

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: "Invalid request parameters. Please provide user's details to update."
            })
        }
        //validation ends

        const findAnswer = await answerModel.findOne({ _id: answerId })
        if (!findAnswer) {
            return res.status(400).send({
                status: false,
                message: `answer doesn't exists by ${answerId}`
            })
        }
       // console.log("answeredBy:", findAnswer.answeredBy, "token userid:", userIdFromToken)
        //Authentication & authorization
        if (findAnswer.answeredBy.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }
        let { text } = requestBody;
        if (!validator.validString(text)) {
            return res.status(400).send({ status: false, message: "text is missing." })
        }

        let changeAnswerDetails = await answerModel.findOneAndUpdate({ _id: answerId }, {
            text: text
        }, { new: true })
        return res.status(201).send({ status: true, data: changeAnswerDetails })


    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};


//--------------------------------              DELETE ANSWER                     -------------------------------------//

const deleteAnswer = async function (req, res) {
    try {
        const answerId = req.params.answerId;
        let requestBody = req.body
        let userIdFromToken = req.userId

        //validating answerId
        if (!validator.isValidObjectId(answerId)) {
            return res.status(400).send({ status: false, message: "Invalid answerId in params." })
        }
        const findAnswer = await answerModel.findOne({ _id: answerId,isDeleted:false })
        if (!findAnswer) {
            return res.status(400).send({
                status: false,
                message: `answer doesn't exists by ${answerId} `
            })
        }

        let { userId, questionId } = requestBody
        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is not given" })
        }
        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid id` });
        }
        if (!validator.isValid(questionId)) {
            return res.status(400).send({ status: false, message: `questionid is not given` })
        }
        if (!(validator.isValidObjectId(questionId))) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid id` });
        }

        //Authentication & authorization
        if (userId.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }
        const deleteAnswer = await answerModel.findOneAndUpdate({ _id: answerId, answeredBy: userId }, { isDeleted: true, deletedAt: new Date()  })
        return res.status(200).send({
            status: true,
            message: "answer deleted successfully",
        
        })


    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
module.exports = { createAnswer, getAnswerById, updateAnswer, deleteAnswer };