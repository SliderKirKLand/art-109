const videos = document.querySelectorAll('.hover-video');

videos.forEach((video) => {
  video.addEventListener('mouseenter', () => video.play());
  video.addEventListener('mouseleave', () => video.pause());
});

const webcamVideo = document.querySelector('#webcam');
const webcamStatus = document.querySelector('#webcam-status');

async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    webcamVideo.srcObject = stream;
    webcamStatus.textContent = 'Webcam is active.';
  } catch (error) {
    webcamStatus.textContent = 'Webcam access was not available. Open this page on localhost or HTTPS and allow camera access.';
    console.error('Error accessing webcam:', error);
  }
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  startWebcam();
}
