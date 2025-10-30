import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Button,
  Paper,
  TextField,
  IconButton,
} from '@mui/material';
import {
  AccessTime,
  ExitToApp,
  Search,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const TimeLogsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #FF4D00 0%, #FF7433 100%)',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTime sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Time Logs
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Track your working hours
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              to="/employee-dashboard"
              variant="outlined"
              startIcon={<ExitToApp />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Paper>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search time logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            mb: 4,
          }}
        >
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
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

          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
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

          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
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
        <Card elevation={3}>
          <CardContent sx={{ p: 3 }}>
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

              {/* Add more time entries here */}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default TimeLogsPage;