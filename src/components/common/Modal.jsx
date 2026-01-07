import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { X } from 'lucide-react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'medium',
  footer 
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Map size to valid MUI maxWidth
  const getMaxWidth = () => {
    switch (size) {
      case 'small': return 'xs';
      case 'large': return 'lg';
      case 'full': return 'xl';
      default: return 'sm';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth={getMaxWidth()}
      fullScreen={fullScreen && size !== 'small'}
      scroll="paper"
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 2.5 }}>
        {children}
      </DialogContent>
      
      {footer && (
        <DialogActions sx={{ p: 2 }}>
          {footer}
        </DialogActions>
      )}
    </Dialog>
  );
}
