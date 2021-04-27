////////////////////////////////////////////////////////////////////////////////
// Values

let values = {
  smoothing: true,
  minSpeed: 10
};

////////////////////////////////////////////////////////////////////////////////
// Mouse Tool

// This version of the Brush tool only draws paths when you drag the mouse
// fast enough, when you drag to slow it finishes the current path and waits
// for the user to drag fast again:

let path;

tool.maxDistance = 10;

function onMouseDrag(event) {
  // If the user dragged more then minSize:
  if (event.delta.length > values.minSpeed) {
    event.delta.length = event.delta.length - values.minSpeed;
    // If there is no path, make one:
    if (!path) {
      path = new Path({
        fillColor: 'black'
      });
      path.add(event.lastPoint);
    }

    let step = event.delta / 2;
    step.angle += 90;

    // The top point: the middle point + the step rotated by 90 degrees:
    //   -----*
    //   |
    //   ------
    let top = event.middlePoint + step;

    // The bottom point: the middle point - the step rotated by 90 degrees:
    //   ------
    //   |
    //   -----*
    let bottom = event.middlePoint - step;

    path.add(top);
    path.insert(0, bottom);
    if (values.smoothing) {
      path.smooth();
    }
  } else {
    // If the user dragged too slowly:
    
    // If there is currently a path, close it
    if (path) {
      // Add the first point at position middlePoint:
      path.add(event.middlePoint);
      path.closed = true;
      if (values.smoothing) {
        path.smooth();
      }

      // Set path to null (nothing) so the path check above
      // will force a new path next time the user drags fast enough:
      path = null;
    }
  }
}

function onMouseUp(event) {
  if (path) {
    path.add(event.point);
    path.closed = true;
    path.smooth();
    
    // Set path to null (nothing) so the path check above
    // will force a new path next time the user drags fast enough:
    path = null;
  }
}

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

let isDown = false
let lastPoint = null

function onPose(poses) {
  let pose = poses[0];
  if (pose) {
    let leftWrist = pose.pose.leftWrist;
    let point = new Point(leftWrist);
    if (!lastPoint) {
      lastPoint = point;
    }
    let delta = point - lastPoint;
    let middlePoint = (point + lastPoint) / 2;
    if (leftWrist.confidence >= 0.3) {
      if (isDown) {
        if (tool.onMouseDrag) {
          tool.onMouseDrag({ type: 'mousedrag', point, lastPoint, middlePoint, delta })
        }
      } else {
        if (tool.onMouseDown) {
          tool.onMouseDown({ type: 'mousedown', point, lastPoint, middlePoint, delta })
        }
        isDown = true;
      }
      lastPoint = point
    } else if (isDown) {
      if (tool.onMouseUp) {
        tool.onMouseUp({ type: 'mouseup', point, lastPoint, middlePoint, delta })
      }
      lastPoint = point
      isDown = false;
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
  smoothing: {
    label: 'Smoothing'
  },

  minSpeed: {
    type: 'slider',
    range: [0, 50],
    label: 'Min Speed'
  },

  maxDistance: {
    type: 'slider',
    range: [0, 50],
    label: 'Max Distance',
    onChange(value) {
      tool.maxDistance = value;
    }
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