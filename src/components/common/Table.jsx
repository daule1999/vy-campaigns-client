import { 
  Table as MuiTable, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';

export default function Table({ columns, data, loading, emptyMessage = 'No data found' }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5, bgcolor: 'background.card', borderRadius: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <MuiTable>
        <TableHead sx={{ bgcolor: 'background.tertiary' }}>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell 
                key={i} 
                style={{ width: col.width }}
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.8125rem'
                }}
              >
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                <Typography>{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow 
                key={row.id || rowIndex}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}
