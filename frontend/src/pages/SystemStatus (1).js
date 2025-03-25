import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import RefreshIcon from '@material-ui/icons/Refresh';
import SyncIcon from '@material-ui/icons/Sync';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: 64, // AppBar height
    marginLeft: 240, // Drawer width
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  card: {
    height: '100%',
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: theme.spacing(1),
  },
  statusOk: {
    color: theme.palette.success.main,
  },
  statusWarning: {
    color: theme.palette.warning.main,
  },
  statusError: {
    color: theme.palette.error.main,
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  progressLabel: {
    minWidth: '100px',
  },
  progressBar: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
    height: 10,
    borderRadius: 5,
  },
  progressValue: {
    minWidth: '40px',
    textAlign: 'right',
  },
  listItem: {
    borderLeft: `4px solid transparent`,
    '&.error': {
      borderLeftColor: theme.palette.error.main,
      backgroundColor: 'rgba(244, 67, 54, 0.08)',
    },
    '&.warning': {
      borderLeftColor: theme.palette.warning.main,
      backgroundColor: 'rgba(255, 152, 0, 0.08)',
    },
    '&.success': {
      borderLeftColor: theme.palette.success.main,
    },
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  statusChipOk: {
    backgroundColor: theme.palette.success.main,
    color: 'white',
  },
  statusChipWarning: {
    backgroundColor: theme.palette.warning.main,
    color: 'white',
  },
  statusChipError: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(2),
  },
}));

// Sample data for system status
const systemComponents = [
  { name: 'Amazon API Connection', status: 'OK', uptime: '99.8%', lastCheck: '2025-03-24 04:55:12' },
  { name: 'eBay API Connection', status: 'OK', uptime: '99.5%', lastCheck: '2025-03-24 04:55:10' },
  { name: 'Database', status: 'OK', uptime: '100%', lastCheck: '2025-03-24 04:55:15' },
  { name: 'Product Finder', status: 'OK', uptime: '99.9%', lastCheck: '2025-03-24 04:55:08' },
  { name: 'Price Calculator', status: 'OK', uptime: '100%', lastCheck: '2025-03-24 04:55:05' },
  { name: 'Order Fulfillment', status: 'Warning', uptime: '98.2%', lastCheck: '2025-03-24 04:55:01' },
];

// Sample data for system resources
const systemResources = [
  { name: 'CPU Usage', value: 32 },
  { name: 'Memory Usage', value: 45 },
  { name: 'Disk Space', value: 28 },
  { name: 'Network Bandwidth', value: 15 },
];

// Sample data for recent logs
const recentLogs = [
  { id: 1, timestamp: '2025-03-24 04:50:12', level: 'INFO', message: 'System backup completed successfully' },
  { id: 2, timestamp: '2025-03-24 04:45:30', level: 'WARNING', message: 'Order fulfillment process taking longer than expected' },
  { id: 3, timestamp: '2025-03-24 04:40:15', level: 'INFO', message: 'Price update completed for 247 products' },
  { id: 4, timestamp: '2025-03-24 04:35:22', level: 'INFO', message: 'New product scan initiated' },
  { id: 5, timestamp: '2025-03-24 04:30:05', level: 'ERROR', message: 'Failed to connect to eBay API - retrying' },
  { id: 6, timestamp: '2025-03-24 04:29:58', level: 'INFO', message: 'Successfully processed order #1089' },
  { id: 7, timestamp: '2025-03-24 04:25:41', level: 'INFO', message: 'System health check completed' },
  { id: 8, timestamp: '2025-03-24 04:20:33', level: 'WARNING', message: 'High CPU usage detected - 85%' },
];

// Sample data for scheduled tasks
const scheduledTasks = [
  { id: 1, name: 'Product Search', schedule: 'Every 6 hours', lastRun: '2025-03-24 00:00:12', nextRun: '2025-03-24 06:00:00', status: 'OK' },
  { id: 2, name: 'Price Update', schedule: 'Every 4 hours', lastRun: '2025-03-24 04:00:30', nextRun: '2025-03-24 08:00:00', status: 'OK' },
  { id: 3, name: 'Order Processing', schedule: 'Every 30 minutes', lastRun: '2025-03-24 04:30:15', nextRun: '2025-03-24 05:00:00', status: 'Warning' },
  { id: 4, name: 'System Backup', schedule: 'Daily at 04:00', lastRun: '2025-03-24 04:00:22', nextRun: '2025-03-25 04:00:00', status: 'OK' },
  { id: 5, name: 'Log Cleanup', schedule: 'Weekly on Sunday', lastRun: '2025-03-23 00:00:05', nextRun: '2025-03-30 00:00:00', status: 'OK' },
];

