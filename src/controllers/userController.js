const userModel = require('../models/userModel.js');
const validator = require("../validator/validator");
const multer = require('multer')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const saltRounds = 10


//--------------------                             CREATE USER                             ---------------------------------------
const createUser = async function (req, res) {
    try {
        let data = req.body;
        console.log(data,"data")
    
        const { fname, lname, email, password, phone, creditScore } = data;

        //validation starts
        const bodyKeyName=Object.keys(data)               //body key name
        console.log(bodyKeyName,"body key name")
        
        if (!validator.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please provide valid request body" })
        }
        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname is required" })
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname is required" })
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        //searching email in DB to maintain its uniqueness
        const isEmailAleadyUsed = await userModel.findOne({ email })
        if (isEmailAleadyUsed) {
            return res.status(400).send({
                status: false,
                message: `${email} is alraedy in use. Please try another email Id.`
            })
        }

        //validating email using RegEx.
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
            return res.status(400).send({ status: false, message: "Invalid Email id." })

      
        //searching phone in DB to maintain its uniqueness
        const phoneInBody = bodyKeyName.includes("phone")
        if (phoneInBody){

            if (!validator.isValid(phone)) {
                return res.status(400).send({ status: false, message: "phone is required" })
            }

            //validating phone number of 10 digits only.
            if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone))) return res.status(400).send({ status: false, message: "Phone number must be a valid Indian number." })
        
            const isPhoneAleadyUsed = await userModel.findOne({ phone })
       // console.log("phone in db",isPhoneAleadyUsed)
        if (isPhoneAleadyUsed) {
            return res.status(400).send({
                status: false,
                message: `${phone} is already in use, Please try a new phone number.`
            })
        }
    }

        const creditScoreInBody = bodyKeyName.includes("creditScore")
        console.log("credit score in body", creditScoreInBody)
        if (creditScoreInBody){
            console.log("credit score2 ", creditScore)

            if (creditScore < 0) {
                return res.status(400).send({ status: false, message: "don't use negative values in CreditScore" });
            }


            if (!(isNaN(creditScore))) {
                console.log("credit score2 ", creditScore)

                return res.status(400).send({ status: false, message: "don't use  string value(alphabet or special character) " });
            }
          
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }
        const encryptedPassword = await bcrypt.hash(password, saltRounds) //encrypting password by using bcrypt.
        userData = {
            fname,
            lname,
            email,
            password: encryptedPassword,
            phone
        }
        const saveUserData = await userModel.create(userData);
        return res
            .status(201)
            .send({
                status: true,
                message: "user created successfully.",
                data: saveUserData
            });


    } catch (error) {
        return res.status(500).send({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
//---------------------                                 USER LOGIN                                -----------------------------
const userLogin = async function (req, res) {
    try {
        const requestBody = req.body;
        //Ectract params
        const { email, password } = requestBody;

        // Validation starts
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
        }
        if (!validator.isValid(requestBody.email)) {
            return res.status(400).send({ status: false, message: 'Email Id is required' })
        }

        if (!validator.isValid(requestBody.password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        // Validation ends

        // finding user's in DB verify the credentials.
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).send({ status: false, message: `Login failed! email id is incorrect.` });
        }
        let hashedPassword = user.password
        const encryptedPassword = await bcrypt.compare(password, hashedPassword) //converting normal password to hashed value to match it with DB's entry by using compare function.

        if (!encryptedPassword) return res.status(401).send({ status: false, message: `Login failed! password is incorrect.` });
        //Creating JWT token through userId. 
        const userId = user._id
        const token = await jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000), //time of issuing the token.
            exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7 //setting token expiry time limit.
        }, 'project6-Products_management')

        return res.status(200).send({
            status: true,
            message: `user login successfull `,
            data: {
                userId,
                token
            }
        });
    } catch (err) {
        return res.status(500).send({
            status: false,
            message: "Error is : " + err
        })
    }
}
//--------------------                         GET PROFILE                                   --------------------------------------
const getProfile = async function (req, res) {
    try {
        const userId = req.params.userId
        const userIdFromToken = req.userId
        //validation starts
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }
        //validation ends
        const findUserProfile = await userModel.findOne({ _id: userId,isDeleted:false })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${userId}`
            })
        }
        //Authentication & authorization
        if (findUserProfile._id.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }

        return res.status(200).send({ status: true, message: "Profile found successfully.", data: findUserProfile })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//------------------------------                          UPDATE PROFILE                         --------------------------
const updateProfile = async function (req, res) {
    try {
        let requestBody = req.body
        let userId = req.params.userId
        let userIdFromToken = req.userId

        //Validation starts.
        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
            return
        }

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: " Please provide user's details to update."
            })
        }
        const findUserProfile = await userModel.findOne({ _id: userId,isDeletd:false })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${userId}`
            })
        }
        //Authentication & authorization
        if (findUserProfile._id.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }

        // Extract params
        let { fname, lname, email, phone } = requestBody;

        //validations for updatation details.
        if (!validator.validString(fname)) {
            return res.status(400).send({ status: false, message: 'fname is Required' })
        }
        if (fname) {
            if (!validator.isValid(fname)) {
                return res.status(400).send({ status: false, message: "Please provide fname" })
            }
        }
        if (!validator.validString(lname)) {
            return res.status(400).send({ status: false, message: 'lname is Required' })
        }
        if (lname) {
            if (!validator.isValid(lname)) {
                return res.status(400).send({ status: false, message: "Please provide lname" })
            }
        }

        //email validation
        if (!validator.validString(email)) {
            return res.status(400).send({ status: false, message: 'email is Required' })
        }
        if (email) {
            if (!validator.isValid(email)) {
                return res.status(400).send({ status: false, message: "Please provide email" })
            }
            if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
                return res.status(400).send({ status: false, message: `Email should be a valid email address` });
            }
            let isEmailAlredyPresent = await userModel.findOne({ email: email })
            if (isEmailAlredyPresent) {
                return res.status(400).send({ status: false, message: `  email ${email} is already registered.` });
            }
        }

        //phone validation
        if (!validator.validString(phone)) {
            return res.status(400).send({ status: false, message: 'phone number is Required' })
        }
        if (phone) {
            if (!validator.isValid(phone)) {
                return res.status(400).send({ status: false, message: "Please provide Phone number." })
            }
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `Please enter a valid Indian phone number.` });
            }
            let isPhoneAlredyPresent = await userModel.findOne({ phone: phone })
            if (isPhoneAlredyPresent) {
                return res.status(400).send({ status: false, message: `phone  ${phone} is already registered.` });
            }
        }
        //Validation ends
        //object destructuring for response body.
        let changeProfileDetails = await userModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                fname: fname,
                lname: lname,
                email: email,
                phone: phone
            }
        }, { new: true })
        return res.status(200).send({ status: true, data: changeProfileDetails })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = { createUser, userLogin, getProfile, updateProfile };
