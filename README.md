Risk Management System - Frontend
This is the frontend for the Risk Management System, a web application built with React.js. It provides a clean user interface for user authentication, comprehensive portfolio management (covering equities, cryptocurrencies, bonds, and commodities), and insightful performance trend visualization.

🚀 Features
🔐 Authentication:

Secure user login and signup functionality.

JWT (JSON Web Token) integration for secure sessions.

Ability to fetch and display logged-in user details.

💼 Portfolio Management:

Seamlessly add assets across different categories: Equity, Crypto, Bonds, & Commodities.

Flexibility to update the details of any existing asset.

Option to delete assets by type.

A unified dashboard to view all assets in one place.

💹 Asset Pricing:

Fetches the latest prices for all asset types via a dedicated backend API.

Real-time integration with various price endpoints to ensure data accuracy.

📊 Analytics & Visualization:

Dynamic sparkline charts to visualize portfolio return trends over time.

A fully responsive dashboard built with Tailwind CSS for a great experience on any device.

📂 Project Structure
The project follows a modular structure to keep the codebase organized and maintainable.

frontend/
│
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Auth/            # Login & Signup components
│   │   ├── Charts/          # Sparkline & other chart components
│   │   └── Portfolio/       # Components for portfolio management
│   │
│   ├── pages/               # Application pages/routes
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Dashboard.js
│   │   └── Portfolio.js
│   │
│   ├── utils/               # Utility functions and helpers
│   │   └── apiPaths.js      # API base URL and endpoint constants
│   │
│   ├── App.js               # Main application component with routing
│   ├── index.js             # Entry point of the React application
│
├── package.json
└── README.md

🛠️ Installation & Setup
To get a local copy up and running, follow these simple steps.

Clone the repository:

git clone https://github.com/your-username/risk-management-system-frontend.git

Navigate to the project directory:

cd risk-management-system-frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The application will be running and available at http://localhost:5173.

📸 Screenshots
Login Page

Dashboard View

Portfolio Management

[Insert Login Screenshot]

[Insert Dashboard Screenshot]

[Insert Portfolio Screenshot]

Secure user authentication.

View portfolio analytics.

Manage assets with ease.

🔒 Tech Stack
Frontend Library: React.js

HTTP Client: Axios

Data Visualization: Recharts

Styling: Tailwind CSS

Routing: React Router

📌 Future Enhancements
We have a few exciting features planned for future releases:

[ ] Add more advanced visualizations for in-depth risk analysis.

[ ] Integrate push notifications for significant market movements.

[ ] Implement WebSocket support for real-time price updates.
