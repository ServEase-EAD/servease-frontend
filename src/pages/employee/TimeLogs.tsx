import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const TimeLogs: React.FC = () => {
  const [timeFilter, setTimeFilter] = React.useState('All Time');
  // anchor for filter menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  // Top card states
  const [isShiftStarted, setIsShiftStarted] = React.useState(false);
  const [isLogging, setIsLogging] = React.useState(true);
  const [loggingSeconds, setLoggingSeconds] = React.useState(1 * 3600 + 25 * 60 + 42); // default 01:25:42

  // All time log entries
  // Add a status to entries so we can show In Progress vs Completed
  const allTimeEntries = [
    {
      date: 'Wednesday, October 29, 2025',
      entriesCount: 1,
      totalHours: '2.5h',
      entries: [
        {
          description: 'Initial inspection and diagnostics',
          vehicle: 'Toyota Camry 2020',
          service: 'Oil Change & Inspection',
          duration: '2.5h',
          status: 'inprogress',
        },
      ],
    },
    {
      date: 'Tuesday, October 28, 2025',
      entriesCount: 2,
      totalHours: '5.5h',
      entries: [
        {
          description: 'Main service work',
          vehicle: 'Toyota Camry 2020',
          service: 'Oil Change & Inspection',
            duration: '3h',
            status: 'completed',
        },
        {
          description: 'Initial inspection and diagnostics',
          vehicle: 'Honda Accord 2019',
          service: 'Brake System Repair',
            duration: '2.5h',
            status: 'inprogress',
        },
      ],
    },
    {
      date: 'Monday, October 27, 2025',
      entriesCount: 2,
      totalHours: '5.5h',
      entries: [
        {
          description: 'Main service work',
          vehicle: 'Honda Accord 2019',
          service: 'Brake System Repair',
            duration: '3h',
            status: 'completed',
        },
        {
          description: 'Initial inspection and diagnostics',
          vehicle: 'Ford F-150 2021',
          service: 'Engine Diagnostic',
            duration: '2.5h',
            status: 'completed',
        },
      ],
    },
  ];

  // Filter time entries based on selected filter
  const getFilteredEntries = () => {
    switch (timeFilter) {
      case 'Today':
        return allTimeEntries.filter(entry => entry.date === 'Wednesday, October 29, 2025');
      case 'This Week':
        // Show entries from this week (Oct 27-29)
        return allTimeEntries;
      case 'This Month':
        // Show all entries from October
        return allTimeEntries;
      case 'Last Month':
        // Would show entries from previous month (none in this case)
        return [];
      case 'All Time':
      default:
        return allTimeEntries;
    }
  };

  const timeEntries = getFilteredEntries();

  // Calculate summary statistics based on filtered entries
  const calculateStats = () => {
    const totalEntries = timeEntries.reduce((sum, day) => sum + day.entriesCount, 0);
    const totalHours = timeEntries.reduce((sum, day) => {
      const hours = parseFloat(day.totalHours);
      return sum + hours;
    }, 0);
    const avgHours = timeEntries.length > 0 ? (totalHours / timeEntries.length).toFixed(1) : '0';

    return {
      totalHours: `${totalHours.toFixed(1)}h`,
      totalEntries: totalEntries.toString(),
      avgHours: `${avgHours}h`,
    };
  };

  const stats = calculateStats();

  // timer for Time Logging card
  React.useEffect(() => {
    let t: number | undefined;
    if (isLogging) {
      t = window.setInterval(() => setLoggingSeconds(s => s + 1), 1000);
    }
    return () => {
      if (t) window.clearInterval(t);
    };
  }, [isLogging]);

  const formatTime = (s: number) => {
    const hh = Math.floor(s / 3600).toString().padStart(2, '0');
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const summaryStats = [
    {
      label: 'Total Hours',
      value: stats.totalHours,
      subtitle: timeFilter,
      icon: <ClockIcon sx={{ fontSize: 40, color: 'text.secondary' }} />,
    },
    {
      label: 'Time Entries',
      value: stats.totalEntries,
      subtitle: 'Logged entries',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'text.secondary' }} />,
    },
    {
      label: 'Avg Hours/Day',
      value: stats.avgHours,
      subtitle: 'Average per working day',
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'text.secondary' }} />,
    },
  ];

  // Dialog state for viewing an entry in detail
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogEntry, setDialogEntry] = React.useState<any>(null);

  const handleView = (entry: any, dayDate: string) => {
    setDialogEntry({ ...entry, date: dayDate });
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>

      {/* Top header with search and filter */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Filter button opens a menu to pick the time filter (looks like the attached screenshot) */}
        <Box>
          <IconButton
            size="small"
            aria-label="open filter"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1, bgcolor: 'background.paper' }}
          >
            <FilterListIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { setTimeFilter('All Time'); setAnchorEl(null); }}>All Time</MenuItem>
            <MenuItem onClick={() => { setTimeFilter('Today'); setAnchorEl(null); }}>Today</MenuItem>
            <MenuItem onClick={() => { setTimeFilter('This Week'); setAnchorEl(null); }}>This Week</MenuItem>
            <MenuItem onClick={() => { setTimeFilter('This Month'); setAnchorEl(null); }}>This Month</MenuItem>
            <MenuItem onClick={() => { setTimeFilter('Last Month'); setAnchorEl(null); }}>Last Month</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Top action cards (Log Work Hours & Time Logging) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
        {/* Log Work Hours card */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Log Work Hours</Typography>
              <Typography variant="body2" color="text.secondary">Today's Hours: <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>4h 30m</span></Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant={isShiftStarted ? 'outlined' : 'outlined'}
                size="small"
                sx={{ textTransform: 'none' }}
                onClick={() => {
                  // Toggle shift state and also start/pause the logging timer
                  setIsShiftStarted(prev => {
                    const next = !prev;
                    setIsLogging(next); // when shift starts, resume logging; when stops, pause
                    return next;
                  });
                }}
              >
                {isShiftStarted ? 'Stop Timer' : 'Start Timer'}
              </Button>
              <Button
                variant="contained"
                size="small"
                color={isShiftStarted ? 'secondary' : 'primary'}
                sx={{ textTransform: 'none' }}
                onClick={() => {
                  // Ending the shift should pause any active logging timer
                  setIsShiftStarted(false);
                  setIsLogging(false);
                }}
              >
                End Shift
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Time Logging card */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Time Logging</Typography>
              <Typography variant="body2" color="text.secondary">Current Task<br/><strong>Oil Change - Toyota Camry</strong></Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Typography sx={{ color: 'var(--primary-color)', fontWeight: 700 }}>{formatTime(loggingSeconds)}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={isLogging ? 'outlined' : 'contained'}
                  size="small"
                  sx={{ textTransform: 'none' }}
                  onClick={() => setIsLogging(v => !v)}
                >
                  {isLogging ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ textTransform: 'none' }}
                  onClick={() => { setIsLogging(false); setLoggingSeconds(0); }}
                >
                  Stop
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Summary Statistics (larger numbers) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        {summaryStats.map((stat, index) => (
          <Card key={index} sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: 36, fontWeight: '700', color: 'primary.main', mt: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.subtitle}
                  </Typography>
                </Box>
                <Box>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Time Entries (original per-day card layout) */}
      {timeEntries.length === 0 ? (
        <Card sx={{ bgcolor: 'background.paper', mb: 3 }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No time logs found for the selected period.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        timeEntries.map((dayEntry, dayIndex) => (
          <Card key={dayIndex} sx={{ bgcolor: 'background.paper', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Date Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {dayEntry.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayEntry.entriesCount} entries
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {dayEntry.totalHours}
                  </Typography>
                </Box>
              </Box>

              {/* Time Entry Details */}
              {dayEntry.entries.map((entry, entryIndex) => (
                <Box
                  key={entryIndex}
                  sx={{
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    p: 2.5,
                    mb: entryIndex < dayEntry.entries.length - 1 ? 2 : 0,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                        {entry.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.vehicle} • {entry.service}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: 60, textAlign: 'right' }}>
                        {entry.duration}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* Status chip: either In Progress or Completed */}
                        <Chip
                          label={entry.status === 'completed' ? 'Completed' : 'In Progress'}
                          size="small"
                          sx={{
                            bgcolor: entry.status === 'completed' ? '#2e7d32' : '#fb8c00',
                            color: 'white',
                            fontWeight: 700,
                          }}
                        />
                        <Button size="small" variant="text" sx={{ color: '#FF5722', textTransform: 'none' }} onClick={() => handleView(entry, dayEntry.date)}>View</Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      {/* Dialog for viewing a time entry in detail */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Time Log Details</DialogTitle>
        <DialogContent>
          {dialogEntry ? (
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>{dialogEntry.description}</Typography>
              <Typography variant="body2" color="text.secondary">{dialogEntry.vehicle} • {dialogEntry.service}</Typography>
              <Typography sx={{ mt: 2 }}>Duration: <strong>{dialogEntry.duration}</strong></Typography>
              <Typography>Date: {dialogEntry.date}</Typography>
              <Typography>Status: {dialogEntry.status === 'completed' ? 'Completed' : 'In Progress'}</Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeLogs;
