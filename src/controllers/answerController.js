const questionModel = require('../models/questionModel.js');
const userModel = require('../models/userModel.js');
const answerModel = require('../models/answerModel.js');
const validator = require("../validator/validator");




const createAnswer = async function (req, res) {
    try {
        const requestBody = req.body
        const { questionId, userId, text } = requestBody
        let userIdFromToken = req.userId
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "please provide valid request body" })
        }
        if (!validator.isValid(questionId)) {
            return res.status(400).send({ status: false, message: "questionId is required" })
        }
        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is required" })
        } if (!validator.isValid(text)) {
            return res.status(400).send({ status: false, message: "text is required" })
        }
        const findQuestion = await questionModel.findOne({ _id: questionId })
       
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
        // if (findUserProfile._id.toString() != userIdFromToken) {
        //     res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
        //     return
        // }
        const answer = 
            {
            answeredBy: findUser._id,
                questionId : questionId,
                    text: text

        };
        console.log(answer,"answer")
    
         const saveAnswerData = await answerModel.create(answer);
         console.log("answer by main maian",saveAnswerData)
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



const getAnswerById = async function (req, res) {
    try {
        const questionId = req.params.questionId
        //validation starts
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: "Invalid questionId in params." })
        }
        //validation ends
        const findQuestion = await questionModel.findOne({ _id: questionId })
        if (!findQuestion) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${questionId}`
            })
        }
        const findAnswerByQuestionId = await answerModel.find({ questionId: questionId}).select({text:1,answeredBy:1})
        console.log("answer", findAnswerByQuestionId)
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
        //Authentication & authorization
        // if (findAnswer.answeredBy.toString() != userIdFromToken) {
        //     res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
        //     return
        // }
let { text } = requestBody;
        let changeAnswerDetails = await answerModel.findOneAndUpdate({ _id: answerId }, {
text:text
        }, { new: true })
        return res.status(200).send({ status: true, data: changeAnswerDetails })


} catch (error) {
    return res.status(500).send({
        status: false,
        message: "Something went wrong",
        error: error.message,
    });
}
};




const deleteAnswer = async function (req, res) {
    try {
        let requestBody = req.body
        const userId= requestBody.userId
        const questionId = requestBody.questionId
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "please provide valid request body" })
        }
        if (!validator.isValid(questionId)) {
            return res.status(400).send({ status: false, message: "questionId is required" })
        }
        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is required" })
        }
} catch (error) {
    return res.status(500).send({
        status: false,
        message: "Something went wrong",
        error: error.message,
    });
}
};
module.exports = { createAnswer, getAnswerById, updateAnswer, deleteAnswer };