import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import BookAppointment from './pages/BookAppointment'
import Home from './pages/Home'
import Login from './pages/Login'
import MyAppointments from './pages/MyAppointments'
import Profile from './pages/Profile'
import Register from './pages/Register'
import SalonDetail from './pages/SalonDetail'

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="salons/:id" element={<SalonDetail />} />
        <Route
          path="salons/:id/book"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
