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
import StaffDashboard from "./Pages/StaffDashboard"; 
import AddStaff from "./Pages/AddStaff";     //  New
import TrainerDashboard from "./Pages/TrainerDashboard";
import AddTrainer from "./Pages/AddTrainer"; //  New
import TrainerList from "./Pages/TrainerList";
import EditTrainer from "./Pages/EditTrainer";
import StaffList from "./Pages/StaffList";
import EditStaff from "./Pages/EditStaff";
import Feedbacks from "./Pages/Feedbacks";
import ManageClasses from "./Pages/ManageClasses";
import ManagePayments from "./Pages/ManagePayments";
import ManageInventoryEquipment from "./Pages/Manageinventory";
import ManageMembers from "./Pages/ManageMemberss";
//import FeedbacksPage from "./Pages/Feedbacks";
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
        <Route path="/staff-dashboard" element={<StaffDashboard key={Date.now()} />}/>
        <Route path="add-staff" element={<AddStaff />} />
        <Route path="trainer-dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer-list" element={<TrainerList />} />
        <Route path="/edit-trainer/:trainerid" element={<EditTrainer />} />
        <Route path="/add-trainer" element={<AddTrainer />} />
        <Route path="/staff-list" element={<StaffList />} />
        <Route path="/edit-staff/:staffid" element={<EditStaff />} />
        <Route path="/feedbacks" element={<Feedbacks />} />
        <Route path="/manage-classes" element={<ManageClasses />} />
        <Route path="/manage-payments" element={<ManagePayments />} />
        <Route path="/manage-inventory-equipment" element={<ManageInventoryEquipment />} />
        <Route path="/manage-members" element={<ManageMembers />} />
      </Routes>
      <Footer />
      <ScrollToTop />
    </AuthProvider>
  );
}

export default App;