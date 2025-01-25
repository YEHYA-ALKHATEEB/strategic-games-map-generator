let gridSize = 50; // Grid cell size
let gridRows = 20; // Initial number of rows
let gridCols = 20; // Initial number of columns
let zoomLevel = 1; // Initial zoom level

const container = document.getElementById('container');

// Function to update the container size and redraw the grid
function updateContainerSize() {
  const width = gridCols * gridSize;
  const height = gridRows * gridSize;

  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  stage.width(width);
  stage.height(height);

  // Clear and redraw the grid
  layer.destroyChildren(); // Remove old grid
  for (let i = 0; i < width; i += gridSize) {
    for (let j = 0; j < height; j += gridSize) {
      layer.add(
        new Konva.Rect({
          x: i,
          y: j,
          width: gridSize,
          height: gridSize,
          stroke: 'green', // Grid line color
        })
      );
    }
  }
  layer.draw();
}

// Initialize container size and stage
const stage = new Konva.Stage({
  container: 'container',
  width: gridCols * gridSize,
  height: gridRows * gridSize,
});

const layer = new Konva.Layer();
stage.add(layer);

// Draw the initial grid
updateContainerSize();

// Function to dynamically increase the grid size
function increaseGrid() {
  gridRows++;
  gridCols++;
  updateContainerSize();
}

// Function to add a shape (banner or spot)
function addShape(x, y, width, height, color, label) {
  const group = new Konva.Group({ x, y, draggable: true });
  const rect = new Konva.Rect({
    width: width * gridSize,
    height: height * gridSize,
    fill: color,
    stroke: '#000',
    strokeWidth: 2,
  });
  const text = new Konva.Text({
    text: label,
    fontSize: 14,
    fontFamily: 'Arial',
    fill: '#000',
    width: width * gridSize,
    align: 'center',
  });

  text.x((width * gridSize - text.width()) / 2);
  text.y((height * gridSize - text.fontSize()) / 2);

  group.on('dblclick', () => {
    const newText = prompt('Enter new text:', text.text());
    if (newText !== null && newText.trim() !== '') {
      text.text(newText);
      text.x((width * gridSize - text.width()) / 2);
      text.y((height * gridSize - text.fontSize()) / 2);
      layer.draw();
    }
  });

  group.add(rect);
  group.add(text);
  layer.add(group);
  layer.draw();
}

// Add a new Banner
function addNewBanner() {
  const randomX = Math.floor(Math.random() * gridCols) * gridSize;
  const randomY = Math.floor(Math.random() * gridRows) * gridSize;
  addShape(randomX, randomY, 1, 1, 'yellow', 'Banner');
}

// Add a new Spot
function addNewSpot() {
  const randomX = Math.floor(Math.random() * (gridCols - 1)) * gridSize;
  const randomY = Math.floor(Math.random() * gridRows) * gridSize;
  addShape(randomX, randomY, 2, 2, 'orange', 'Spot');
}

// Save map to local storage
function saveMap() {
  const shapes = [];
  stage.find('Group').forEach((group) => {
    const rect = group.findOne('Rect');
    const text = group.findOne('Text');

    shapes.push({
      x: group.x(),
      y: group.y(),
      width: rect.width() / gridSize,
      height: rect.height() / gridSize,
      color: rect.fill(),
      label: text.text(),
    });
  });

  const mapState = {
    gridSize,
    gridRows,
    gridCols,
    shapes,
  };

  localStorage.setItem('mapState', JSON.stringify(mapState));
  alert('Map saved successfully!');
}

// Load map from local storage
function loadMap() {
  const savedMap = localStorage.getItem('mapState');
  if (!savedMap) {
    alert('No saved map found.');
    return;
  }

  const mapState = JSON.parse(savedMap);

  // Restore grid
  gridSize = mapState.gridSize;
  gridRows = mapState.gridRows;
  gridCols = mapState.gridCols;
  updateContainerSize();

  // Restore shapes
  mapState.shapes.forEach((shape) => {
    addShape(
      shape.x,
      shape.y,
      shape.width,
      shape.height,
      shape.color,
      shape.label
    );
  });

  alert('Map loaded successfully!');
}

// Clear saved map from local storage
function clearMap() {
  localStorage.removeItem('mapState');
  alert('Saved map cleared!');
}

// Zoom In
function zoomIn() {
  zoomLevel += 0.1;
  stage.scale({ x: zoomLevel, y: zoomLevel });
  stage.batchDraw();
}

// Zoom Out
function zoomOut() {
  zoomLevel = Math.max(0.5, zoomLevel - 0.1); // Prevent zooming out too much
  stage.scale({ x: zoomLevel, y: zoomLevel });
  stage.batchDraw();
}

// Generate map as PNG
function generateMap() {
  const dataURL = stage.toDataURL();
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'map.png';
  link.click();
}
