# Maze Studio

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-2.2.5-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

> A modern, interactive web application for generating, solving, and visualizing mazes.

![Maze Studio Banner](https://via.placeholder.com/1200x400?text=Maze+Studio+Demo)

**Maze Studio** is a full-stack demonstration project that combines a robust Python Flask backend with a responsive, vanilla JavaScript frontend. It features real-time maze generation, pathfinding visualization using Breadth-First Search (BFS), and a sleek user interface with customizable themes.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

-   **Interactive Maze Generation**: Create random mazes of varying sizes (up to 60x60).
-   **Pathfinding Visualization**: Watch the BFS algorithm solve the maze in real-time with animated paths.
-   **Customizable Start/End**: Manually define start and end points for the solver.
-   **Export to PNG**: Save your generated mazes and solutions as high-quality images.
-   **Light/Dark Mode**: Toggle between a sleek dark theme and a clean light theme for optimal viewing.
-   **Responsive Design**: Works seamlessly on different screen sizes.

## 🛠️ Tech Stack

-   **Backend**: Python, Flask
-   **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript
-   **Algorithm**: Breadth-First Search (BFS) for shortest path finding

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   Python 3.8 or higher
-   pip (Python package installer)

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd maze-studio
    ```

2.  **Install Backend Dependencies**:
    It is recommended to use a virtual environment.
    ```bash
    # Create virtual environment (optional but recommended)
    python -m venv venv
    # Activate on Windows
    .\venv\Scripts\activate
    # Activate on macOS/Linux
    source venv/bin/activate

    # Install requirements
    pip install -r backend/requirements.txt
    ```

### Running the Application

1.  **Start the Flask Server**:
    From the root of the project directory:
    ```bash
    python backend/app.py
    ```

2.  **Access the App**:
    Open your web browser and navigate to:
    [http://localhost:5000](http://localhost:5000)

## 📖 Usage Guide

1.  **Generate**: Use the **Rows** and **Cols** inputs to set dimensions, then click **Generate Maze**.
2.  **Solve**: Ensure valid Start (e.g., `0,0`) and End (e.g., `5,5`) coordinates are set, then click **Solve Maze**.
3.  **Visualize**: The solution path will animate from start to end. You can adjust the **Speed** slider to control the animation.
4.  **Theme**: Click the **Toggle Theme** button to switch between Light and Dark modes.
5.  **Export**: Click **Export PNG** to download an image of the current maze state.

## 📂 Project Structure

```text
maze-studio/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── solver.py           # Maze solving logic (BFS)
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Container configuration
├── frontend/
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # Modern styling with CSS variables
│   └── main.js             # Frontend logic and Canvas rendering
└── README.md               # Project documentation
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
