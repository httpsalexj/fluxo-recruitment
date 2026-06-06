import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Apply } from './pages/Apply';
import { Success } from './pages/Success';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<SiteShell><Landing /></SiteShell>} />
          <Route path="/apply" element={<SiteShell><Apply /></SiteShell>} />
          <Route path="/success" element={<SiteShell><Success /></SiteShell>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
