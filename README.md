<div align="center">
  <img src="frontend/public/apple-touch-icon.png" alt="MapThatJob Logo" width="100" height="100" style="border-radius: 12px;" />
  <h1>MapThatJob</h1>
  <p><em>Recreating my MapThatJob web application because AWS got too expensive </em>:S</p>
</div>

---

MapThatJob is a fast job search app that runs on your own computer with Docker. Search for any city, and real job listings show up on an interactive map and in a list next to it, both at the same time.

## 🏛️ Architecture & Engineering Decisions
I built this version to be small and simple: no database and no cloud bill, so anyone can run it for free and it works the same way every time.

* **Isolated Containers:** The React frontend and the Express backend each run in their own Docker container and talk to each other over a private network. This is the same setup many real-world apps use.

* **Temporary UI Tracking:** Instead of relying on PostgreSQL or `localStorage` for user sessions, "Visited" jobs are tracked using an ephemeral React `Set`. This safely highlights clicked jobs and reduces map pin opacity, naturally wiping clean on every page reload for seamless back-to-back testing.

* **Backend API Gateway:** Backend keeps secrets safe. The browser never talks to the job search service directly. Instead, the Express backend sits in the middle: it checks every city you type, asks the Adzuna Job API for jobs, and sends the results back. This way, the secret API keys stay on the server and never reach your browser.

* **Automated CI/CD:** A GitHub Actions pipeline automatically installs dependencies, runs native Node.js unit tests on the validation logic, and builds the Docker containers to verify deployment integrity on every push.

## Tech Stack
* **Frontend:** React 18, Vite, React-Leaflet
* **Backend:** Node.js 22, Express
* **Infrastructure:** Docker, Docker Compose, GitHub Actions
* **APIs:** Adzuna Job Search API, OpenStreetMap

## How to Run Locally

### 1. Prerequisites
* Docker Desktop installed and running.
* Free API credentials (ID and Key) from [Adzuna Developer](https://developer.adzuna.com/).

### 2. Environment Setup
Create a `.env` file in the root directory (alongside `docker-compose.yml`) and add your keys:
```env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
PORT=8080 
```
***Make sure you have a .gitignore file that includes .env before pushing this project to a public repository to protect your API keys.***

### 3. Launch the Application
* Run this command in the main project folder:\
***docker compose up --build***
* Then open ***http://localhost:5173*** in your browser.
* To stop the app, press Ctrl+C, then run:\
***docker compose down***