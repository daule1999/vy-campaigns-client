import { Card as MuiCard, CardContent, Box, Typography } from '@mui/material';

export default function Card({ children, className = '', ...props }) {
  return (
    <MuiCard {...props}>
      {children}
    </MuiCard>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <Box sx={{ p: 2.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className={className}>
      {typeof children === 'string' ? (
        <Typography variant="h6">{children}</Typography>
      ) : (
        children
      )}
    </Box>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <CardContent className={className} sx={{ '&:last-child': { pb: 2.5 } }}>
      {children}
    </CardContent>
  );
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }} className={className}>
      {children}
    </Box>
  );
};
