////////////////////////////////////////////////////////////////////////////////
// Convert Paths to Mouse Movements

function followPaths(paths) {
  for (let path of paths) {
    triggerMouseEvent('mousedown', path.getPointAt(0));
    for (let pos = 0; pos <= path.length; pos += 10) {
      triggerMouseEvent('mousemove', path.getPointAt(pos));
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

function loadSVG(svg) {
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

////////////////////////////////////////////////////////////////////////////////
// Drag File to Load

function onDocumentDrag(event) {
  event.preventDefault();
}

function onDocumentDrop(event) {
  var reader = new FileReader();
  var file = event.dataTransfer.files[0];
  reader.onloadend = function(event) {
    loadSVG(event.target.result);
  };
  reader.readAsText(file);
  event.preventDefault();
}

document.addEventListener('drop', onDocumentDrop, false);
document.addEventListener('dragover', onDocumentDrag, false);
document.addEventListener('dragleave', onDocumentDrag, false);