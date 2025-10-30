import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { Search } from '@mui/icons-material';

const TimeLogs: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Time Logs
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search time logs..."
          InputProps={{
            startAdornment: (
              <IconButton>
                <Search />
              </IconButton>
            ),
          }}
        />
      </Box>

      {/* Time Stats */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          mb: 4,
        }}
      >
        <Card elevation={1}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Total Hours
            </Typography>
            <Typography variant="h3" color="primary" gutterBottom>
              13.5h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All Time
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={1}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Time Entries
            </Typography>
            <Typography variant="h3" color="primary" gutterBottom>
              5
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Logged entries
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={1}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Avg Hours/Day
            </Typography>
            <Typography variant="h3" color="primary" gutterBottom>
              4.5h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average per working day
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Time Log Entries */}
      <Card elevation={1}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Recent Time Logs
          </Typography>

          {/* Wednesday Entry */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Wednesday, October 29, 2025
              </Typography>
              <Typography variant="h6" color="primary">
                Total: 2.5h
              </Typography>
            </Box>

            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Initial inspection and diagnostics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toyota Camry 2020 • Oil Change & Inspection
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary">
                  2.5h
                </Typography>
              </Box>
            </Card>
          </Box>

          {/* Tuesday Entry */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Tuesday, October 28, 2025
              </Typography>
              <Typography variant="h6" color="primary">
                Total: 11h
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TimeLogs;