const videoContainer = document.getElementById("videoContainer");
const canvasContainer = document.getElementById("canvasContainer");
const myVideo = document.getElementById("myVideo");
const overLayer = document.getElementById("overLayer");
const canvas = document.getElementById("myCanvas");
let ctx;
let x = 0;
let y = 0;
let offsetX = 0;
let offsetY = 0;
const canvasContraints = { width: 300, height: 300, radius: 50 };
const videoContraints = { width: 640, height: 480 };
let width = videoContraints.width;
let height = videoContraints.height;
const transition = 0.05;
const facePadding = 0.5;
let frameCount = 0;

function setup() {
  videoContainer.style.width = `${videoContraints.width}px`;
  videoContainer.style.height = `${videoContraints.height}px`;

  canvasContainer.style.width = `${canvasContraints.width}px`;
  canvasContainer.style.height = `${canvasContraints.height}px`;

  myVideo.style.width = `${videoContraints.width}px`;
  myVideo.style.height = `${videoContraints.height}px`;
  myVideo.addEventListener("play", onVideoPlaying);

  overLayer.style.width = `${canvasContraints.width}px`;
  overLayer.style.height = `${canvasContraints.height}px`;
  overLayer.style.borderRadius = `${canvasContraints.radius}%`;

  canvas.setAttribute("width", `${canvasContraints.width}px`);
  canvas.setAttribute("height", `${canvasContraints.width}px`);
  canvas.style.borderRadius = `${canvasContraints.radius}%`;
  ctx = canvas.getContext("2d");
}

function getMilisecondsPerFrames(frames) {
  return Math.floor(1000 / frames);
}

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({
      video: videoContraints,
    })
    .then((mediaSteam) => (myVideo.srcObject = mediaSteam));
}

function draw() {
  return ctx.drawImage(
    myVideo,
    x,
    y,
    2 * offsetX + width,
    2 * offsetY + height,
    0,
    0,
    canvasContraints.width,
    canvasContraints.height
  );
}

function onVideoPlaying() {
  videoContainer.style.display = "flex";
  const intevalTime = getMilisecondsPerFrames(30);

  setInterval(async () => {
    const detection = await faceapi.detectSingleFace(
      myVideo,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (!detection) {
      window.requestAnimationFrame(draw);
      frameCount++;
      return;
    }
    ctx.clearRect(0, 0, width, height);

    let { _width, _height, _x, _y } = detection.box;

    const _offsetX = Math.floor(_width * facePadding);
    const _offsetY = Math.floor(_height * facePadding);

    // subtract offset x & y for a better view of the face
    _x -= _offsetX;
    _y -= _offsetY;

    // calculate the difference gradually add it(5%)
    const diffOffsetX = (offsetX - _offsetX) * transition;
    offsetX -= diffOffsetX;

    const diffOffsetY = (offsetY - _offsetY) * transition;
    offsetY -= diffOffsetY;

    const diffX = (x - _x) * transition;
    x -= diffX;

    const diffY = (y - _y) * transition;
    y -= diffY;

    const diffW = (width - _width) * transition;
    width -= diffW;

    const diffH = (height - _height) * transition;
    height -= diffH;

    // set the position of inner div
    overLayer.style.left = Math.floor(x) + "px";
    overLayer.style.top = Math.floor(y) + "px";
    // set the size of inner div
    overLayer.style.width = Math.floor(2 * offsetX + width) + "px";
    overLayer.style.height = Math.floor(2 * offsetY + height) + "px";

    window.requestAnimationFrame(draw);
    frameCount++;
  }, intevalTime);
}

async function init() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  setup();
  startVideo();
}

init();
