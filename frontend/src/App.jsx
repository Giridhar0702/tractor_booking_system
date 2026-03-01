import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddTractor from './pages/AddTractor';
import MyTractors from './pages/MyTractors';
import BookingRequests from './pages/BookingRequests';
import BrowseTractors from './pages/BrowseTractors';
import MyBookings from './pages/MyBookings';
import { AuthProvider } from './context/AuthContext';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tractors" element={<BrowseTractors />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="add-tractor" element={<AddTractor />} />
            <Route path="my-tractors" element={<MyTractors />} />
            <Route path="booking-requests" element={<BookingRequests />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
