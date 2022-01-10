const questionModel = require('../models/questionModel.js');
const answerModel = require('../models/answerModel.js');
const validator = require("../validator/validator");
const userModel = require('../models/userModel.js');

//-----------------------------                        CREATE QUESTION                                ---------------------
const createQuestion = async function (req, res) {
    try {
        const data = req.body;
        const { description, tag, askedBy } = data;
        let userIdFromToken = req.userId

        //validation start
        if (!validator.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please provide valid request body" })
        }

        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "description is required" })
        }
        if (!validator.isValid(askedBy)) {
            return res.status(400).send({ status: false, message: "askedBy is required" })
        }
        if (!(validator.isValidObjectId(askedBy))) {
            return res.status(400).send({ status: false, message: "Not a valid userId" });;
        }
        //validation end
        const userDetails = await userModel.find({ _id: askedBy, isDeletd: false })
        // console.log("user details",userDetails)

        if (!userDetails) {
            return res.status(400).send({ status: false, message: "user does not exist" })
        }

        //Authentication & authorization
        if (askedBy.toString() != userIdFromToken) {
            console.log("hy hy auth")
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }
        if (userDetails[0].creditScore == 0) {
            return res.status(400).send({ status: false, message: "user score is 0 that's why cann't create question" })
        }
        const userScoreDecrease = userDetails[0]["creditScore"] - 100
        console.log("user details score", userScoreDecrease)

        questionData = {
            description,
            tag,
            askedBy
        }
        const saveQuestionData = await questionModel.create(questionData);
        const userDetails2 = await userModel.updateOne({ _id: askedBy, isDeleted: false }, { creditScore: userScoreDecrease })

        return res
            .status(201)
            .send({
                status: true,
                message: "question created successfully.",
                data: saveQuestionData
            });


    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

//-----------------------                                  GET QUESTIONS                           --------------------------
const getQuestion = async function (req, res) {
    try {

        const queryParams = req.query;
        const { tag, sort } = queryParams;
       
        if (validator.isValid(sort)) {
            if (!((sort == 1) || (sort == -1))) {
                return res.status(400).send({ status: false, message: `sort should be 1 or -1 ` })
            }
        }
        if (validator.isValid(tag)) {
            // if (validator.isValid(sort)) {
            //     if (!((sort == 1) || (sort == -1))) {
            //         return res.status(400).send({ status: false, message: `sort should be 1 or -1 ` })
            //     }
            // }

            console.log("tag", tag)
            const tagsArr = tag.trim().split(',').map(x => x.trim())
            // data['tag'] = { $all: tagsArr }
            console.log("tagsArr::", tagsArr)

            const tagFrom = await questionModel.aggregate([{ "$match": { $and: [{ tag: { $in: tagsArr } }, { isDeleted: false }] } },
            {
                $lookup:
                {
                    from: "answers",
                    localField: "_id",
                    foreignField: "questionId",
                    as: "answer"
                }
            }, { $sort: { createdAt: -1} }
            ])
            console.log("tagFrom", tagFrom)

            res.status(200).send({
                status: true,
                message: `Successfully fetched all answer of question `,
                data: tagFrom,
            });

        }
        const data = await questionModel.aggregate([{
            $lookup:
            {
                from: "answers",
                localField: "_id",
                foreignField: "questionId",
                as: "answer"
            }
        }, { $sort: { "createdAt": -1 } }])
        res.status(200).send({
            status: true,
            message: `Successfully fetched all answer of question `,
            data: data,
        });

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
}
//-----------------------------                       GET QUESTION BY ID                           ------------------------

const getQuestionById = async function (req, res) {
    try {
        const questionId = req.params.questionId
        //validation starts
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: "Invalid questionId in params." })
        }
        //validation ends
        const findQuestion = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!findQuestion) {
            return res.status(400).send({
                status: false,
                message: `question doesn't exists by ${questionId}`
            })
        }
        const findAnswer = await answerModel.find({ questionId: questionId, isDeleted: false }).sort({ createdAt: -1 })
        const questionAnswer = {
            question: findQuestion,
            answer: findAnswer
        }
        return res.status(200).send({ status: true, message: "question found successfully.", data: questionAnswer })
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

//------------------------                      UPDATE QUESTION BY ID                         -----------------------------------
const updateQuestionById = async function (req, res) {
    try {
        let requestBody = req.body
        let questionId = req.params.questionId
        let userIdFromToken = req.userId


        //Validation starts.
        if (!validator.isValidObjectId(questionId)) {
            res.status(400).send({ status: false, message: `${questionId} is not a valid user id` })
            return
        }

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: " Please provide user's details to update."
            })
        }
        const findQuestion = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!findQuestion) {
            return res.status(400).send({
                status: false,
                message: `question doesn't exists by ${questionId}`
            })
        }
        //Authentication & authorization
        if (findQuestion.askedBy.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }

        let { description, tag } = requestBody;
      //  const tagsArr = tag.trim().split(',').map(x => x.trim())

        let changeQuestionDetails = await questionModel.findOneAndUpdate({ _id: questionId }, {

            description: description,
            $set: { tag: tag }
        }, { new: true })
        return res.status(200).send({ status: true, data: changeQuestionDetails })

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

//------------------------                DELETE QUESTION                          ------------------------------
const deleteQuestionById = async function (req, res) {
    try {
        const questionId = req.params.questionId
        let userIdFromToken = req.userId

        //validation starts
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid product id` })
        }
        //vaidation ends.

        const question = await questionModel.findOne({ _id: questionId })
        if (!question) {
            return res.status(400).send({ status: false, message: `question doesn't exists by ${questionId}` })
        }

        //Authentication & authorization
        if (question.askedBy.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }


        if (question.isDeleted == false) {
            await questionModel.findOneAndUpdate({ _id: questionId }, { $set: { isDeleted: true, deletedAt: new Date() } })

            return res.status(200).send({ status: true, message: `question deleted successfully.` })
        }
        return res.status(400).send({ status: true, message: `question has been already deleted.` })

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

module.exports = { createQuestion, getQuestion, getQuestionById, updateQuestionById, deleteQuestionById };

