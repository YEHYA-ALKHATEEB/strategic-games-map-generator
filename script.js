let gridSize = 50; // Grid cell size
let gridRows = 20; // Initial number of rows
let gridCols = 20; // Initial number of columns
let zoomLevel = 1; // Initial zoom level

const container = document.getElementById('container');
let selectedShape = null; // To track the currently selected shape

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

// Function to add a shape (banner, spot, or bear)
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

  // Center the text inside the rectangle
  text.x((width * gridSize - text.width()) / 2);
  text.y((height * gridSize - text.fontSize()) / 2);

  // Double-click to rename
  group.on('dblclick', () => {
    const newText = prompt('Enter new text:', text.text());
    if (newText !== null && newText.trim() !== '') {
      text.text(newText);
      text.x((width * gridSize - text.width()) / 2);
      text.y((height * gridSize - text.fontSize()) / 2);
      layer.draw();
    }
  });

  // Right-click to delete or change color
  group.on('contextmenu', (e) => {
    e.evt.preventDefault(); // Prevent the browser context menu
    const action = prompt('Enter action: "delete" to remove, or "color" to change the color:');
    if (action === 'delete') {
      deleteShape(group); // Call delete function
    } else if (action === 'color') {
      changeShapeColor(group); // Change color
    }
  });

  // Add the shape to the group and layer
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
  const randomX = Math.floor(Math.random() * (gridCols - 1)) * gridSize; // Adjust for 2x1 size
  const randomY = Math.floor(Math.random() * gridRows) * gridSize;
  addShape(randomX, randomY, 2, 2, 'orange', 'Spot');
}

// Add a new Bear (3x3 square)
function addNewBear() {
  const randomX = Math.floor(Math.random() * (gridCols - 2)) * gridSize; // Adjust for 3x3 size
  const randomY = Math.floor(Math.random() * (gridRows - 2)) * gridSize;
  addShape(randomX, randomY, 3, 3, 'brown', 'Bear');
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

// Change the color of a selected shape
function changeShapeColor(shapeGroup) {
  const newColor = prompt('Enter a new color (e.g., red, blue, #123456):', shapeGroup.findOne('Rect').fill());
  if (newColor) {
    const rect = shapeGroup.findOne('Rect');
    rect.fill(newColor); // Update the rectangle's fill color
    layer.draw(); // Redraw the layer to reflect the changes
  }
}

// Delete a shape
function deleteShape(shapeGroup) {
  if (confirm('Are you sure you want to delete this shape?')) {
    shapeGroup.destroy(); // Remove the shape from the canvas
    layer.draw(); // Redraw the layer
  }
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

// Delete shape with Delete key
window.addEventListener('keydown', (e) => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShape) {
    deleteShape(selectedShape);
    selectedShape = null;
  }
});

// Track selected shape on click
stage.on('click', (e) => {
  selectedShape = e.target.getParent() || null;
});
