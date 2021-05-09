////////////////////////////////////////////////////////////////////////////////
// Values

let values = {
  zigZag: false,
  strokeWidth: 1
};
tool.minDistance = 20;

////////////////////////////////////////////////////////////////////////////////
// Mouse handling

let path;

function onMouseDown(event) {
  path = new Path({
    strokeColor: 'black',
    strokeCap: 'round',
    strokeJoin: 'round',
    strokeWidth: values.strokeWidth
  });
  path.add(event.point);
}

function onMouseDrag(event) {
  if (values.zigZag) {
    path.arcTo(event.point, event.count % 2 == 0);
  } else {
    path.arcTo(event.point);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Interface

let components = {
  zigZag: {
    label: 'Zig Zag'
  },

  strokeWidth: {
    type: 'slider',
    range: [1, 10],
    label: 'Stroke Width'
  },

  minDistance: {
    type: 'slider',
    range: [0, 100],
    value: tool.minDistance,
    label: 'Min Step',
    onChange: function(value) {
      tool.minDistance = value; 
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

let palette = new Palette('Cloud Tool', components, values);