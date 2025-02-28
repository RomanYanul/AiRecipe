import React, { useEffect, useState } from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';
import { useAppSelector } from '../app/hooks';

const GlobalLoader: React.FC = () => {
  const { isGenerating, isLoading } = useAppSelector((state) => state.recipes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check localStorage for submission state
  useEffect(() => {
    // Function to check localStorage
    const checkSubmittingState = () => {
      const submittingState = localStorage.getItem('recipe_submitting');
      setIsSubmitting(submittingState === 'true');
    };
    
    // Check immediately on mount
    checkSubmittingState();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', checkSubmittingState);
    
    // Also poll regularly to be extra safe
    const interval = setInterval(checkSubmittingState, 100);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', checkSubmittingState);
      clearInterval(interval);
    };
  }, []);
  
  // Force the component to re-render every 100ms to check localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSubmitting(localStorage.getItem('recipe_submitting') === 'true');
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Show loader when either generating a recipe, loading data, or form is being submitted
  const isOpen = isGenerating || isLoading || isSubmitting;
  
  console.log('GlobalLoader state:', { isGenerating, isLoading, isSubmitting, isOpen });

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={isOpen}
    >
      <CircularProgress color="primary" size={60} thickness={4} />
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {isGenerating || isSubmitting ? 'Generating Your Recipe' : 'Loading...'}
        </Typography>
        <Typography variant="body2" component="div">
          {isGenerating || isSubmitting
            ? 'Our AI chef is cooking up something delicious...'
            : 'Please wait while we prepare your recipes'}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default GlobalLoader; 