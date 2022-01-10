const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
    {
        fname: { type:String, required:true ,trim:true},
        lname: { type: String, required: true, trim:true},
        email: {
            type: String,
            validate: {
                validator: function (email) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
                }, message: 'Please fill a valid email address', isAsync: false,
               
            }, trim: true, required: true, unique: true,lowercase:true
        },
        phone: {
            type: String,
            validate: {
                validator: function (phone) {
                   // console.log(phone, "phone");
                   // console.log(/^\+(?:[0-9] ?){10,12}[0-9]$/.test(phone))
                    return /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)
                }, message: 'Please fill a valid phone number', unique: true
            },
            sparse: true, trim: true
        },
        creditScore:{type:Number,required:true,default:500,trim:true},
   password: { type:String, required:true, min: 8, max:15} // encrypted password

     }, { timestamps: true })

module.exports = mongoose.model('User', userSchema)