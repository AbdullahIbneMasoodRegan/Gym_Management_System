import { Route, Routes } from "react-router-dom";
import NavBar from "./components/navigation/Navbar";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Schedule from "./Pages/Schedule";
import Contact from "./Pages/Contact";
import Pricing from "./Pages/Pricing";
import Classes from "./Pages/Classes";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Profile from "./Pages/Profile";
import Footer from "./components/footer/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AddMember from "./Pages/AddMember";
import AdminLogin from "./Pages/AdminLogin"; // New
import AdminDashboard from "./Pages/AdminDashboard"; // New
import { AuthProvider } from "./contexts/AuthContext"; // Ensure this is imported

function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="contact" element={<Contact />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="classes" element={<Classes />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin-login" element={<AdminLogin />} /> 
        <Route path="admin-dashboard" element={<AdminDashboard />} /> 
        <Route path="add-member" element={<AddMember />} />
      </Routes>
      <Footer />
      <ScrollToTop />
    </AuthProvider>
  );
}

export default App;