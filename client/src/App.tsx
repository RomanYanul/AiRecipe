import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import GenerateRecipe from './components/GenerateRecipe';
import RecipeView from './components/RecipeView';
import SavedRecipes from './components/SavedRecipes';
import GlobalLoader from './components/GlobalLoader';

// Create a food-themed green color palette
const theme = createTheme({
  palette: {
    primary: {
      light: '#81c784', // light green
      main: '#4caf50', // green
      dark: '#388e3c', // dark green
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffb74d', // light orange
      main: '#ff9800', // orange (for accents)
      dark: '#f57c00', // dark orange
      contrastText: '#fff',
    },
    background: {
      default: '#f9fbf9', // very light green tint for background
      paper: '#ffffff',
    },
    text: {
      primary: '#2e3b2e', // dark green-gray for text
      secondary: '#5c6b5c', // medium green-gray for secondary text
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navbar />
            {/* GlobalLoader is outside of Routes to ensure it's always available */}
            <GlobalLoader />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                {/* Protected routes */}
                <Route path="/generate" element={<GenerateRecipe />} />
                <Route path="/recipe" element={<RecipeView />} />
                <Route path="/saved-recipes" element={<SavedRecipes />} />
              </Route>
            </Routes>
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
