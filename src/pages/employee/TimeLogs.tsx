import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import { styled } from '@mui/system';

interface Task {
  id: string;
  title: string;
  description: string;
  vehicle: string;
  status: 'pending' | 'in-progress' | 'completed';
  startTime?: number;
  totalTime: number;
}

// Will be used in a future update for time entry history
// interface TimeEntry {
//   id: string;
//   taskName: string;
//   projectDetails: string;
//   status: 'in-progress' | 'completed';
//   duration: string;
//   date: string;
// }

const TimeLogs: React.FC = () => {
  // Shift tracking
  const [isShiftStarted, setIsShiftStarted] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<number | null>(null);
  const [shiftTimer, setShiftTimer] = useState('00:00:00');
  
  // Current task tracking
  const [currentTaskTime, setCurrentTaskTime] = useState('01:25:53');
  const [activeTask, setActiveTask] = useState<Task>({
    id: '1',
    title: 'Oil Change - Toyota Camry',
    description: 'Regular maintenance and oil change service',
    vehicle: 'Toyota Camry 2020',
    status: 'in-progress',
    startTime: Date.now() - 5153000, // 1:25:53 in milliseconds
    totalTime: 0
  });

  // Work summary
  const [workSummary] = useState({
    pending: 5,
    completed: 3,
    newRequests: 8
  });

  // Statistics
  const [stats] = useState({
    totalHours: '13.5h',
    timeEntries: 5,
    avgHoursPerDay: '4.5h'
  });

  // Format time function
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Task timer effect
  useEffect(() => {
    let timer: number;
    if (activeTask?.status === 'in-progress' && activeTask.startTime != null) {
      timer = window.setInterval(() => {
        const elapsed = Date.now() - activeTask.startTime!;
        setCurrentTaskTime(formatTime(elapsed));
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [activeTask]);

  // Shift timer effect
  useEffect(() => {
    let timer: number;
    if (isShiftStarted && shiftStartTime) {
      timer = window.setInterval(() => {
        const elapsed = Date.now() - shiftStartTime;
        setShiftTimer(formatTime(elapsed));
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [isShiftStarted, shiftStartTime]);

  const handleStartShift = () => {
    setIsShiftStarted(true);
    setShiftStartTime(Date.now());
  };

  const handleEndShift = () => {
    setIsShiftStarted(false);
    setShiftStartTime(null);
    setShiftTimer('00:00:00');
  };

  const handleResumeTask = () => {
    setActiveTask(prev => ({
      ...prev,
      status: 'in-progress',
      startTime: Date.now()
    }));
  };

  const handleStopTask = () => {
    setActiveTask(prev => {
      const newTotalTime = prev.startTime 
        ? prev.totalTime + (Date.now() - prev.startTime)
        : prev.totalTime;
      return {
        ...prev,
        status: 'completed',
        startTime: undefined,
        totalTime: newTotalTime
      };
    });
    setCurrentTaskTime('00:00:00');
  };

  return (
    <Box>
      {/* Log Work Hours */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Log Work Hours</Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Hours: {shiftTimer}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleStartShift}
                disabled={isShiftStarted}
                sx={{ bgcolor: '#FF4D00', '&:hover': { bgcolor: '#cc3d00' } }}
              >
                Start Timer
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleEndShift}
                disabled={!isShiftStarted}
              >
                End Shift
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

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

      {/* Current Task */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6">{activeTask.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {activeTask.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vehicle: {activeTask.vehicle}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ color: '#FF4D00', fontWeight: 'bold' }}>
                {currentTaskTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Task Time
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleResumeTask}
              disabled={activeTask.status === 'in-progress'}
            >
              Resume Task
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStopTask}
              disabled={activeTask.status !== 'in-progress'}
            >
              Stop Task
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Work Summary */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)'
          },
          gap: 3,
          mb: 4
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              Pending Tasks
            </Typography>
            <Typography variant="h4">
              {workSummary.pending}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              Completed Today
            </Typography>
            <Typography variant="h4">
              {workSummary.completed}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              New Requests
            </Typography>
            <Typography variant="h4">
              {workSummary.newRequests}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Statistics */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Today's Statistics
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)'
              },
              gap: 3
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
              <Typography variant="h5">
                {stats.totalHours}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Time Entries
              </Typography>
              <Typography variant="h5">
                {stats.timeEntries}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Avg. Hours/Day
              </Typography>
              <Typography variant="h5">
                {stats.avgHoursPerDay}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TimeLogs;