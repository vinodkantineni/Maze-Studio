// frontend/main.js
// Simple canvas UI + API wiring
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const genBtn = document.getElementById("genBtn");
const solveBtn = document.getElementById("solveBtn");
const exportBtn = document.getElementById("exportBtn");
const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const progress = document.getElementById("progress");
const status = document.getElementById("status");
const speed = document.getElementById("speed");
const showCoords = document.getElementById("showCoords");
const showGrid = document.getElementById("showGrid");
const themeToggle = document.getElementById("themeToggle");

let grid = [];
let rows = parseInt(rowsInput.value);
let cols = parseInt(colsInput.value);
let cellSize = 40;
let path = [];
let revealIndex = 0;
let timer = null;

// Theme Logic
function initTheme() {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    themeToggle.checked = (saved === "dark");
}

function toggleTheme() {
    const next = themeToggle.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    draw(); // redraw canvas with new colors
}

function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    draw();
}
window.addEventListener("resize", resizeCanvas);

function generateRandomMaze(r = rows, c = cols) {
    rows = r; cols = c;
    grid = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            // lower probability = fewer walls
            row.push(Math.random() > 0.28 ? 0 : 1);
        }
        grid.push(row);
    }
    // If you want to mimic your old border style, you can force some walls
    // ensure borders are free maybe, but we leave as is
    draw();
}

function draw() {
    // Read colors from CSS variables
    const bg = getVar("--canvas-bg");
    const wallColor = getVar("--wall-color");
    const freeColor = getVar("--free-color");
    const gridLine = getVar("--grid-line");
    const pathColor = getVar("--red");
    const startColor = getVar("--cyan");
    const endColor = getVar("--green");
    const coordsColor = getVar("--text-muted");

    if (!grid.length) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }
    // compute cell size
    cellSize = Math.min(canvas.width / cols, canvas.height / rows);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * cellSize, y = r * cellSize;
            if (grid[r][c] === 1) {
                ctx.fillStyle = wallColor;
            } else {
                ctx.fillStyle = freeColor;
            }
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }

    // draw revealed path up to revealIndex
    for (let i = 0; i < revealIndex && i < path.length; i++) {
        const [r, c] = path[i];
        ctx.fillStyle = pathColor;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }

    // start/end overlays if present
    const s = parsePoint(startInput.value);
    const e = parsePoint(endInput.value);
    if (s) { ctx.fillStyle = startColor; ctx.fillRect(s[1] * cellSize, s[0] * cellSize, cellSize, cellSize) }
    if (e) { ctx.fillStyle = endColor; ctx.fillRect(e[1] * cellSize, e[0] * cellSize, cellSize, cellSize) }

    if (showGrid.checked) {
        ctx.strokeStyle = gridLine;
        ctx.lineWidth = 1;
        for (let r = 0; r <= rows; r++) {
            ctx.beginPath(); ctx.moveTo(0, r * cellSize); ctx.lineTo(cols * cellSize, r * cellSize); ctx.stroke();
        }
        for (let c = 0; c <= cols; c++) {
            ctx.beginPath(); ctx.moveTo(c * cellSize, 0); ctx.lineTo(c * cellSize, rows * cellSize); ctx.stroke();
        }
    }

    if (showCoords.checked) {
        ctx.fillStyle = coordsColor;
        ctx.font = Math.max(10, Math.floor(cellSize / 5)) + "px Segoe UI";
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                ctx.fillText(`(${r},${c})`, c * cellSize + 4, r * cellSize + Math.floor(cellSize * 0.25));
            }
        }
    }
}

function parsePoint(txt) {
    if (!txt) return null;
    const parts = txt.split(",").map(s => parseInt(s.trim()));
    if (parts.length !== 2) return null;
    const r = parts[0], c = parts[1];
    if (Number.isNaN(r) || Number.isNaN(c)) return null;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return [r, c];
}

async function solveMaze() {
    if (!grid.length) {
        status.textContent = "Generate a maze first";
        return;
    }
    const s = parsePoint(startInput.value);
    const e = parsePoint(endInput.value);
    if (!s || !e) {
        status.textContent = "Start/End invalid";
        return;
    }
    // prepare payload
    const payload = { grid: grid, start: s, end: e };
    status.textContent = "Solving...";
    try {
        const resp = await fetch("/solve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (data.path === null) {
            status.textContent = "No path found";
            path = [];
            revealIndex = 0;
            draw();
            return;
        }
        path = data.path; // array of [r,c]
        revealIndex = 0;
        progress.value = 0;
        status.textContent = `Found path len ${data.length}. Playing...`;
        startPlayback();
    } catch (err) {
        console.error(err);
        status.textContent = "Error calling server";
    }
}

function startPlayback() {
    stopPlayback();
    timer = setInterval(() => {
        if (revealIndex < path.length) {
            revealIndex++;
            progress.value = Math.floor((revealIndex / Math.max(1, path.length)) * 100);
            draw();
        } else {
            stopPlayback();
            status.textContent = "Animation done";
        }
    }, parseInt(speed.value));
}

