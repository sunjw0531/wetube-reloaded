// const video = document.querySelector("video");
// const playBtn = document.getElementById("play");
// const muteBtn = document.getElementById("mute");
// const volumeRange = document.getElementById("volume");
// const currentTime = document.getElementById("currentTime");
// const totalTime = document.getElementById("totalTime");
// const timeline = document.getElementById("timeline");
// const fullScreenBtn = document.getElementById("fullScreen")
// const videoContainer = document.getElementById("videoContainer");
// const videoControls = document.getElementById("videoControls");

// let volumeValue = 0.5
// video.volume = volumeValue;
// let controlsTimeout = null;
// let controlsMovementTimeout = null;

// const handlePlayClick = (e) =>{
//     // if the video is playing, pause it
//     // else play the video
//     if(video.paused){
//         video.play();
//     }else{
//         video.pause();
//     }
//     playBtn.innerText = video.paused ? "Play" : "Pause";
// }



// const handleMute = (e) =>{
//     if(video.muted){
//         video.muted = false;
//     }else{
//         video.muted = true;
//     }
//     muteBtn.innerText = video.muted ? "Unmute" : "Mute";
//     volumeRange.value = video.muted ? 0 : volumeValue;
// }

// const handleVolumeChange = (event) =>{
//     const {target : {value}} = event;
//     if(video.muted){
//         video.muted = false;
//         muteBtn.innerText = "Mute";
//     }
//     volumeValue = value;
//     if(volumeValue == 0){
//         video.muted = true;
//         muteBtn.innerText = "UnMute";
//     }
//     video.volume = value;
    
// }

// const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11,8);

// const handleLoadedMetadata = () =>{
//     totalTime.innerText = formatTime(Math.floor(video.duration));
//     timeline.max = Math.floor(video.duration);

// }

// const handleTimeUpdate= () =>{
//     currentTime.innerText = formatTime(Math.floor(video.currentTime));
//     timeline.value = Math.floor(video.currentTime);
// }

// const handleTimeLineChnage = (event) =>{
//     video.currentTime = event.target.value;
// }

// const handleFullScreen = () =>{
//     const fullscreen = document.fullscreenElement;

//     if(fullscreen){
//         document.exitFullscreen();
//         fullScreenBtn.innerText = "Enter Full Screen";
//     }else{
//         videoContainer.requestFullscreen();
//         fullScreenBtn.innerText = "Exit Full Screen";
//     }
    
// }

// const hideControls = () => videoControls.classList.remove("showing");


// const handleMouseMove = () =>{
//     if(controlsTimeout){
//         clearTimeout(controlsTimeout);
//         controlsTimeout = null;
//     }
//     if(controlsMovementTimeout){
//         clearTimeout(controlsMovementTimeout);
//         controlsMovementTimeout = null;
//     }
//     videoControls.classList.add("showing");
//     controlsMovementTimeout = setTimeout(hideControls, 3000);
// }

// const handleMouseLeave = () =>{
//     controlsTimeout = setTimeout(hideControls, 3000);
    
// }



// playBtn.addEventListener("click", handlePlayClick);
// muteBtn.addEventListener("click", handleMute);
// volumeRange.addEventListener("input", handleVolumeChange);
// video.addEventListener("loadedmetadata", handleLoadedMetadata);
// video.addEventListener("timeupdate", handleTimeUpdate);
// timeline.addEventListener("input", handleTimeLineChnage);
// fullScreenBtn.addEventListener("click", handleFullScreen);
// videoContainer.addEventListener("mousemove", handleMouseMove);
// videoContainer.addEventListener("mouseleave", handleMouseLeave);


const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
    if(video.muted){
        video.muted = false;
        muteBtnIcon.classList = "fas fa-volume-up";
    }
    volumeValue = value;
    if(volumeValue == 0){
        video.muted = true;
        muteBtnIcon.classList = "fas fa-volume-mute";
    }
    video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(14, 5);
        
const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleKeydown = (event) =>{

    switch(event.key){
        case " " :{
            if(video.paused){
                video.play();
                
            }else{
                video.pause();
            }
            playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
            break;
        }
        case "F" :{
            videoContainer.requestFullscreen();
            break;
        }
        case "f" :{
            videoContainer.requestFullscreen();
            break;
        }
        case "Enter" :{
            if(!document.fullscreenElement)
                videoContainer.requestFullscreen();
            else
                document.exitFullscreen();
            break;
        }
        case "Escape" :{
            videoContainer.exitFullscreen();
        }
    }
}


const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

const handleEnded = () =>{
  // dataAttribute로 watch.pug의 video의 ID를 가져옴
  const {id} = videoContainer.dataset;
  // video 시청이 끝나면 URL에 요청 (fetch는 get요청이라서 method지정)
  fetch(`/api/videos/${id}/view`, {method : "POST"});
}

if (video.readyState == 4) {
    handleLoadedMetadata();
}


playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);

document.addEventListener("keydown", handleKeydown);