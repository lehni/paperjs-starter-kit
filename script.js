////////////////////////////////////////////////////////////////////////////////
// Values

let values = {
  smoothing: true,
  strokeWidth: 1
};

////////////////////////////////////////////////////////////////////////////////
// PoseNet handling

// https://snyk.io/advisor/npm-package/@tensorflow-models/posenet
let poseNetOptions = {
  architecture: 'MobileNetV1',
  imageScaleFactor: 0.3,
  outputStride: 16,
  flipHorizontal: true,
  minConfidence: 0.5,
  maxPoseDetections: 1,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'single',
  inputResolution: 513,
  multiplier: 0.75,
  quantBytes: 2,
};

let leftWristCircle = new Path.Circle({
  center: view.center,
  radius: 10,
  fillColor: 'red'
});

let leftWristPath = new Path({
  strokeColor: 'black',
  strokeWidth: values.strokeWidth,
  strokeJoin: 'round'
})

let rightWristPath = new Path({
  strokeColor: 'orange',
  strokeWidth: values.strokeWidth,
  strokeJoin: 'round'
})

function onPose(poses) {
  let pose = poses[0];
  if (pose) {
    let leftWrist = pose.pose.leftWrist;
    let rightWrist = pose.pose.rightWrist;
    if (leftWrist.confidence >= 0.3) {
      leftWristCircle.position = leftWrist;
      leftWristCircle.visible = true;
      leftWristPath.add(leftWrist);
      if (values.smoothing) {
        leftWristPath.smooth();
      }
    } else {
      leftWristCircle.visible = false;
    }
    if (rightWrist.confidence >= 0.3) {
      rightWristPath.add(rightWrist);
      if (values.smoothing) {
        rightWristPath.smooth();
      }
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

    // Use a promise to wait until the video can play through.
    await new Promise(function (resolve) {
      video.addEventListener('canplaythrough', resolve)
    })

    // PoseNet wants actual width & height values on the video. 
    let bounds = video.getBoundingClientRect();
    video.width = bounds.width;
    video.height = bounds.height;

    // Now that the video has the correct size, we can start the poseNet.
    // This will take some time to load the ML model, after that we will
    // start receiving 'pose' events.
    let poseNet = ml5.poseNet(video, poseNetOptions, function () {
      console.log('Model loaded');
    });
    
    // Listen to new 'pose' events
    poseNet.on('pose', onPose);
  }
}

setupPoseNet();


////////////////////////////////////////////////////////////////////////////////
// Interface

let components = {
  strokeWidth: {
    type: 'slider',
    range: [1, 10],
    label: 'Stroke Width'
  },

  smoothing: {
    label: 'Smoothing'
  },

  download: {
    type: 'button',
    value: 'Download SVG',
    onClick() {
      let svg = paper.project.exportSVG({ asString: true });
      // See: https://stackoverflow.com/a/49917066/1163708
      let a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      let timestamp = new Date().toJSON().replace(/[-:]/g, '')
      let parts = timestamp.match(/^20(.*)T(.*)\.\d*Z$/);
      a.download = `Export_${parts[1]}_${parts[2]}.svg`;
      let body = document.body;
      body.appendChild(a);
      a.click();
      body.removeChild(a);
    }
  }
};

let palette = new Palette('PoseNet Tool', components, values);