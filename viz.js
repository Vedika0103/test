let foodData;
let salesData = [];
let margin = 80;
let maxSales;
let colors = []; // Array to hold unique colors for each brand

function preload() {
  // Load the fast food data file
  foodData = loadTable('data/fastfood.csv', 'csv', 'header');
}

function setup() {
  // Ensure the canvas fills the window and is positioned correctly
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("project"); // Attach to #project div to control layout

  background(245, 240, 225);
  textAlign(CENTER, CENTER);
  textSize(12);

  // Calculate max sales first to use it in hexagon size mapping
  maxSales = max(foodData.getColumn('U.S. Systemwide Sales (Millions - U.S Dollars)').map(Number));

  // Process each row and store necessary data
  for (let i = 0; i < foodData.getRowCount(); i++) {
    let brand = foodData.getString(i, 'Fast-Food Chains');
    let revenue = foodData.getNum(i, 'U.S. Systemwide Sales (Millions - U.S Dollars)');
    let franchisedStores = foodData.getNum(i, 'Franchised Stores');
    let companyStores = foodData.getNum(i, 'Company Stores');

    // Calculate hexagon size based on revenue
    let hexSize = map(revenue, 0, maxSales, 20, 60);

    // Generate a unique color for each brand
    colors.push(color(random(100, 255), random(100, 255), random(255), 180));

    // Get a non-overlapping position for each hexagon
    let pos = getRandomPosition(hexSize);

    // Store data, position, and size in salesData array
    salesData.push({ brand, revenue, franchisedStores, companyStores, hexSize, pos });
  }
}

function draw() {
  // Clear the background each frame to enable interactive effects
  background(245, 240, 225);

  // Draw the hover instruction at the top of the canvas
  fill(50);
  textSize(16);
  textAlign(CENTER, TOP);
  text("Hover over each hexagon to view detailed data for each chain.", width / 2, 20);

  // Draw the visualization including tooltips
  drawVisualization();
}

function drawVisualization() {
  for (let i = 0; i < salesData.length; i++) {
    let d = salesData[i];
    
    // Draw the hexagon
    fill(colors[i]);
    noStroke();
    drawHexagon(d.pos.x, d.pos.y, d.hexSize);

    // Tooltip on hover
    if (dist(mouseX, mouseY, d.pos.x, d.pos.y) < d.hexSize) {
      displayTooltip(mouseX, mouseY, d);
    }
  }
}

function getRandomPosition(hexSize) {
  let x, y, overlapping;
  let attempts = 0; // Limit attempts to avoid infinite loops

  do {
    // Generate random x and y within the canvas boundaries
    x = random(margin + hexSize, width - margin - hexSize);
    y = random(margin + hexSize, height - margin - hexSize);

    // Check for overlap with other hexagons
    overlapping = salesData.some(existingHex => {
      return dist(x, y, existingHex.pos?.x || 0, existingHex.pos?.y || 0) < (existingHex.hexSize + hexSize);
    });

    attempts++;
  } while (overlapping && attempts < 100); // Limit attempts to avoid infinite loops

  return { x, y };
}

function drawHexagon(x, y, size) {
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = PI / 3 * i;
    let xOffset = x + cos(angle) * size;
    let yOffset = y + sin(angle) * size;
    vertex(xOffset, yOffset);
  }
  endShape(CLOSE);
}

function displayTooltip(mx, my, data) {
  let tooltipWidth = 150;
  let tooltipHeight = 80;
  
  fill(255, 230);
  rect(mx, my, tooltipWidth, tooltipHeight, 5);
  fill(30);
  textSize(12);
  textAlign(LEFT, TOP);
  text(
    `Brand: ${data.brand}\nRevenue: $${data.revenue}M\nFranchised: ${data.franchisedStores}\nCompany: ${data.companyStores}`,
    mx + 10, my + 10
  );
}