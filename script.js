// https://snyk.io/advisor/npm-package/@tensorflow-models/posenet
let poseNetOptions = {
  architecture: 'MobileNetV1',
  imageScaleFactor: 0.3,
  outputStride: 16,
  flipHorizontal: true,
  minConfidence: 0.8,
  maxPoseDetections: 1,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'single',
  inputResolution: 513,
  multiplier: 0.75,
  quantBytes: 2,
};

let wristCircle = new Path.Circle({
  center: view.center,
  radius: 10,
  fillColor: 'red'
});

let wristPath = new Path({
  strokeColor: 'black',
  strokeWidth: 2,
  strokeJoin: 'round'
})

let elbowPath = new Path({
  strokeColor: 'orange',
  strokeWidth: 2,
  strokeJoin: 'round'
})

function onPose(poses) {
  let pose = poses[0];
  if (pose) {
    let leftWrist = pose.pose.leftWrist;
    let leftElbow = pose.pose.leftElbow;
    if (leftWrist.confidence >= 0.3) {
      wristCircle.position = leftWrist;
      wristCircle.visible = true;
      wristPath.add(leftWrist);
      wristPath.smooth();
    } else {
      wristCircle.visible = false;
    }
    if (leftElbow.confidence >= 0.3) {
      elbowPath.add(leftElbow);
      elbowPath.smooth();
    }
  }
}

async function setupPoseNet() {
  // https://www.html5rocks.com/en/tutorials/getusermedia/intro/#toc-webaudio-api
  let video = document.getElementById('video');

  // Get access to the camera and connect it to the video tag:
  let mediaDevices = navigator.mediaDevices;
  if(mediaDevices && mediaDevices.getUserMedia) {
    let stream = await mediaDevices.getUserMedia({
      video: {
        width: { min: 640 },
        height: { min: 480 }
      }
    });
    video.srcObject = stream;

    const poseNet = ml5.poseNet(video, poseNetOptions, function () {
      // PoseNet wants actual width & height values on the video. 
      let bounds = video.getBoundingClientRect();
      video.width = bounds.width;
      video.height = bounds.height;
    });
    
    // Listen to new 'pose' events
    poseNet.on('pose', onPose);
  }
}

setupPoseNet();

