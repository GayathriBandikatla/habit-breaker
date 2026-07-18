import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { HabitProvider } from './context/HabitContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { UserProvider } from './context/UserContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <HabitProvider>
          <App />
        </HabitProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
);
