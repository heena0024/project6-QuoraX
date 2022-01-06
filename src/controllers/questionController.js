const questionModel = require('../models/questionModel.js');
const answerModel = require('../models/answerModel.js');
const validator = require("../validator/validator");


const createQuestion = async function (req, res) {
    try {
        const data = req.body;
        const { description, tag, askedBy } = data;

        //validation start
        if (!validator.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please provide valid request body" })
        }

        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "description is required" })
        }
        if (!validator.isValid(tag)) {
            return res.status(400).send({ status: false, message: "tag is required" })
        }
        if (!validator.isValid(askedBy)) {
            return res.status(400).send({ status: false, message: "askedBy is required" })
        }

        //validation end
        questionData = {
            description,
            tag,
            askedBy
        }
        const saveQuestionData = await questionModel.create(questionData);
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

const getQuestion = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false } //complete object details
        let allQuestion = await questionModel.find(filterQuery).select({ description: 1, tag: 1, askedBy: 1 })
       // console.log("qqqqqqqqqqq", allQuestion)

       allQuestion.forEach(async function (allQuestion) {
          let idOfQuestion = allQuestion._id;
          for (let i=0; i<allQuestion.length;i++)
           //const answerId = await answerModel.find({ qustionId: idOfQuestion })
      // console.log("answerId",answerId)

           if (idOfQuestion === answerId) {
               console.log("hy hello data id")
           }
        //  console.log("id of question::", idOfQuestion)
           let findAnswerData = await answerModel.find(idOfQuestion).select({ questionId:1,text: 1, answeredBy: 1, createdAt: 1 })//.sort({ createdAt: sort })
          //console.log("find answer data::::::", findAnswerData)
       

});
        let questionData = await questionModel.find(filterQuery._id).select({ description: 1, tag: 1, askedBy: 1 })
       // console.log("questionData", questionData)
        let Data = {
            questionDetails: allQuestion,
            answer: findAnswerData
        };
        res.status(200).send({
                status: true,
                message: `Successfully fetched all answer of question `,
                data: Data,
            });
      // });
        } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

// const getQuestion = async function (req, res) {
//     try {
//         // const findQuestionData = await questionModel.find({isDeleted:false});
//         // console.log(findQuestionData,"findQuestiondata")

//         const filterQuery = { isDeleted: false } //complete object details.
//         const queryParams = req.query;
//         const { tag, sort } = queryParams;

//         let allQuestion = await questionModel.find(filterQuery)
//         console.log(allQuestion, "qqqqqqqqqqq")


//         //sorting the products acc. to prices => 1 for ascending & -1 for descending.
//         if (validator.isValid(sort)) {

//             if (!((sort == 1) || (sort == -1))) {
//                 return res.status(400).send({ status: false, message: `sort should be 1 or -1 ` })
//             }
//         }
//             // if (Array.isArray(question) && question.length === 0) {
//             //     return res.status(404).send({ Status: false, message: 'No question found' })
//             // }

//         const findAnswerData = await answerModel.find(allQuestion._id).select({ text: 1, answeredBy: 1, createdAt: 1 }).sort({ createdAt: sort })
//         console.log("find answer data::::::",findAnswerData)
//         if (!findAnswerData.length > 0) {
//             let Data = {
//                 answer: `No answer  for this question`
//             };
//             res.status(200).send({ status: true, data: Data });
//             return;
//         } else {
//             let questionData = await questionModel.find(filterQuery).select({ description: 1, tag: 1, askedBy: 1 })
// console.log("questionData",questionData)
//             let Data = {

//                 answer: findAnswerData

//             };
//             res.status(200).send({
//                 status: true,
//                 message: `Successfully fetched all answer of question `,
//                 data: Data,
//             });
//         }
//     } catch (error) {
//         return res.status(500).send({
//             status: false,
//             message: "Something went wrong",
//             error: error.message,
//         });
//     }
// };



const getQuestionById = async function (req, res) {
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
        return res.status(200).send({ status: true, message: "Profile found successfully.", data: findQuestion })
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
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
                message: "Invalid request parameters. Please provide user's details to update."
            })
        }
        const findQuestion = await questionModel.findOne({ _id: questionId })
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
        // if (question.askedBy.toString() != userIdFromToken) {
        //     res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
        //     return
        // }


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

