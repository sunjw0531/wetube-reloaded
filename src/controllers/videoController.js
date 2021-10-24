import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const home = async(req,res) =>{
    const videos = await Video.find({})
    .sort({createdAt:"desc"})
    .populate("owner");
    return res.render("home", {pageTitle : "Home", videos});
}

export const watch = async(req, res) =>{
    const id = req.params.id;
    // populate("ref값")을 사용하면 
    // Video 스키마의 ref 대상의 값들 또한 포함하여 가져올 수 있다
    const video = await Video.findById(id).populate("owner").populate("comments");

    if(!video){
        return res.status(404).render("404", {pageTitle : "Video not found."})
    }
    return res.render("watch", {pageTitle : video.title, video});
}

export const getEdit = async(req, res) =>{
    const id = req.params.id;
    const {
        user:{_id}
    } = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", {pageTitle : "Video not found"});
    }

    if(String(video.owner) !== String(_id)){
        req.flash("error", "Not Authorized");
        return res.status(403).redirect("/");
    }
    return res.render("edit", {pageTitle : `Edit : ${video.title}`, video});
}

export const postEdit = async (req,res) =>{
    const id = req.params.id;
    const {
        user:{_id}
    } = req.session;
    const {title, description, hashtags} = req.body;
    // const video = await Video.findById(id);
    const video = await Video.exists({_id : id});
    if(!video){
        return res.render("404", {pageTitle : "Video not found"});
    }
    
    const videoOwner = await Video.findById(id);
    if(String(videoOwner.owner) !== String(_id)){
        req.flash("error", "You are not the owner of the video.");
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags)
    });
    // video.title = title;
    // video.description = description;
    // video.hashtags = hashtags
    //     .split(",")
    //     .map((word) => word.startsWith('#')? word : `#${word}`);
    // await video.save();
    req.flash("success", "Changes Saved.");
    return res.redirect(`/videos/${id}`);
}

export const getUpload = (req,res) =>{
    return res.render("upload", {pageTitle : "Upload Video"});
}

export const postUpload = async(req,res) =>{
    // 현재 로그인 된 사용자의 id
    const {user : {_id}} = req.session;

    const {video, thumb} = req.files;
    const {title, description, hashtags} = req.body;
    // save 방식
    // const video = new Video({
    //     title,
    //     description,
    //     createdAt : Date.now(),
    //     hashtags: hashtags.split(",").map((word)=>`#${word}`),
    //     meta:{
    //         views : 0,
    //         rating : 0,
    //     }
    // });
    // await video.save();
    try{
        // await Video.create({
        //     title,
        //     description,
        //     fileUrl : file.path,
        //     // 비디오 업로드할 때 Video 스키마의 owner에
        //     // 현재 로그인된 사용자의 Id를 저장
        //     owner : _id,
        //     hashtags:Video.formatHashtags(hashtags),
        // });
        const newVideo = await Video.create({
            title,
            description,
            fileUrl : video[0].path,
            thumbUrl : thumb[0].path,
            // 비디오 업로드할 때 Video 스키마의 owner에
            // 현재 로그인된 사용자의 Id를 저장
            owner : _id,
            hashtags:Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        
        return res.redirect("/");

    }catch(error){
        return res.status(400).render("upload", {pageTitle : "Upload Video", 
        errorMessage : error._message});
    }
    
}

export const deleteVideo = async(req,res) =>{
    const {id} = req.params;
    const {
        user:{_id}
    } = req.session;
    const video = await Video.findById(id);
    // User DB에 있는 videos 삭제하기
    const user = await User.findById(_id);

    if(!video){
        return res.render("404", {pageTitle : "Video not found"});
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }

    await Video.findByIdAndDelete(id);
    // User DB에 있는 videos 삭제하기
    user.videos.splice(user.videos.indexOf(id),1);
    user.save();

    return res.redirect("/");
}

export const search = async(req,res) =>{
    const {keyword} = req.query;
    let videos = [];
    if(keyword){
        // search
        videos = await Video.find({
            title : {
                $regex: new RegExp(keyword, "i") // i 는 대소문자 구분x 기능
            },
        }).populate("owner");
    }
    return res.render("search", {pageTitle : "Search", videos});
}

export const registerView = async(req,res) =>{
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video){
        // status를 단독으로 사용할때는 send를 해줘야한다.
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views +1;
    // save할 때는 await
    await video.save();
    // video를 업데이트하고나서 ok의 신호 200 return
    return res.sendStatus(200);
}

// export const createComment = async(req,res) =>{
//     const {
//         session : {user},
//         body : {text},
//         params: {id},
//     } = req;
    
//     const users = await User.find
//     const video = await Video.findById(id);
//     if(!video){
//         return res.sendStatus(404);
//     }
//     const comment = await Comment.create({
//         text,
//         owner : user._id,
//         video : id
//     });
//     video.comments.push(comment._id);
//     video.save();
    

//     return res.status(201).json({newCommentId : comment._id});
// }

export const createComment = async (req, res) => {
    const {
      session: { user },
      body: { text },
      params: { id },
    } = req;
    const users = await User.findById(user._id);
    const video = await Video.findById(id);
    if (!video) {
      return res.sendStatus(403);
    }
  
    const comment = await Comment.create({
      text,
      owner: user._id,
      video: id,
    });
    req.session.user.comments.push(comment._id);
    users.comments.push(comment._id);
    video.comments.push(comment._id);
    users.save();
    video.save();
    return res.status(201).json({ newCommentId: comment._id });
  };

////////
export const deleteComment = async (req, res) => {
    const {
      body: { dataId },
      session: { user },
    } = req;
    const comment = await Comment.findById(dataId)
      .populate("owner")
      .populate("video");
    const commentOwner = comment.owner.comments;
    const commentVideo = comment.video.comments;
    if (
      comment.owner._id.toString() === user._id ||
      user.videos.includes(comment.video._id.toString())
    ) {
      commentOwner.splice(commentOwner.indexOf(dataId), 1);
      commentVideo.splice(commentVideo.indexOf(dataId), 1);
      req.session.user.comments = commentOwner;
      req.session.save();
      comment.video.save();
      comment.owner.save();
      await Comment.findByIdAndDelete(dataId);
    } else {
      return res.status(400);
    }
  };