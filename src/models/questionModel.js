const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const questionSchema = new mongoose.Schema(
    {
        description: { 
            type:String, required:true,trim:true
         },
        tag: { 
            type: [{ type: String, trim: true}] 
        },
        askedBy: {
            type: ObjectId,
            ref:'user'
         },
        deletedAt: { 
            type:Date     // when the document is deleted 
        },
        isDeleted: { type:Boolean, default: false },
       
    }, { timestamps: true }
)
module.exports = mongoose.model('question', questionSchema)