function stopPlayback() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function exportPNG() {
    const link = document.createElement("a");
    link.download = `maze_${rows}x${cols}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

genBtn.addEventListener("click", () => {
    rows = parseInt(rowsInput.value);
    cols = parseInt(colsInput.value);
    generateRandomMaze(rows, cols);
});
solveBtn.addEventListener("click", solveMaze);

// Theme Logic
function initTheme() {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    themeToggle.checked = (saved === "dark");
}

function toggleTheme() {
    const next = themeToggle.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    draw(); // redraw canvas with new colors
}

function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    draw();
}
window.addEventListener("resize", resizeCanvas);

function generateRandomMaze(r = rows, c = cols) {
    rows = r; cols = c;
    grid = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            // lower probability = fewer walls
            row.push(Math.random() > 0.28 ? 0 : 1);
        }
        grid.push(row);
    }
    // If you want to mimic your old border style, you can force some walls
    // ensure borders are free maybe, but we leave as is
    draw();
}

function draw() {
    // Read colors from CSS variables
    const bg = getVar("--canvas-bg");
    const wallColor = getVar("--wall-color");
    const freeColor = getVar("--free-color");
    const gridLine = getVar("--grid-line");
    const pathColor = getVar("--red");
    const startColor = getVar("--cyan");
    const endColor = getVar("--green");
    const coordsColor = getVar("--text-muted");

    if (!grid.length) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }
    // compute cell size
    cellSize = Math.min(canvas.width / cols, canvas.height / rows);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * cellSize, y = r * cellSize;
            if (grid[r][c] === 1) {
                ctx.fillStyle = wallColor;
            } else {
                ctx.fillStyle = freeColor;
            }
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }

    // draw revealed path up to revealIndex
    for (let i = 0; i < revealIndex && i < path.length; i++) {
        const [r, c] = path[i];
        ctx.fillStyle = pathColor;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }

    // start/end overlays if present
    const s = parsePoint(startInput.value);
    const e = parsePoint(endInput.value);
    if (s) { ctx.fillStyle = startColor; ctx.fillRect(s[1] * cellSize, s[0] * cellSize, cellSize, cellSize) }
    if (e) { ctx.fillStyle = endColor; ctx.fillRect(e[1] * cellSize, e[0] * cellSize, cellSize, cellSize) }

    if (showGrid.checked) {
        ctx.strokeStyle = gridLine;
        ctx.lineWidth = 1;
        for (let r = 0; r <= rows; r++) {
            ctx.beginPath(); ctx.moveTo(0, r * cellSize); ctx.lineTo(cols * cellSize, r * cellSize); ctx.stroke();
        }
        for (let c = 0; c <= cols; c++) {
            ctx.beginPath(); ctx.moveTo(c * cellSize, 0); ctx.lineTo(c * cellSize, rows * cellSize); ctx.stroke();
        }
    }

    if (showCoords.checked) {
        ctx.fillStyle = coordsColor;
        ctx.font = Math.max(10, Math.floor(cellSize / 5)) + "px Segoe UI";
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                ctx.fillText(`(${r},${c})`, c * cellSize + 4, r * cellSize + Math.floor(cellSize * 0.25));
            }
        }
    }
}

function parsePoint(txt) {
    if (!txt) return null;
    const parts = txt.split(",").map(s => parseInt(s.trim()));
    if (parts.length !== 2) return null;
    const r = parts[0], c = parts[1];
    if (Number.isNaN(r) || Number.isNaN(c)) return null;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return [r, c];
}

async function solveMaze() {
    if (!grid.length) {
        status.textContent = "Generate a maze first";
        return;
    }
    const s = parsePoint(startInput.value);
    const e = parsePoint(endInput.value);
    if (!s || !e) {
        status.textContent = "Start/End invalid";
        return;
    }
    // prepare payload
    const payload = { grid: grid, start: s, end: e };
    status.textContent = "Solving...";
    try {
        const resp = await fetch("/solve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (data.path === null) {
            status.textContent = "No path found";
            path = [];
            revealIndex = 0;
            draw();
            return;
        }
        path = data.path; // array of [r,c]
        revealIndex = 0;
        progress.value = 0;
        status.textContent = `Found path len ${data.length}. Playing...`;
        startPlayback();
    } catch (err) {
        console.error(err);
        status.textContent = "Error calling server";
    }
}

function startPlayback() {
    stopPlayback();
    timer = setInterval(() => {
        if (revealIndex < path.length) {
            revealIndex++;
            progress.value = Math.floor((revealIndex / Math.max(1, path.length)) * 100);
            draw();
        } else {
            stopPlayback();
            status.textContent = "Animation done";
        }
    }, parseInt(speed.value));
}

function stopPlayback() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function exportPNG() {
    const link = document.createElement("a");
    link.download = `maze_${rows}x${cols}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

genBtn.addEventListener("click", () => {
    rows = parseInt(rowsInput.value);
    cols = parseInt(colsInput.value);
    generateRandomMaze(rows, cols);
});
solveBtn.addEventListener("click", solveMaze);
exportBtn.addEventListener("click", exportPNG);
playBtn.addEventListener("click", startPlayback);
pauseBtn.addEventListener("click", stopPlayback);
themeToggle.addEventListener("change", toggleTheme);

// Feedback Modal Logic
const feedbackBtn = document.getElementById("feedbackBtn");
const feedbackModal = document.getElementById("feedbackModal");
const closeModal = document.querySelector(".close-modal");
const feedbackForm = document.getElementById("feedbackForm");

feedbackBtn.addEventListener("click", () => {
    feedbackModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
    feedbackModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target == feedbackModal) {
        feedbackModal.style.display = "none";
    }
});

feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = feedbackForm.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    const data = {
        name: document.getElementById("fbName").value,
        email: document.getElementById("fbEmail").value,
        problem: document.getElementById("fbProblem").value,
        suggestion: document.getElementById("fbSuggestion").value
    };

    try {
        const resp = await fetch("/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            alert("Feedback sent successfully!");
            feedbackModal.style.display = "none";
            feedbackForm.reset();
        } else {
            alert("Failed to send feedback.");
        }
    } catch (err) {
        console.error(err);
        alert("Error sending feedback.");
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// init
initTheme();
generateRandomMaze(rows, cols);
resizeCanvas();