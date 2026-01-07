import { TextField, InputAdornment } from '@mui/material';

export default function Input({ 
  label, 
  error, 
  icon: Icon,
  type = 'text',
  ...props 
}) {
  const isTextArea = type === 'textarea';

  return (
    <TextField
      label={label}
      type={isTextArea ? 'text' : type}
      multiline={isTextArea}
      rows={isTextArea ? 4 : 1}
      error={!!error}
      helperText={error}
      fullWidth
      variant="outlined"
      InputProps={{
        startAdornment: Icon ? (
          <InputAdornment position="start">
            <Icon size={18} />
          </InputAdornment>
        ) : null,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
        }
      }}
      {...props}
    />
  );
}
