////////////////////////////////////////////////////////////////////////////////
// Tool

tool.fixedDistance = 15;

let raster = new Raster({
  source: 'img/marilyn.jpeg',
  onLoad: function() {
    raster.fitBounds(view.bounds);
    raster.opacity = 0.25;
  }
})

let path;

function onMouseDown(event) {
  path = new Path();
  path.fillColor = 'black';
  path.add(event.point);
}

function onMouseDrag(event) {
  let size;
  if (raster.bounds.contains(event.point)) {
    // We're inside the raster, take the color at the mouse position
    // and use its gray-scale value to scale our side-stepping vector
    // used to construct the stroke geometry.
    let pixelPoint = raster.globalToLocal(event.point) + raster.size / 2;
    let color = raster.getPixel(pixelPoint);
    size = 1 - color.gray;
  } else {
    // Leave some visible trace when the mouse is outside of the raster
    size = 0.05;
  }
  let step = event.delta.rotate(90) * size;
  let top = event.middlePoint + step;
  let bottom = event.middlePoint - step;
  path.add(top);
  path.insert(0, bottom);
  path.smooth();
}

function onMouseUp(event) {
  path.add(event.point);
  path.closed = true;
  path.smooth();
}

////////////////////////////////////////////////////////////////////////////////
// Drag'n'Drop Images

function onDocumentDrag(event) {
	event.preventDefault();
}

function onDocumentDrop(event) {
	var file = event.dataTransfer.files[0];
	var reader = new FileReader();
	reader.onload = function(event) {
    raster.source = event.target.result;
	};
	reader.readAsDataURL(file);
	event.preventDefault();
}

document.addEventListener('drop', onDocumentDrop, false);
document.addEventListener('dragover', onDocumentDrag, false);
document.addEventListener('dragleave', onDocumentDrag, false);
