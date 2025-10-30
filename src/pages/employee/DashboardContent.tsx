import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  People as CustomerIcon,
  Build as ServiceIcon,
  Assessment as AnalyticsIcon,
} from '@mui/icons-material';

const DashboardContent: React.FC = () => {
  const summaryCards = [
    {
      title: 'Total Tasks',
      value: '15',
      description: '8 tasks pending',
      icon: <TaskIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Customers',
      value: '48',
      description: '5 new this month',
      icon: <CustomerIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Services',
      value: '24',
      description: '12 active services',
      icon: <ServiceIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Performance',
      value: '92%',
      description: 'Customer satisfaction',
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
  ];

  const recentActivity = [
    { time: '2 hours ago', action: 'Completed AC repair task', status: 'success' },
    { time: '4 hours ago', action: 'New service request assigned', status: 'info' },
    { time: 'Yesterday', action: 'Updated customer details', status: 'default' },
    { time: 'Yesterday', action: 'Submitted service report', status: 'success' },
  ];

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {card.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentActivity.map((activity, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="body1">{activity.action}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: activity.status === 'success' ? 'success.light' : 'info.light',
                    color: activity.status === 'success' ? 'success.main' : 'info.main',
                  }}
                >
                  {activity.status === 'success' ? 'Completed' : 'In Progress'}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardContent;