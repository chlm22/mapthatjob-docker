<div align="center">
  <img src="frontend/public/apple-touch-icon.png" alt="MapThatJob Logo" width="100" height="100" style="border-radius: 12px;" />
  <h1>MapThatJob</h1>
  <p><em>Recreating my MapThatJob web application because AWS got too expensive </em>:S</p>
</div>

---

A containerized, lightning-fast job mapping application built for local demonstration. Search any city, and live job listings appear simultaneously on an interactive Leaflet map and a synchronized list.

## 🏛️ Architecture & Engineering Decisions
This version of MapThatJob was intentionally architected as a lightweight, database-free microservice to guarantee reliable, zero-cost local demonstrations. 

* **Isolated Containers:** The React frontend and Express backend run in separate Docker containers on a private network, perfectly mirroring a production-grade microservices environment.
* **Stateless UI Tracking:** Instead of relying on PostgreSQL or `localStorage` for user sessions, "Visited" jobs are tracked using an ephemeral React `Set`. This safely highlights clicked jobs and reduces map pin opacity, naturally wiping clean on every page reload for seamless back-to-back testing.
* **Backend API Gateway:** The Express server acts as a secure intermediary to the Adzuna Job API, strictly validating all location inputs and ensuring secret API keys never reach the client's browser.
* **Automated CI/CD:** A GitHub Actions pipeline automatically installs dependencies, runs native Node.js unit tests on the validation logic, and builds the Docker containers to verify deployment integrity on every push.

## Tech Stack
* **Frontend:** React 18, Vite, React-Leaflet
* **Backend:** Node.js 20, Express
* **Infrastructure:** Docker, Docker Compose, GitHub Actions
* **APIs:** Adzuna Job Search API, OpenStreetMap

## How to Run Locally

### 1. Prerequisites
* Docker Desktop installed and running.
* Free API credentials from [Adzuna Developer](https://developer.adzuna.com/).

### 2. Environment Setup
Create a `.env` file in the root directory (alongside `docker-compose.yml`) and add your keys:
```env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
PORT=8080 
```
***Make sure Ensure you have a .gitignore file that includes .env before pushing this project to a public repository to protect your API keys.***

### 3. Launch the Application
Start the containers using Docker Compose:
docker compose up --build