# ExpenseSensei

An AI-powered expense management application that helps you track, analyze, and manage your finances effortlessly. ExpenseSensei combines intelligent AI capabilities with an intuitive user interface to provide smart expense tracking and financial insights.

## 🌟 Features

- **AI-Powered Expense Analysis**: Leverage Google's Generative AI to get intelligent insights about your spending patterns
- **Receipt Recognition**: Upload and automatically parse receipts using OCR technology (Tesseract.js)
- **Visual Analytics**: Interactive charts and graphs to visualize your expense trends and patterns
- **User Authentication**: Secure login and registration with JWT authentication
- **Expense Tracking**: Easily log and categorize your expenses
- **Automated Notifications**: Schedule reminders and notifications with node-cron
- **Responsive Design**: Beautiful, mobile-friendly interface built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI library
- **Vite 6.0** - Lightning-fast build tool with HMR
- **Tailwind CSS 4.2** - Utility-first CSS framework
- **Recharts 3.8** - Interactive charting library
- **React Router DOM 7.14** - Client-side routing
- **Axios 1.15** - HTTP client for API requests
- **Lucide React & React Icons** - Icon libraries

### Backend
- **Express 5.2** - Web framework
- **MongoDB/Mongoose 9.6** - Database and ODM
- **Google Generative AI 0.24** - AI integration
- **JWT Authentication** - Secure token-based auth
- **Bcrypt** - Password hashing
- **Tesseract.js 7.0** - OCR for receipt scanning
- **Brevo (formerly Sendinblue)** - Email notifications
- **node-cron 4.2** - Task scheduling
- **CORS 2.8** - Cross-origin support

## 📦 Installation

### Prerequisites
- Node.js 16 or higher
- MongoDB instance running locally or connection string
- Google API key for Generative AI
- Environment variables configured

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```
### Backend Setup
cd Backend

# Install dependencies
npm install
```
# Configure environment variables
# Create a .env file with:
# MONGODB_URI=your_mongodb_connection_string
# GOOGLE_API_KEY=your_google_generative_ai_key
# JWT_SECRET=your_jwt_secret
# BREVO_API_KEY=your_brevo_api_key

# Start the server
node index.js
```
🚀 Getting Started
1.Clone the repository:
```
git clone https://github.com/Atharvap7804/ExpenseSensei.git
cd ExpenseSensei
```
2.Set up the frontend and backend following the installation steps above

3.Access the application at http://localhost:5173 (or the configured port)

4.Create an account and start tracking your expenses

📚 Project Structure
```
ExpenseSensei/
├── src/                    # Frontend React components
├── Backend/               # Express backend server
│   └── package.json      # Backend dependencies
├── package.json          # Frontend dependencies
├── vite.config.js        # Vite configuration
└── README.md
```

### 🤖 AI Features
- **Smart Expense Analysis** : Get personalized insights on your spending using Google's Generative AI
- **Receipt Parsing** : Automatically extract information from receipt images using OCR
- **Spending Recommendations** : Receive AI-powered suggestions to optimize your budget

### 🔐 Security
- Password encryption with bcrypt
- JWT-based authentication
- Secure API endpoints with CORS protection
- Environment-based configuration for sensitive data

### 📧 Features in Development
- Email notifications for budget alerts (via Brevo)
- Scheduled reports and summaries
- Expense categorization automation
- Budget planning and forecasting

### 🤝 Contributing
Contributions are welcome! Feel free to open issues and submit pull requests to improve the project.

### 📄 License
This project is licensed under the ISC License.

### 💡 Tips
- Enable notifications to get timely expense reminders
- Use the receipt scanner for quick expense logging
- Check the analytics dashboard regularly to understand your spending patterns
- Set budget limits to stay on track with your finances

### Made with ❤️ by ExpenseSensei Team
