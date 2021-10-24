import {createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");


let stream;
let recorder;
let videoFile;

const files = {
  input : "recording.webm",
  output : "output.mp4",
  thumb : "thumbnail.jpg",
}

const downloadFile = (fileUrl, fileName) =>{
  const a = document.createElement("a");
  a.href= fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  // document.body.removeChild(a);
  // init();
}

const handleDownload = async() =>{
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({log : true});
  await ffmpeg.load();
  // ffmpeg 파일 시스템에 녹화한 영상의 정보를 작성
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
  // input으로 저장한 파일 recording.webm을 받고 60프레임 output.mp4로 인코딩변환 
  // 브라우저 메모리에 output.mp4 저장
  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  // -ss는 영상의 특정 시간대로 갈 수 있게 함 / -frames는 첫 프레임의 스크린샷을 찍어줌
  await ffmpeg.run("-i", files.input,
   "-ss", "00:00:01",
   "-frames:v", "1", files.thumb);

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = newBlob([mp4File.buffer], {type : "video/mp4"});
  const thumbBlob = newBlob([thumbFile.buffer], {type : "image/jpg"});

  // objecturl은 url을 사용해서 파일을 가리키도록 브라우저가 만든 url
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  actionBtn.innerText = "Start Recording";
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.addEventListener("click", handleStart);


  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
}



const handleStart = () => {
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);

  recorder = new MediaRecorder(stream, {mimeType:"video/webm"});

  // recorder.stop후에 실행되는 event
  recorder.ondataavailable = (event) => {
      // 파일을 가리키고 있는 URL, 브라우저에 의해 만들어졌고 접근 할 수있는
      // 파일을 가리킴. (브라우저의 메모리 상에 있는 파일)
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  // 녹화시간 5초 고정
  recorder.start();
  setTimeout(()=>{
    recorder.stop();
  },5000);

};


const init = async() =>{
    stream = await navigator.mediaDevices.getUserMedia({
        audio:false,
        video:{
          width : 1024,
           height : 576,
        },
    });
    video.srcObject = stream;
    video.play();
}

init();

actionBtn.addEventListener("click", handleStart);