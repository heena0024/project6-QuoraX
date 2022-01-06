const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
    {
        fname: { type:String, required:true },
        lname: { type: String, required: true},
        email: {
            type: String,
            validate: {
                validator: function (email) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
                }, message: 'Please fill a valid email address', isAsync: false,
                required: true, unique: true
            }
        },
        phone: {
            type: String,
            // validate: {
            //     validator: function (phone) {
            //        // console.log(phone, "phone");
            //         console.log(/^\+(?:[0-9] ?){10,12}[0-9]$/.test(phone))
            //         return /^\+(?:[0-9] ?){10,12}[0-9]$/.test(phone)
            //     }, message: 'Please fill a valid phone number', isAsync: false, unique: true
            // }
        },
   password: { type:String, required:true, minLen: 8, maxLen :15} // encrypted password

     }, { timestamps: true })

module.exports = mongoose.model('User', userSchema)