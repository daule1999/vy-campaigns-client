import { Chip } from '@mui/material';

export default function Badge({ children, variant = 'default', ...props }) {
  // Map custom variants to MUI colors/styles
  const getColor = () => {
    switch (variant) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': case 'danger': return 'error';
      case 'info': return 'info';
      case 'secondary': return 'secondary';
      case 'primary': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Chip 
      label={children} 
      color={getColor()} 
      size="small" 
      variant={variant === 'default' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 500, ...props.sx }} 
      {...props}
    />
  );
}
