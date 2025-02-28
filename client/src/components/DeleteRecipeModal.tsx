import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { Recipe } from '../services/openai';
import { useAppDispatch } from '../app/hooks';
import { deleteRecipe } from '../features/recipes/recipeSlice';

interface DeleteRecipeModalProps {
  open: boolean;
  recipe: Recipe | null;
  onClose: () => void;
}

const DeleteRecipeModal: React.FC<DeleteRecipeModalProps> = ({ open, recipe, onClose }) => {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    if (recipe) {
      const recipeId = recipe._id || recipe.id;
      if (recipeId) {
        console.log('Deleting recipe with ID:', recipeId);
        dispatch(deleteRecipe(recipeId));
        onClose();
      } else {
        console.error('Recipe has no ID:', recipe);
        alert('Cannot delete recipe: Missing recipe ID');
        onClose();
      }
    }
  };

  if (!recipe) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-recipe-dialog-title"
      aria-describedby="delete-recipe-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: '100%',
          maxWidth: 500,
        },
      }}
    >
      <DialogTitle id="delete-recipe-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Delete Recipe
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-recipe-dialog-description" sx={{ mb: 2 }}>
          Are you sure you want to delete <strong>{recipe.title}</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="primary"
          sx={{ borderRadius: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleDelete} 
          variant="contained" 
          color="error"
          sx={{ borderRadius: 1 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRecipeModal; 