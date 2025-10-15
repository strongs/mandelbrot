// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('mandelbrotCanvas');
const ctx = canvas.getContext('2d');

// --- Configuration ---
const MAX_ITERATIONS = 500; // Higher numbers mean more detail but are slower

// Set canvas dimensions to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- Viewport State ---
let centerX = -0.75; // The X-coordinate in the complex plane to center the view on
let centerY = 0;     // The Y-coordinate in the complex plane
let zoom = 1;        // The zoom level

// --- Panning State ---
let isDragging = false;
let startX, startY;

// --- Main Drawing Function ---
function drawMandelbrot() {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Calculate the scale based on the current zoom level and canvas size
    const scale = 2 / (width * zoom);

    // Loop over every pixel in the canvas
    for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
            
            // Convert pixel coordinates to a point on the complex plane
            // C = (x0, y0)
            const x0 = (px - width / 2) * scale + centerX;
            const y0 = (py - height / 2) * scale + centerY;

            let x = 0, y = 0;
            let iteration = 0;

            // The main Mandelbrot iteration loop
            // Check if the point escapes to infinity
            while (x * x + y * y <= 4 && iteration < MAX_ITERATIONS) {
                const xtemp = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = xtemp;
                iteration++;
            }

            // --- Coloring ---
            const pixelIndex = (py * width + px) * 4;
            if (iteration === MAX_ITERATIONS) {
                // Point is inside the set - color it black
                data[pixelIndex] = 0;
                data[pixelIndex + 1] = 0;
                data[pixelIndex + 2] = 0;
            } else {
                // Point is outside the set - color it based on how quickly it escaped
                const hue = (iteration * 360 / MAX_ITERATIONS) % 360;
                const saturation = 100;
                const lightness = 50;
                const [r, g, b] = hslToRgb(hue / 360, saturation / 100, lightness / 100);
                
                data[pixelIndex] = r;
                data[pixelIndex + 1] = g;
                data[pixelIndex + 2] = b;
            }
            data[pixelIndex + 3] = 255; // Alpha (fully opaque)
        }
    }
    // Put the generated image data onto the canvas
    ctx.putImageData(imageData, 0, 0);
}

// --- Event Handlers for Interactivity ---

// Zooming with the mouse wheel
canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const scaleFactor = event.deltaY > 0 ? 1.1 : 0.9; // Zoom in or out
    zoom /= scaleFactor;
    drawMandelbrot(); // Redraw the fractal with the new zoom level
});

// Panning with mouse drag
canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    // Move the center point based on how far the mouse was dragged
    const scale = 2 / (canvas.width * zoom);
    centerX -= dx * scale;
    centerY -= dy * scale;

    startX = event.clientX;
    startY = event.clientY;

    drawMandelbrot(); // Redraw at the new position
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

// --- Helper Function for Coloring ---
// Converts HSL (Hue, Saturation, Lightness) color to RGB
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// --- Initial Draw ---
drawMandelbrot();