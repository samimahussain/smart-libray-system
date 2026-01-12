import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import Landing from './pages/public/Landing'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Privacy from './pages/public/Privacy'
import BrowseMenu from './pages/public/BrowseMenu'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { LibrarianRegister } from './pages/auth/LibrarianRegister'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { ProtectedRoute } from './components/ProtectedRoute'
import  AppLayout  from './components/layout/AppLayout'
import ReadBook from "./pages/user/ReadBook"
import Dashboard from './pages/user/Dashboard'
import { Library } from './pages/user/Library'
import { MyBooks } from './pages/user/MyBooks'
import { AIChat } from './pages/user/AIChat'
import { StudyPlan } from './pages/user/StudyPlan'
import { Attendance } from './pages/user/Attendance'
import { Analytics } from './pages/user/Analytics'
import { Profile } from './pages/user/Profile'

import { LibrarianLayout } from './components/layout/LibrarianLayout'
import LibrarianDashboard from './pages/librarian/Dashboard'
import OfflineRequests from './pages/librarian/OfflineRequests'
import Inventory from './pages/librarian/Inventory'
import LibrarianAttendance from './pages/librarian/Attendance'
import Fines from './pages/librarian/Fines'
import UserVerification from './pages/librarian/UserVerification'

import { AdminLayout } from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import Roles from './pages/admin/Roles'
import SystemConfig from './pages/admin/SystemConfig'
import AIEngine from './pages/admin/AIEngine'
import Moderation from './pages/admin/Moderation'
import Reports from './pages/admin/Reports'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/librarian-register" element={<LibrarianRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        
<Route
  path="/browse-menu"
  element={
    <AppLayout>
      <BrowseMenu />
    </AppLayout>
  }
/>


        {/* ✅ USER DASHBOARD */}
        <Route
  path="/user"
  element={
    <ProtectedRoute role="User">
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </ProtectedRoute>
  }
/>


        <Route
  path="/profile"
  element={
    <ProtectedRoute role="User">
      <AppLayout>
        <Profile />
      </AppLayout>
    </ProtectedRoute>
  }
/>

<Route path="/read/:bookId" element={<ReadBook />} />
<Route
  path="/librarian"
  element={
    <ProtectedRoute role="Librarian">
      <LibrarianLayout>
        <LibrarianDashboard />
      </LibrarianLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/librarian/fines"
  element={
    <ProtectedRoute role="Librarian">
      <LibrarianLayout>
        <Fines />
      </LibrarianLayout>
    </ProtectedRoute>
  }
/>

<Route path="/librarian/requests" element={<ProtectedRoute role="Librarian"><LibrarianLayout><OfflineRequests /></LibrarianLayout></ProtectedRoute>} />
<Route path="/librarian/inventory" element={<ProtectedRoute role="Librarian"><LibrarianLayout><Inventory /></LibrarianLayout></ProtectedRoute>} />
<Route path="/librarian/attendance" element={<ProtectedRoute role="Librarian"><LibrarianLayout><LibrarianAttendance /></LibrarianLayout></ProtectedRoute>} />
<Route path="/librarian/verify" element={<ProtectedRoute role="Librarian"><LibrarianLayout><UserVerification /></LibrarianLayout></ProtectedRoute>} />


<Route path="/admin" element={<ProtectedRoute role="Admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/roles" element={<ProtectedRoute role="Admin"><AdminLayout><Roles /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/system" element={<ProtectedRoute role="Admin"><AdminLayout><SystemConfig /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/ai" element={<ProtectedRoute role="Admin"><AdminLayout><AIEngine /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/moderation" element={<ProtectedRoute role="Admin"><AdminLayout><Moderation /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/reports" element={<ProtectedRoute role="Admin"><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />

        {/* ✅ USER MODULE ROUTES */}
        {[
          ['library', <Library />],
          ['my-books', <MyBooks />],
          ['ai-chat', <AIChat />],
          ['study-plan', <StudyPlan />],
          ['attendance', <Attendance />],
          ['analytics', <Analytics />]
        ].map(([path, page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <ProtectedRoute role="User">
                <AppLayout>{page}</AppLayout>
              </ProtectedRoute>
            }

          />
        ))}
<Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
