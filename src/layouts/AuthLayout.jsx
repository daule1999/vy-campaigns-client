import React from 'react';
import { Box } from '@mui/material';

const AuthLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5F5F5',
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;
