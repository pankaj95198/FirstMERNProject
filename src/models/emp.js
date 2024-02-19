const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const empSchema = new mongoose.Schema({
    firstName : {
        type:String,
        required:true,
        minlength:3
    },
    lastname:{
        type:String,
        required:false,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("This email is maybe wrong.")
            }
        }
    },
    gender:{
        type:String,
        required:true,
    },
    phoneNumber:{
        type:Number,
        unique:true,
        required:true,
        minlength:10,
        maxlength:10
    },
    age:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true,
        minlength:3,
    },
    confirmpassword:{
        type:String,
        required:true,
        minlength:3,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

empSchema.methods.generateAuthToken = async function(){
    try{
        const token = await jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token;
    }catch(err){
        res.send(err);
        console.log(err);
    }
}

empSchema.pre("save", async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})

const Employee = new mongoose.model("Register", empSchema);

module.exports = Employee;