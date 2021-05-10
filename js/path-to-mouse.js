////////////////////////////////////////////////////////////////////////////////
// Convert Paths to Mouse Movements

function followPaths(paths) {
  for (let path of paths) {
    triggerMouseEvent('mousedown', path.getPointAt(0));

    // p = v * t
    let acceleration = 0.5;
    let velocity = 0;
    let position = 0;

    while (position <= path.length) {
      triggerMouseEvent('mousemove', path.getPointAt(position));
      console.log(path.getCurvatureAt(position));
      velocity += acceleration;
      position += velocity;
    }
    triggerMouseEvent('mouseup', path.getPointAt(path.length));
  }
}

function triggerMouseEvent(type, point) {
  let viewPoint = view.projectToView(point);
  let event = new window.MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: viewPoint.x,
    clientY: viewPoint.y
  });
  let target = type === 'mousedown' ? view.element : document;
  target.dispatchEvent(event);
}

////////////////////////////////////////////////////////////////////////////////
// SVG Import

function processSVG(svg) {
  project.clear();
  let item = project.activeLayer.importSVG(svg, {
    expandShapes: true,
    applyMatrix: true
  });

  // Remove clipping path
  item.firstChild.remove();

  item.fitBounds(view.bounds);

  // Get all paths, and follow them with the mouse
  let paths = item.project.getItems({
    class: Path
  });

  followPaths(paths);
}

function processInlinedSVG() {
  let svg = document.getElementById('svg');
  processSVG(svg);
}

// Export globally
window.processInlinedSVG = processInlinedSVG;

processInlinedSVG();

////////////////////////////////////////////////////////////////////////////////
// Drag File to Load

function onDocumentDrag(event) {
  event.preventDefault();
}

function onDocumentDrop(event) {
  var reader = new FileReader();
  var file = event.dataTransfer.files[0];
  reader.onloadend = function(event) {
    processSVG(event.target.result);
  };
  reader.readAsText(file);
  event.preventDefault();
}

document.addEventListener('drop', onDocumentDrop, false);
document.addEventListener('dragover', onDocumentDrag, false);
document.addEventListener('dragleave', onDocumentDrag, false);