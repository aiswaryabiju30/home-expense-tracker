# 🏠 Home Ledger — Smart Home Expense Tracker

A full-stack web application that helps guardians and households track monthly expenses, set category-wise budgets, and visualize spending trends — built with React, Flask, and SQLite.

## 📸 Overview

Home Ledger is a personal finance dashboard designed for home/family expense management. Users can register, log in securely, add expenses under categories like Groceries, Rent, School Fees, Medical, and more, and instantly see budget progress, spending trends, and simple predictive insights.

## ✨ Features

- 🔐 Secure Authentication — JWT-based register and login system
- 💰 Expense Tracking — Add, view expenses by category with real-time budget updates
- 📊 Data Visualization — Interactive donut chart (category breakdown) and 6-month trend bar chart using Recharts
- 🎯 Budget Monitoring — Category-wise budget cards with progress bars and over-budget alerts
- 📈 Spending Prediction — Simple trend-based prediction for next month's expenses
- 🎨 Custom UI Design — Warm, ledger-inspired design with Tailwind CSS, custom illustrations, and a "receipt stub" category card design
- 📱 Responsive Layout — Works across desktop and mobile screens

## 🛠️ Tech Stack

Frontend: React (Vite), Tailwind CSS, Recharts, Lucide React, Axios

Backend: Python Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS

Database: SQLite

## ⚙️ Setup & Installation

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors
python app.py

Backend runs on https://home-expense-tracker-pfx6.onrender.com

### Frontend
cd frontend
npm install
npm run dev

Frontend runs on http://localhost:5173

## 🔑 API Endpoints

POST /api/register — Register a new user
POST /api/login — Log in and receive JWT token
GET /api/expenses — Get all expenses for logged-in user
POST /api/expenses — Add a new expense
PUT /api/expenses/<id> — Update an expense
DELETE /api/expenses/<id> — Delete an expense

## 🚀 Future Improvements

- Deploy live version (Render + Vercel)
- Multi-member household expense tracking
- PDF report export
- Password reset functionality

## 👩‍💻 Author

Aiswarya Biju
B.Tech in Artificial Intelligence and Machine Learning
GitHub: https://github.com/aiswaryabiju30

Built as a portfolio project to demonstrate full-stack development skills including authentication, REST APIs, database design, and modern UI/UX.