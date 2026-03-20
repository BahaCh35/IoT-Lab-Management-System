import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Divider, List, ListItem, ListItemText, IconButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { maintenanceService } from '../services/maintenanceService';
import { MaintenanceRequest } from '../types';

const TechnicianDashboardPage: React.FC = () => {
  const [allTasks, setAllTasks] = useState<MaintenanceRequest[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceRequest | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [notes, setNotes] = useState('');
  const [partsUsedInput, setPartsUsedInput] = useState('');
  const [partsUsed, setPartsUsed] = useState<string[]>([]);
  const [searchEquipment, setSearchEquipment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const reload = () => {
    setAllTasks(maintenanceService.getMaintenanceRequests());
  };

  useEffect(() => { reload(); }, []);

  const handleOpenUpdateDialog = (task: MaintenanceRequest) => {
    setSelectedTask(task);
    setStatusUpdate(task.status);
    setNotes(task.notes);
    setPartsUsed([...task.partsUsed]);
    setPartsUsedInput('');
    setOpenDialog(true);
  };

  const handleAddPart = () => {
    if (partsUsedInput.trim()) {
      setPartsUsed([...partsUsed, partsUsedInput.trim()]);
      setPartsUsedInput('');
    }
  };

  const handleRemovePart = (index: number) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;
    maintenanceService.updateTaskStatus(selectedTask.id, statusUpdate, notes);
    const updated = maintenanceService.getMaintenanceRequestById(selectedTask.id);
    if (updated) {
      updated.partsUsed = partsUsed;
    }
    reload();
    setOpenDialog(false);
    setPartsUsed([]);
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':   return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low':    return '#3b82f6';
      default:       return '#6b7280';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':       return '#f59e0b';
      case 'in-progress':   return '#3b82f6';
      case 'waiting-parts': return '#ec4899';
      case 'completed':     return '#10b981';
      case 'cannot-repair': return '#ef4444';
      default:              return '#6b7280';
    }
  };

  const getStatusLabel = (status: string): string =>
    status.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Only active tasks on dashboard; completed go to History
  const activeTasks = allTasks.filter((t) => t.status !== 'completed' && t.status !== 'cannot-repair');

  const displayTasks = activeTasks.filter((task) => {
    if (searchEquipment && !task.equipmentName.toLowerCase().includes(searchEquipment.toLowerCase())) return false;
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterPriority && task.priority !== filterPriority) return false;
    return true;
  });

  const completedTasks    = allTasks.filter((t) => t.status === 'completed' || t.status === 'cannot-repair');

  // Calendar
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const getTasksForDate = (day: number): MaintenanceRequest[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allTasks.filter((t) => t.reportedDate.startsWith(dateStr));
  };

  const stats = maintenanceService.getStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <DashboardIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Technician Dashboard
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[
          { label: 'Total Tasks',   value: stats.total,        color: '#1a73e8', bg: '#f0f4ff', icon: <BuildIcon sx={{ color: 'white', fontSize: 20 }} /> },
          { label: 'Pending',       value: stats.pending,      color: '#f59e0b', bg: '#fff3e0', icon: <PendingActionsIcon sx={{ color: 'white', fontSize: 20 }} /> },
          { label: 'In Progress',   value: stats.inProgress,   color: '#3b82f6', bg: '#e3f2fd', icon: <BuildIcon sx={{ color: 'white', fontSize: 20 }} /> },
          { label: 'Waiting Parts', value: stats.waitingParts, color: '#ec4899', bg: '#f3e5f5', icon: <PendingActionsIcon sx={{ color: 'white', fontSize: 20 }} /> },
        ].map((s) => (
          <Card key={s.label} sx={{ backgroundColor: s.bg }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    {s.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: s.color, mt: 0.5 }}>
                    {s.value}
                  </Typography>
                </Box>
                <Box sx={{ width: 36, height: 36, backgroundColor: s.color, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search equipment..."
          value={searchEquipment}
          onChange={(e) => setSearchEquipment(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#6b7280' }} /> }}
          sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="waiting-parts">Waiting Parts</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={filterPriority} label="Priority" onChange={(e) => setFilterPriority(e.target.value)}>
            <MenuItem value="">All Priorities</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
        {(searchEquipment || filterStatus || filterPriority) && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => { setSearchEquipment(''); setFilterStatus(''); setFilterPriority(''); }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Clear
          </Button>
        )}
        {(searchEquipment || filterStatus || filterPriority) && (
          <Typography variant="caption" sx={{ color: '#6b7280', alignSelf: 'center' }}>
            {displayTasks.length} of {activeTasks.length} tasks
          </Typography>
        )}
      </Box>

      {/* Tasks Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AssignmentIcon sx={{ color: '#1a73e8' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Maintenance Tasks ({activeTasks.length})
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Problem</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reported</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayTasks.length > 0 ? (
                  displayTasks.map((task) => (
                    <TableRow key={task.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{task.equipmentName}</Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>{task.location.room}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {task.problemDescription.length > 45
                            ? task.problemDescription.substring(0, 45) + '...'
                            : task.problemDescription}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority.toUpperCase()}
                          size="small"
                          sx={{ backgroundColor: getPriorityColor(task.priority), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(task.status)}
                          size="small"
                          sx={{ backgroundColor: getStatusColor(task.status) + '22', color: getStatusColor(task.status), fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{new Date(task.reportedDate).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenUpdateDialog(task)}
                          sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' }, textTransform: 'none' }}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 44, color: '#d1d5db', display: 'block', mx: 'auto', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No tasks match the current filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {completedTasks.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#6b7280' }}>
              {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''} — view them in Maintenance History.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Calendar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Maintenance Schedule — {monthNames[currentMonth]} {currentYear}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2 }}>
            {dayNames.map((day) => (
              <Box key={day} sx={{ p: 1, textAlign: 'center', fontWeight: 700, color: '#6b7280', fontSize: '0.85rem', borderBottom: '2px solid #e5e7eb' }}>
                {day}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <Box key={`empty-${idx}`} sx={{ minHeight: 90 }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const tasksOnDay = getTasksForDate(day);
              const hasTasks = tasksOnDay.length > 0;
              return (
                <Box
                  key={day}
                  sx={{
                    p: 1, minHeight: 90, border: '1px solid #e5e7eb', borderRadius: 1,
                    backgroundColor: hasTasks ? '#f0f7ff' : '#f9fafb',
                    transition: 'all 0.2s',
                    '&:hover': hasTasks ? { backgroundColor: '#e0f2fe', borderColor: '#0ea5e9' } : {},
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{day}</Typography>
                  {hasTasks && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {tasksOnDay.slice(0, 2).map((task) => (
                        <Chip
                          key={task.id}
                          label={task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                          size="small"
                          sx={{
                            height: 18, fontSize: '0.65rem',
                            backgroundColor: task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fff3e0' : '#dbeafe',
                            color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#b45309' : '#1e40af',
                          }}
                        />
                      ))}
                      {tasksOnDay.length > 2 && (
                        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.65rem' }}>
                          +{tasksOnDay.length - 2} more
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#6b7280' }}>
            Color indicates task priority. Red = High, Orange = Medium, Blue = Low.
          </Typography>
        </CardContent>
      </Card>

      {/* Update Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Update Task — {selectedTask?.equipmentName}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedTask && (
            <>
              <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>PROBLEM</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedTask.problemDescription}</Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 0.5 }}>
                  Reported: {new Date(selectedTask.reportedDate).toLocaleDateString()} · {selectedTask.location.building}, {selectedTask.location.room}
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusUpdate} label="Status" onChange={(e) => setStatusUpdate(e.target.value)}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="waiting-parts">Waiting for Parts</MenuItem>
                  <MenuItem value="completed">Completed — Fixed</MenuItem>
                  <MenuItem value="cannot-repair">Cannot Repair</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Work Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Describe what was done, findings, next steps..."
              />

              <Divider />

              {/* Parts Used */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Parts Used</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="Part name"
                    value={partsUsedInput}
                    onChange={(e) => setPartsUsedInput(e.target.value)}
                    placeholder="e.g., Display Cable 12V"
                    size="small"
                    fullWidth
                    onKeyPress={(e) => { if (e.key === 'Enter') handleAddPart(); }}
                  />
                  <Button onClick={handleAddPart} variant="contained" size="small" startIcon={<AddIcon />} sx={{ whiteSpace: 'nowrap' }}>
                    Add
                  </Button>
                </Box>
                {partsUsed.length > 0 && (
                  <List dense sx={{ backgroundColor: '#f5f5f5', borderRadius: 1, p: 1 }}>
                    {partsUsed.map((part, idx) => (
                      <ListItem
                        key={idx}
                        secondaryAction={
                          <IconButton edge="end" size="small" onClick={() => handleRemovePart(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={`• ${part}`} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>

            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateTask}
            variant="contained"
            sx={{ backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' }, textTransform: 'none' }}
          >
            Save Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TechnicianDashboardPage;
