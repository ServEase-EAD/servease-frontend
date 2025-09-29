import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import CustomerDashboard from "./components/CustomerDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import "./App.css";

// Temporary Home component until you create a proper one
const HomePage = () => (
  <div>
    <h1>Welcome to ServEase</h1>
    <p>Home page content goes here</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
