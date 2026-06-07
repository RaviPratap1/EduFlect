import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { CategoryProvider } from './context/CategoryContext';
import { EnrollmentProvider } from './context/EnrollmentContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <CategoryProvider>
            <EnrollmentProvider>
              <App />
              <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#1e1e2e', color: '#fff' } }} />
            </EnrollmentProvider>
          </CategoryProvider>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
