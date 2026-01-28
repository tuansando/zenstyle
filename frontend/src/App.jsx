import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";

// Layout
import Layout from "./components/Layout/Layout";

// Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Booking from "./pages/Booking";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";

// Auth
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Dashboard
import ClientDashboard from "./pages/Dashboard/ClientDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import StaffDashboard from "./pages/Dashboard/StaffDashboard";

// Protected Route
import ProtectedRoute from "./components/Auth/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: "#fff",
                            color: "#584430",
                            borderRadius: "12px",
                            padding: "16px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        },
                    }}
                />

                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="services" element={<Services />} />
                        <Route path="products" element={<Products />} />
                        <Route path="booking" element={<Booking />} />
                        <Route path="blog" element={<Blog />} />
                        <Route path="about" element={<About />} />
                        <Route path="contact" element={<Contact />} />
                    </Route>

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Profile Route - All authenticated users */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute
                                allowedRoles={["Client", "Admin", "Stylist"]}
                            >
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Feedback Route - Client only */}
                    <Route
                        path="/feedback"
                        element={
                            <ProtectedRoute allowedRoles={["Client"]}>
                                <Feedback />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Dashboard Routes */}
                    <Route
                        path="/dashboard/client"
                        element={
                            <ProtectedRoute allowedRoles={["Client"]}>
                                <ClientDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/admin"
                        element={
                            <ProtectedRoute allowedRoles={["Admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/staff"
                        element={
                            <ProtectedRoute allowedRoles={["Stylist", "Admin"]}>
                                <StaffDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
