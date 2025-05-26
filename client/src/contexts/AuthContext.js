import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import axios from 'axios';

// Create context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null
};

// Create reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGIN_DIRECT':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Load user
  const loadUser = useCallback(async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    } else {
      return false; // No token, no need to try loading user
    }
    
    try {
      const res = await axios.get('/api/auth'); // Correct endpoint as per routes file
      
      dispatch({
        type: 'USER_LOADED',
        payload: res.data
      });
      return true;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.msg || 'Authentication error'
      });
      return false;
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Register user
  const register = async (formData, showNotification) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const res = await axios.post('/api/auth/register', formData, config);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });
      
      await loadUser();
      
      // Show success notification and refresh
      if (showNotification) {
        showNotification('Registration successful! Welcome!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      return true; // Return true on success
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed';
      dispatch({
        type: 'REGISTER_FAIL',
        payload: errorMsg
      });
      
      // Show error notification
      if (showNotification) {
        showNotification(errorMsg, 'error');
      }
      
      return false; // Return false on failure
    }
  };

  // Login user
  const login = async (formData, showNotification) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const res = await axios.post('/api/auth/login', formData, config);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });
      
      await loadUser();
      
      // Show success notification and refresh
      if (showNotification) {
        showNotification('Login successful! Welcome back!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      return true; // Return true on success
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Login failed';
      dispatch({
        type: 'LOGIN_FAIL',
        payload: errorMsg
      });
      
      // Show error notification
      if (showNotification) {
        showNotification(errorMsg, 'error');
      }
      
      return false; // Return false on failure
    }
  };

  // Direct login (for email verification)
  const loginDirect = (token, user) => {
    setAuthToken(token);
    dispatch({
      type: 'LOGIN_DIRECT',
      payload: { token, user }
    });
  };

  // Logout user
  const logout = (showNotification) => {
    dispatch({ type: 'LOGOUT' });
    
    // Show logout notification and refresh
    if (showNotification) {
      showNotification('You have been logged out successfully', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        loginDirect,
        logout,
        loadUser,
        clearError,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};