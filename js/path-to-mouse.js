////////////////////////////////////////////////////////////////////////////////
// Convert Paths to Mouse Movements

function followPaths(paths) {
  for (let path of paths) {
    triggerMouseEvent('mousedown', path.getPointAt(0));

    let position = 0;
    let velocity = 10;
    while (position <= path.length) {
      triggerMouseEvent('mousemove', path.getPointAt(position));
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
  project.activeLayer.clear();
  let svgItem = project.activeLayer.importSVG(svg, {
    expandShapes: true,
    applyMatrix: true
  });

  // Remove clipping path
  svgItem.firstChild.remove();

  svgItem.fitBounds(view.bounds);
  svgItem.visible = false;

  // Get all paths, and follow them with the mouse
  let paths = svgItem.project.getItems({
    class: Path
  });

  followPaths(paths);
}

function processInlinedSVG() {
  let svg = document.getElementById('svg');
  processSVG(svg);
}

// Export globally
window.processSVG = processSVG;
window.processInlinedSVG = processInlinedSVG;
