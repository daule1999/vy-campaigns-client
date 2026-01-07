import { Button as MuiButton, CircularProgress } from '@mui/material';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props 
}) {
  // Map custom variants to MUI variants
  const getVariant = () => {
    switch (variant) {
      case 'primary': return 'contained';
      case 'secondary': return 'outlined';
      case 'ghost': return 'text';
      case 'danger': return 'contained'; // We'll handle color via color prop
      default: return 'contained';
    }
  };

  // Map custom colors
  const getColor = () => {
    switch (variant) {
      case 'danger': return 'error';
      case 'secondary': return 'primary'; // Or 'inherit'
      default: return 'primary';
    }
  };

  return (
    <MuiButton
      variant={getVariant()}
      color={getColor()}
      size={size}
      disabled={disabled || loading}
      startIcon={!loading && Icon ? <Icon size={size === 'small' ? 16 : 18} /> : null}
      {...props}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        position: 'relative',
        ...props.sx
      }}
    >
      {loading && (
        <CircularProgress
          size={20}
          color="inherit"
          sx={{ position: 'absolute', left: '50%', marginLeft: '-10px' }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </MuiButton>
  );
}
