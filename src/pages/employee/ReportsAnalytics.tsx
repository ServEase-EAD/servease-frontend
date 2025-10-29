import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  styled,
} from '@mui/material';

const StyledGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(3),
}));
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const ReportsAnalytics: React.FC = () => {
  // Service Performance Data
  const serviceData = [
    { name: 'AC Repair', completed: 12, pending: 5 },
    { name: 'Plumbing', completed: 8, pending: 3 },
    { name: 'Electrical', completed: 15, pending: 7 },
    { name: 'Cleaning', completed: 10, pending: 4 },
  ];

  // Task Status Distribution Data
  const statusData = [
    { name: 'Completed', value: 45, color: '#00C49F' },
    { name: 'In Progress', value: 30, color: '#0088FE' },
    { name: 'Pending', value: 25, color: '#FFBB28' },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Tasks', value: '100', color: 'text.primary' },
          { label: 'Completed', value: '45', color: '#00C49F' },
          { label: 'In Progress', value: '30', color: '#0088FE' },
          { label: 'Pending', value: '25', color: '#FFBB28' }
        ].map((stat, index) => (
          <Grid component="div" item xs={6} sm={3} key={index}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Service Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Performance
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={serviceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#0088FE" name="Completed" />
                    <Bar dataKey="pending" fill="#FFBB28" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Status Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Status Distribution
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsAnalytics;