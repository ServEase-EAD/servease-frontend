import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { timelogService } from '../../services/timelogService';
import type { TimeLog, TimeLogStats, TimeFilterOption } from '../../types';

interface GroupedTimeLogs {
  [date: string]: TimeLog[];
}

const TimeLogs: React.FC = () => {
  // Filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all_time');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Data states
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [stats, setStats] = useState<TimeLogStats | null>(null);
  const [todayStats, setTodayStats] = useState<TimeLogStats | null>(null);
  const [activeTimeLog, setActiveTimeLog] = useState<TimeLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Timer state for active log
  const [currentSeconds, setCurrentSeconds] = useState(0);

  // Fetch data when component mounts or filter changes
  useEffect(() => {
    fetchTimeLogsData();
  }, [timeFilter]);

  // Update timer for active log
  useEffect(() => {
    let interval: number | undefined;
    
    if (activeTimeLog && activeTimeLog.status === 'inprogress') {
      // Capture values at the time of setting up the interval
      const startTimeMs = new Date(activeTimeLog.start_time).getTime();
      const accumulatedDuration = activeTimeLog.duration_seconds || 0;
      
      console.log('🚀 Timer started/resumed:', {
        log_id: activeTimeLog.log_id,
        accumulatedDuration,
        accumulatedFormatted: formatTime(accumulatedDuration),
        start_time: activeTimeLog.start_time,
        startTimeMs,
        currentTime: Date.now(),
        localStartTime: new Date(activeTimeLog.start_time).toLocaleString(),
      });
      
      // Initial update - calculate elapsed time since last resume
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTimeMs) / 1000);
      const totalSeconds = accumulatedDuration + elapsedSeconds;
      console.log('⏱️ Initial timer value:', { 
        elapsedSeconds, 
        elapsedFormatted: formatTime(elapsedSeconds),
        totalSeconds,
        totalFormatted: formatTime(totalSeconds)
      });
      setCurrentSeconds(totalSeconds);
      
      // For in-progress logs: show accumulated duration + current session time
      interval = window.setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTimeMs) / 1000);
        const totalSeconds = accumulatedDuration + elapsedSeconds;
        setCurrentSeconds(totalSeconds);
      }, 1000);
    } else if (activeTimeLog && activeTimeLog.status === 'paused') {
      // For paused logs: show only accumulated duration (frozen)
      const pausedDuration = activeTimeLog.duration_seconds || 0;
      console.log('⏸️ Timer paused at:', { 
        pausedDuration, 
        pausedFormatted: formatTime(pausedDuration),
        log_id: activeTimeLog.log_id 
      });
      setCurrentSeconds(pausedDuration);
    } else {
      // No active log
      console.log('⏹️ Timer stopped - no active log');
      setCurrentSeconds(0);
    }
    
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [activeTimeLog]);

  const fetchTimeLogsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all time logs, stats for selected filter, and today's stats
      const [logsData, statsData, todayStatsData] = await Promise.all([
        timelogService.getAllTimeLogs(),
        timelogService.getTimeLogStats(timeFilter),
        timelogService.getTimeLogStats('today'), // Always fetch today's stats separately
      ]);
      
      console.log('Fetched logs:', logsData);
      console.log('Fetched stats:', statsData);
      console.log('Fetched today stats:', todayStatsData);
      
      // Ensure logsData is an array
      const logsArray = Array.isArray(logsData) ? logsData : [];
      setTimeLogs(logsArray);
      setStats(statsData);
      setTodayStats(todayStatsData);
      
      // Find active time log (in progress or paused)
      // Priority: in progress > paused
      const inProgressLog = logsArray.find((log: TimeLog) => log.status === 'inprogress');
      const pausedLog = logsArray.find((log: TimeLog) => log.status === 'paused');
      const activeLog = inProgressLog || pausedLog;
      
      console.log('Active log found:', activeLog);
      if (activeLog) {
        console.log('Active log details:', {
          log_id: activeLog.log_id,
          status: activeLog.status,
          duration_seconds: activeLog.duration_seconds,
          start_time: activeLog.start_time,
          description: activeLog.description,
        });
      }
      setActiveTimeLog(activeLog || null);
      
    } catch (err: any) {
      console.error('Error fetching time logs:', err);
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.response?.data?.detail
        || err.message 
        || 'Failed to load time logs';
      setError(errorMessage);
      setTimeLogs([]);
      setStats(null);
      setTodayStats(null);
      setActiveTimeLog(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Group time logs by date
  const groupTimeLogsByDate = (): GroupedTimeLogs => {
    const grouped: GroupedTimeLogs = {};
    
    // Ensure timeLogs is an array
    if (!Array.isArray(timeLogs)) {
      console.warn('timeLogs is not an array:', timeLogs);
      return grouped;
    }
    
    // Filter by search query and exclude in-progress/paused logs (they show in active task card)
    const filteredLogs = timeLogs.filter(log => {
      // Exclude in-progress and paused logs from historical view
      if (log.status === 'inprogress' || log.status === 'paused') {
        return false;
      }
      
      // Apply search filter
      return (
        log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.service?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    
    // Group by date
    filteredLogs.forEach(log => {
      const dateKey = log.log_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(log);
    });
    
    return grouped;
  };

  const groupedLogs = groupTimeLogsByDate();
  
  // Calculate totals for each day
  const getDayTotals = (logs: TimeLog[]) => {
    const totalSeconds = logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      count: logs.length,
      hours: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    };
  };

  // Dialog state for viewing an entry in detail
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);

  const handleViewLog = (log: TimeLog) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const handleStatusChange = async (logId: string, newStatus: 'inprogress' | 'paused' | 'completed') => {
    try {
      setError(null);
      let updatedLog: TimeLog;
      
      console.log(`📡 Sending ${newStatus} request for log:`, logId);
      
      if (newStatus === 'inprogress') {
        updatedLog = await timelogService.startTimeLog(logId);
        console.log('✅ Start/Resume response:', {
          log_id: updatedLog.log_id,
          status: updatedLog.status,
          duration_seconds: updatedLog.duration_seconds,
          start_time: updatedLog.start_time,
        });
      } else if (newStatus === 'paused') {
        updatedLog = await timelogService.pauseTimeLog(logId);
        console.log('✅ Pause response:', {
          log_id: updatedLog.log_id,
          status: updatedLog.status,
          duration_seconds: updatedLog.duration_seconds,
          start_time: updatedLog.start_time,
        });
      } else {
        updatedLog = await timelogService.completeTimeLog(logId);
        console.log('✅ Complete response:', {
          log_id: updatedLog.log_id,
          status: updatedLog.status,
          duration_seconds: updatedLog.duration_seconds,
          end_time: updatedLog.end_time,
        });
      }
      
      console.log('🔄 Refreshing time logs data...');
      
      // Refresh data to get latest state
      await fetchTimeLogsData();
    } catch (err: any) {
      console.error('Error updating status:', err);
      
      // Extract detailed error message
      let errorMessage = 'Failed to update time log status';
      
      if (err.response) {
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.status === 500) {
          errorMessage = 'Server error: Please check backend logs. The pause/complete function may have a bug.';
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid request: ' + JSON.stringify(err.response.data);
        }
      } else if (err.request) {
        errorMessage = 'Network error: Cannot reach server';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      
      // Refresh data anyway to show current state
      await fetchTimeLogsData();
    }
  };

  const handleFixDurations = async () => {
    try {
      setError(null);
      const result = await timelogService.fixDurations();
      
      if (result.fixed_count > 0) {
        setError(null);
        // Show success message temporarily using error state (we can use success alert)
        await fetchTimeLogsData(); // Refresh data
        alert(`✅ Successfully fixed ${result.fixed_count} time log(s)!`);
      } else {
        alert('ℹ️ No time logs needed fixing. All durations are correct!');
      }
    } catch (err: any) {
      console.error('Error fixing durations:', err);
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Failed to fix durations';
      setError(errorMessage);
    }
  };

  const formatFilterLabel = (filter: TimeFilterOption): string => {
    const labels: Record<TimeFilterOption, string> = {
      'all_time': 'All Time',
      'today': 'Today',
      'this_week': 'This Week',
      'this_month': 'This Month',
      'last_month': 'Last Month',
    };
    return labels[filter];
  };

  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Top header with search and filter */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
            size="small"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={handleFixDurations}
          sx={{ 
            textTransform: 'none',
            minWidth: 'auto',
            whiteSpace: 'nowrap',
            display: { xs: 'none', sm: 'inline-flex' }
          }}
        >
          🔧 Fix Times
        </Button>

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
            <MenuItem onClick={() => { setTimeFilter('all_time'); setAnchorEl(null); }}>All Time</MenuItem>
            <MenuItem onClick={() => { setTimeFilter('today'); setAnchorEl(null); }}>Today</MenuItem>
            <MenuItem onClick={() => { setTimeFilter('this_week'); setAnchorEl(null); }}>This Week</MenuItem>
            <MenuItem onClick={() => { setTimeFilter('this_month'); setAnchorEl(null); }}>This Month</MenuItem>
            <MenuItem onClick={() => { setTimeFilter('last_month'); setAnchorEl(null); }}>Last Month</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Current Active Task Card */}
      {activeTimeLog && (
        <Card sx={{ borderRadius: 2, mb: 3, bgcolor: '#e3f2fd', border: '2px solid #2196f3' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
                  {activeTimeLog.status === 'inprogress' ? '🔥 Active Task' : '⏸️ Paused Task'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {activeTimeLog.description || 'Untitled Task'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    🚗 {activeTimeLog.vehicle || 'No vehicle'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    🔧 {activeTimeLog.service || 'No service'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📋 {activeTimeLog.task_type === 'appointment' ? 'Appointment' : 'Project Task'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Typography sx={{ fontSize: 40, fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
                  {formatTime(currentSeconds)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Time Tracked
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              {activeTimeLog.status === 'inprogress' ? (
                <>
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<span>⏸️</span>}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                    onClick={() => handleStatusChange(activeTimeLog.log_id, 'paused')}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="medium"
                    startIcon={<span>✓</span>}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                    onClick={() => handleStatusChange(activeTimeLog.log_id, 'completed')}
                  >
                    Complete Task
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    startIcon={<span>▶️</span>}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                    onClick={() => handleStatusChange(activeTimeLog.log_id, 'inprogress')}
                  >
                    Resume
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    size="medium"
                    startIcon={<span>✓</span>}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                    onClick={() => handleStatusChange(activeTimeLog.log_id, 'completed')}
                  >
                    Complete Task
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
                  Total Hours
                </Typography>
                <Typography sx={{ fontSize: 36, fontWeight: '700', color: 'primary.main', mt: 0.5 }}>
                  {stats?.total_hours || '0.0h'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFilterLabel(timeFilter)}
                </Typography>
              </Box>
              <ClockIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
                  Time Entries
                </Typography>
                <Typography sx={{ fontSize: 36, fontWeight: '700', color: 'primary.main', mt: 0.5 }}>
                  {stats?.total_entries || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Logged entries
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
                  Avg Hours/Day
                </Typography>
                <Typography sx={{ fontSize: 36, fontWeight: '700', color: 'primary.main', mt: 0.5 }}>
                  {stats?.avg_hours_per_day || '0.0h'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Over {stats?.days_worked || 0} days
                </Typography>
              </Box>
              <ScheduleIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '2px solid #4caf50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
                  Today's Hours
                </Typography>
                <Typography sx={{ fontSize: 36, fontWeight: '700', color: 'success.main', mt: 0.5 }}>
                  {todayStats?.total_hours || '0.0h'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
              <ClockIcon sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Section Header for Completed Tasks */}
      <Box sx={{ mb: 2, mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          📜 Completed Time Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Historical record of finished tasks
        </Typography>
      </Box>

      {/* Time Entries Grouped by Date */}
      {Object.keys(groupedLogs).length === 0 ? (
        <Card sx={{ bgcolor: 'background.paper', mb: 3 }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {activeTimeLog 
                ? "No completed time logs yet. Complete your active task to see it here."
                : "No time logs found for the selected period."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedLogs)
          .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
          .map(([date, logs]) => {
            const dayTotals = getDayTotals(logs);
            return (
              <Card key={date} sx={{ bgcolor: 'background.paper', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Date Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {formatDateLabel(date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dayTotals.count} entries
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Total
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {dayTotals.hours}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Time Log Entries */}
                  {logs.map((log, index) => {
                    // Debug log
                    if (log.duration_seconds === 0 || !log.duration_seconds) {
                      console.log('⚠️ Log with 0 duration:', {
                        log_id: log.log_id,
                        description: log.description,
                        duration_seconds: log.duration_seconds,
                        duration: log.duration,
                        status: log.status,
                        start_time: log.start_time,
                        end_time: log.end_time,
                      });
                    }
                    
                    return (
                    <Box
                      key={log.log_id}
                      sx={{
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        p: 2.5,
                        mb: index < logs.length - 1 ? 2 : 0,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {log.description || 'Untitled Task'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {log.vehicle || 'No vehicle'} • {log.service || 'No service'}
                          </Typography>
                          {log.start_time && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {new Date(log.start_time).toLocaleTimeString()} 
                              {log.end_time && ` - ${new Date(log.end_time).toLocaleTimeString()}`}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: 80, textAlign: 'right', fontFamily: 'monospace' }}>
                            {(() => {
                              const totalSeconds = log.duration_seconds || 0;
                              const hours = Math.floor(totalSeconds / 3600);
                              const minutes = Math.floor((totalSeconds % 3600) / 60);
                              const seconds = totalSeconds % 60;
                              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            })()}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip
                              label={log.status === 'completed' ? 'Completed' : log.status === 'inprogress' ? 'In Progress' : 'Paused'}
                              size="small"
                              sx={{
                                bgcolor: log.status === 'completed' ? '#2e7d32' : log.status === 'inprogress' ? '#fb8c00' : '#757575',
                                color: 'white',
                                fontWeight: 700,
                              }}
                            />
                            <Button
                              size="small"
                              variant="text"
                              sx={{ color: '#FF5722', textTransform: 'none' }}
                              onClick={() => handleViewLog(log)}
                            >
                              View
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
      )}

      {/* Dialog for viewing a time log in detail */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Time Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>{selectedLog.description || 'Untitled Task'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedLog.vehicle || 'No vehicle'} • {selectedLog.service || 'No service'}
              </Typography>
              <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
                <strong>Duration:</strong> {(() => {
                  const totalSeconds = selectedLog.duration_seconds || 0;
                  const hours = Math.floor(totalSeconds / 3600);
                  const minutes = Math.floor((totalSeconds % 3600) / 60);
                  const seconds = totalSeconds % 60;
                  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                })()}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Date:</strong> {formatDateLabel(selectedLog.log_date)}
              </Typography>
              <Typography sx={{ mb: 1 }}>
                <strong>Status:</strong> {selectedLog.status === 'completed' ? 'Completed' : selectedLog.status === 'inprogress' ? 'In Progress' : 'Paused'}
              </Typography>
              {selectedLog.start_time && (
                <Typography sx={{ mb: 1 }}>
                  <strong>Start Time:</strong> {new Date(selectedLog.start_time).toLocaleString()}
                </Typography>
              )}
              {selectedLog.end_time && (
                <Typography sx={{ mb: 1 }}>
                  <strong>End Time:</strong> {new Date(selectedLog.end_time).toLocaleString()}
                </Typography>
              )}
              <Typography sx={{ mb: 1 }}>
                <strong>Task Type:</strong> {selectedLog.task_type || 'N/A'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeLogs;
