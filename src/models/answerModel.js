const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const answerSchema = new mongoose.Schema(
{
    answeredBy: { type:ObjectId, ref: "User", require:true },
text: { type:String, require: true },
        questionId: { type: ObjectId, ref: "question", require: true },
    }, { timestamps: true }
)
module.exports = mongoose.model('answer', answerSchema)
