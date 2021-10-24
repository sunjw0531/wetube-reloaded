import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email : {type : String, required : true, unique : true},
    avatarUrl : String,
    socialOnly : {type : Boolean, default : false},
    username : {type : String, required: true, unique : true},
    password : {type : String},
    name : {type : String, required : true},
    location :String,
    comments : [
        {type : mongoose.Schema.Types.ObjectId, ref : "Comment"}
    ],
    // 한 user에는 여러개의 video가 있을 수 있으므로 Array 형식
    videos : [
        {type : mongoose.Schema.Types.ObjectId, required : true, ref : 'Video'}
    ],
});

userSchema.pre('save', async function(){
    
    // this = user
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 5);
    }
})

const User = mongoose.model("User", userSchema);
export default User;