const SystemStatus = () => {
  const classes = useStyles();
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleString());

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleString());
  };

  const getStatusChipClass = (status) => {
    switch(status) {
      case 'OK': return classes.statusChipOk;
      case 'Warning': return classes.statusChipWarning;
      case 'Error': return classes.statusChipError;
      default: return '';
    }
  };

  const getStatusIcon = (level) => {
    switch(level) {
      case 'ERROR': return <ErrorIcon color="error" />;
      case 'WARNING': return <WarningIcon color="action" style={{ color: '#ff9800' }} />;
      case 'INFO': return <CheckCircleIcon color="action" style={{ color: '#4caf50' }} />;
      default: return <CheckCircleIcon color="action" style={{ color: '#4caf50' }} />;
    }
  };

  const getListItemClass = (level) => {
    switch(level) {
      case 'ERROR': return 'error';
      case 'WARNING': return 'warning';
      case 'INFO': return 'success';
      default: return '';
    }
  };

  // Calculate overall system status
  const errorCount = systemComponents.filter(comp => comp.status === 'Error').length;
  const warningCount = systemComponents.filter(comp => comp.status === 'Warning').length;
  
  let overallStatus = 'OK';
  let statusIcon = <CheckCircleIcon className={`${classes.statusIcon} ${classes.statusOk}`} />;
  
  if (errorCount > 0) {
    overallStatus = 'Error';
    statusIcon = <ErrorIcon className={`${classes.statusIcon} ${classes.statusError}`} />;
  } else if (warningCount > 0) {
    overallStatus = 'Warning';
    statusIcon = <WarningIcon className={`${classes.statusIcon} ${classes.statusWarning}`} />;
  }

  return (
    <div className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        System Status
      </Typography>

      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh Status
        </Button>
      </div>

      <Grid container spacing={3}>
        {/* Overall System Status */}
        <Grid item xs={12} md={4}>
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall System Status
              </Typography>
              <Box display="flex" flexDirection="column" alignItems="center" my={2}>
                {statusIcon}
                <Typography variant="h5" component="div">
                  {overallStatus}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last updated: {lastRefreshed}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Resources */}
        <Grid item xs={12} md={8}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              System Resources
            </Typography>
            {systemResources.map((resource) => (
              <div key={resource.name} className={classes.progressContainer}>
                <Typography variant="body2" className={classes.progressLabel}>
                  {resource.name}:
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={resource.value}
                  className={classes.progressBar}
                  color={resource.value > 80 ? "secondary" : "primary"}
                />
                <Typography variant="body2" className={classes.progressValue}>
                  {resource.value}%
                </Typography>
              </div>
            ))}
          </Paper>
        </Grid>

        {/* Component Status */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Component Status
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Uptime</TableCell>
                    <TableCell align="right">Last Check</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {systemComponents.map((component) => (
                    <TableRow key={component.name}>
                      <TableCell component="th" scope="row">
                        {component.name}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={component.status}
                          className={`${classes.chip} ${getStatusChipClass(component.status)}`}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{component.uptime}</TableCell>
                      <TableCell align="right">{component.lastCheck}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Scheduled Tasks */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Scheduled Tasks
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Next Run</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell component="th" scope="row">
                        {task.name}
                      </TableCell>
                      <TableCell>{task.schedule}</TableCell>
                      <TableCell>{task.nextRun}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={task.status}
                          className={`${classes.chip} ${getStatusChipClass(task.status)}`}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Logs */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Recent System Logs
            </Typography>
            <List>
              {recentLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <ListItem className={`${classes.listItem} ${getListItemClass(log.level)}`}>
                    <ListItemIcon>
                      {getStatusIcon(log.level)}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.message}
                      secondary={`${log.timestamp} - ${log.level}`}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                color="primary"
                startIcon={<SyncIcon />}
              >
                Load More Logs
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default SystemStatus;
