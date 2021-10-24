import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";



export const getJoin = (req,res) =>{
    res.render("join", {pageTitle : "Join"});
}

export const postJoin = async(req,res) =>{
    const {name, username, email, password, password2, location} = req.body;
    const pageTitle = "Join";
    if(password !== password2){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage: "Password confirmation does not match."});
    }
    const usernameExists = await User.exists({$or: [{username},{email}] });
    if(usernameExists){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage: "This username/email is already taken."});
    }

    const emailExists = await User.exists({email});
    if(emailExists){
        return res.render("join",
         {pageTitle, errorMessage: "This email is already taken."});
    }
    try{
        await User.create({
            name : name,
            username : username,
            email:email,
            password : password,
            location : location,
        });
       
        return res.redirect("/login");
    }catch(error){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage: error._message,
        });
    }

}

export const getLogin = async(req, res) =>{
    
    res.render("login", {pageTitle : "Login"})
}

export const postLogin = async(req,res) =>{
    const {username, password} = req.body;
    const pageTitle = "Login";
    // check if account exitst
    const user = await User.findOne({username, socialOnly : false});
    if(!user){
        return res.status(400).render("login", {
            pageTitle,
         errorMessage : "An account with this username does not exists"
        });
    }
    // check if password correct
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {
            pageTitle,
         errorMessage : "Wrong password",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const startGithubLogin = (req,res) =>{
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup : false,
        scope : "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async(req,res) =>{
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id : process.env.GH_CLIENT,
        client_secret : process.env.GH_SECRET,
        code : req.query.code
    };
    
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    const tokenRequest = await (
        await fetch(finalUrl,{
        method : "POST",
        headers:{
            Accept : "application/json",
        },
    })
    ).json();
    if("access_token" in tokenRequest){
        //access api
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await (
            await fetch(`${apiUrl}/user`,{
            headers : {
                Authorization : `token ${access_token}`,
            }
        })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`,{
            headers : {
                Authorization : `token ${access_token}`,
            }
        })
        ).json();
        const emailObj = emailData.find(
            (email)=> email.primary === true && email.verified === true
        );
        if(!emailObj){
            return res.redirect("/login");
        }
        let user = await User.findOne({email : emailObj.email});
        if(!user){
            user = await User.create({
                avatarUrl : userData.avatar_url,
                name : userData.name,
                username : userData.login,
                email : emailObj.email,
                password : "",
                socialOnly : true,
                location : userData.location,
            });
            
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    }else{
        return res.redirect("/login");
    }
};



export const logout = (req,res) =>{
    // req.session.destroy();
    req.session.user = null;
    res.locals.loggedInUser = req.session.user;
    req.session.loggedIn = false;
    req.flash("info", "Log out!");
    return res.redirect("/");
}

export const getEdit = (req,res) =>{
    return res.render("edit-profile", {pageTitle : "Edit Profile"});
}

export const postEdit = async(req,res) =>{
    // const i = req.session.user.id;
    // const {name, email, username, location} = req.body;
    const {
        session : {
            // 파일을 보내지 않으면 user에 기존 avatarUrl 유지
            user: {_id, avatarUrl},
        },
        body :{name,email,username,location},
        file,
    } = req;

    // await User.findByIdAndUpdate(_id, {
    //     name,email,username,location
    // })

    // req.session.user ={
    //     ...req.session.user,
    //     name,
    //     email,
    //     username,
    //     location
    // }

    // const emailExist = User.exists({email : email});
    // const usernameExist = User.exists({username : username});

    // if(emailExist || usernameExist){
    //     return res.status(400).render("edit-profile",
    //      {pageTitle : "Edit Profile", errormessage : "username or email already exist! "});
    // }

    

    const updatedUser = await User.findByIdAndUpdate(_id, {
        // 파일 등록을 하면 avatarUrl 파일 경로로 설정 그렇지 않으면 그대로
        avatarUrl: file ? file.path : avatarUrl,
        name,email,username,location
    },
    {new : true}
    );
    req.session.user = updatedUser;
    
    return res.redirect("/users/edit");
}

export const getChangePassword = (req,res) =>{
    if(req.session.user.socialOnly === true){
        req.flash("error", "Can't change password.");
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle : "Change Password"})
}

export const postChangePassword = async(req,res) =>{
    // session에서 정보를 가져온 후
    // user.password에 새로운 비밀번호 적용 후
    // session의 정보 또한 수정
    const {
        session: {
          user: { _id },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation },
      } = req;
      const user = await User.findById(_id);
      const ok = await bcrypt.compare(oldPassword, user.password);
      if (!ok) {
        return res.status(400).render("users/change-password", {
          pageTitle: "Change Password",
          errorMessage: "The current password is incorrect",
        });
      }
      if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
          pageTitle: "Change Password",
          errorMessage: "The password does not match the confirmation",
        });
      }
      user.password = newPassword;
      await user.save();
      req.flash("info", "Password Updated");
      return res.redirect("/users/logout");
}


export const see = async(req,res) =>{
    const {id} = req.params;
    const user = await User.findById(id).populate("videos");
    if(!user){
        return res.status(404).render("404", {pageTitle : "User not found."});
    }
    return res.render("users/profile", {pageTitle : `${user.name}의 Profile`, user});
}


