import { createBrowserRouter, Navigate, Route, RouterProvider, Routes } from "react-router-dom";
import Layout from "./routes/layout/layout.jsx";
import HomePage from "./routes/homePage/homePage.jsx";
import ListPage from "./routes/listPage/listPage.jsx";
import SinglePage from "./routes/singlePage/SinglePage.jsx";
import Login from "./routes/login/login.jsx";
import Register from "./routes/register/register.jsx";
import About from "./routes/about/about.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";


import { useEffect, useState } from "react";
import useAuthStore from "./store/useAuthStore.js";
import Profile from "./components/profile/Profile.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import AddProperty from "./pages/AddProperty.jsx";
import PropertyView from "./pages/PropertyView.jsx";
import EditProperty from "./pages/EditProperty.jsx";


const App = () => {
    const { checkAuth, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                await checkAuth();
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '1.2rem'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                
                <Route path="/" element={<HomePage />} />
                <Route path="/list" element={<ListPage />} />
                <Route path="/:id" element={<SinglePage />} />
                <Route path="/my-property/:id" element={user ? <PropertyView /> : <Navigate to="/login" />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/add-property" element={user ? <AddProperty /> : <Navigate to="/login" />} />
                <Route path="/edit-property/:id" element={user ? <EditProperty /> : <Navigate to="/login" />} />
                
                <Route 
                    path="/profile/admin" 
                    element={
                        user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
                    } 
                />
                
            </Routes>
        </div>
    );
}

export default App;