import mongoose from "mongoose";



const videoSchema = new mongoose.Schema({
    title : {type : String, required : true, trim : true, maxLength : 80},
    fileUrl : {type : String, required : true},
    thumbUrl : {type : String, required : true},
    description : {type : String, required : true, trim : true, minLength : 2},
    createdAt : {type : Date, required : true, default : Date.now},
    hashtags : [{type : String, trim : true}],
    meta : {    
        views : {type:Number, default : 0, required : true},
    },
    comments:[
        {type : mongoose.Schema.Types.ObjectId, ref : "Comment"}
    ],
    // User의 objectid를 owner에 저장
    owner : {type : mongoose.Schema.Types.ObjectId, required : true, ref : 'User'},
})

// const movieModel = mongoose.model("Video", videoSchema);
// export default movieModel;

videoSchema.static("formatHashtags", function(hashtags){
    return hashtags.split(",")
        .map((word) => (word.startsWith("#")? word : `#${word}`))
});

videoSchema.static("changePathFormula", function(fileUrl) {
    return fileUrl.replace(/\\/g,"/");
});

videoSchema.static("changePathFormula", function(thumbUrl) {
    return thumbUrl.replace(/\\/g,"/");
});

const Video = mongoose.model("Video", videoSchema);
export default Video;