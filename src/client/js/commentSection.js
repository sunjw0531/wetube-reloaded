const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
///
const deleteBtn = document.querySelectorAll("#video__comment-delete");
const list = document.querySelector("#video__comments-list");

const addComment = (text, id) =>{
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = `${text}`;
    const button = document.createElement("button");
    button.innerText = "❌";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(button);
    videoComments.prepend(newComment);
    button.addEventListener("click", handleDelete);
};



const handleSubmit = async(event) =>{
    // 브라우저가 항상 하는 동작을 멈추도록 함 (submit 새로고침)
    event.preventDefault();
    
    const textarea = form.querySelector("textarea");

    const text = textarea.value;
    // 어떤 영상인지의 id를 가져옴
    const videoId = videoContainer.dataset.id;

    if(text===""){
        return;
    }

    // Js를 통해서 URL 변경 없이 backend로 request를 보내기위해 fetch 사용 
    const response = await fetch(`/api/videos/${videoId}/comment`,{
        method : "POST",
        // request에 대한 정보, json 미들웨어에 의해서 처리되도록 함
        headers:{
            "Content-Type" : "application/json",
        },
        // stringify로 JS object를 받아서 string으로 돌려줌
        body : JSON.stringify({text}),
    });
    
    if(response.status === 201){
        textarea.value = "";
        const {newCommentId} = await response.json();
        addComment(text, newCommentId);
    }
};

const handleDelete = async (event) => {
    const dataId = event.target.parentElement.dataset.id;
    if (confirm("Want to Delete Comment?") === true) {
      list.removeChild(event.target.parentElement);
      await fetch("/api/commentDelete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataId }),
      });
    }
};

if(form){
    form.addEventListener("submit", handleSubmit);
}
////
deleteBtn.forEach((array) => {
    array.addEventListener("click", handleDelete);
});
