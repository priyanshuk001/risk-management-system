# Risk Management System

This is the **Risk Management System**, a web application built with React.js. It provides a clean user interface for user authentication, comprehensive portfolio management (covering equities, cryptocurrencies, bonds, and commodities), and insightful performance trend visualization.

---

## 🚀 Features

* **🔐 Authentication:**
    * Secure user login and signup functionality.
    * JWT (JSON Web Token) integration for secure sessions.
    * Ability to fetch and display logged-in user details.

* **💼 Portfolio Management:**
    * Seamlessly add assets across different categories: Equity, Crypto, Bonds, & Commodities.
    * Flexibility to update the details of any existing asset.
    * Option to delete assets by type.
    * A unified dashboard to view all assets in one place.

* **💹 Asset Pricing:**
    * Fetches the latest prices for all asset types via a dedicated backend API.
    * Real-time integration with various price endpoints to ensure data accuracy.

* **📊 Analytics & Visualization:**
    * Dynamic sparkline charts to visualize portfolio return trends over time.
    * A fully responsive dashboard built with Tailwind CSS for a great experience on any device.

---
## 🛠️ Installation & Setup

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/risk-management-system-frontend.git](https://github.com/your-username/risk-management-system-frontend.git)
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd risk-management-system-frontend
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    ```

4.  **Start the development server:**
    ```sh
    npm run dev
    ```

The application will be running and available at `http://localhost:5173`.

---

---

## 🔒 Tech Stack

* **Frontend Library:** [React.js](https://reactjs.org/)
* **HTTP Client:** [Axios](https://axios-http.com/)
* **Data Visualization:** [Recharts](https://recharts.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Routing:** [React Router](https://reactrouter.com/)

---

## 📌 Future Enhancements

We have a few exciting features planned for future releases:

* [ ] Add more advanced visualizations for in-depth risk analysis.
* [ ] Integrate push notifications for significant market movements.
* [ ] Implement WebSocket support for real-time price updates.
