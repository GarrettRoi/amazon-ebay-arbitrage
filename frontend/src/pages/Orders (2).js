import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: 64, // AppBar height
    marginLeft: 240, // Drawer width
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  tableContainer: {
    maxHeight: 600,
  },
  title: {
    flex: '1 1 100%',
    marginBottom: theme.spacing(2),
  },
  searchContainer: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  searchInput: {
    marginRight: theme.spacing(2),
    flex: 1,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  statusPending: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  statusProcessing: {
    backgroundColor: '#2196f3',
    color: 'white',
  },
  statusShipped: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  statusCompleted: {
    backgroundColor: '#9c27b0',
    color: 'white',
  },
  statusCancelled: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  summaryCard: {
    minWidth: 275,
    marginBottom: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

// Sample data for orders
const createData = (id, customer, date, items, total, status, tracking) => {
  return { id, customer, date, items, total, status, tracking };
};

const rows = [
  createData('ORD-1001', 'John Smith', '2025-03-20', 2, 129.98, 'Pending', ''),
  createData('ORD-1002', 'Emily Johnson', '2025-03-19', 1, 349.99, 'Processing', ''),
  createData('ORD-1003', 'Michael Brown', '2025-03-18', 3, 89.97, 'Shipped', '9405511899223197428490'),
  createData('ORD-1004', 'Sarah Davis', '2025-03-17', 1, 599.99, 'Completed', '9405511899223197428483'),
  createData('ORD-1005', 'David Wilson', '2025-03-16', 2, 159.98, 'Completed', '9405511899223197428476'),
  createData('ORD-1006', 'Jennifer Taylor', '2025-03-15', 1, 179.99, 'Cancelled', ''),
  createData('ORD-1007', 'Robert Martinez', '2025-03-14', 4, 219.96, 'Shipped', '9405511899223197428469'),
  createData('ORD-1008', 'Lisa Anderson', '2025-03-13', 1, 249.99, 'Completed', '9405511899223197428452'),
  createData('ORD-1009', 'James Thomas', '2025-03-12', 2, 299.98, 'Completed', '9405511899223197428445'),
  createData('ORD-1010', 'Jessica White', '2025-03-11', 3, 149.97, 'Shipped', '9405511899223197428438'),
  createData('ORD-1011', 'Daniel Harris', '2025-03-10', 1, 99.99, 'Completed', '9405511899223197428421'),
  createData('ORD-1012', 'Amanda Martin', '2025-03-09', 2, 399.98, 'Completed', '9405511899223197428414'),
  createData('ORD-1013', 'Kevin Thompson', '2025-03-08', 1, 59.99, 'Completed', '9405511899223197428407'),
  createData('ORD-1014', 'Michelle Garcia', '2025-03-07', 3, 329.97, 'Completed', '9405511899223197428391'),
  createData('ORD-1015', 'Christopher Robinson', '2025-03-06', 2, 279.98, 'Completed', '9405511899223197428384'),
];

const Orders = () => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const filteredRows = rows.filter((row) => {
    const matchesSearch = 
      row.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalOrders = rows.length;
  const pendingOrders = rows.filter(row => row.status === 'Pending').length;
  const processingOrders = rows.filter(row => row.status === 'Processing').length;
  const shippedOrders = rows.filter(row => row.status === 'Shipped').length;

  const getStatusChipClass = (status) => {
    switch(status) {
      case 'Pending': return classes.statusPending;
      case 'Processing': return classes.statusProcessing;
      case 'Shipped': return classes.statusShipped;
      case 'Completed': return classes.statusCompleted;
      case 'Cancelled': return classes.statusCancelled;
      default: return '';
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Order Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h5" component="h2">
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Orders
              </Typography>
              <Typography variant="h5" component="h2">
                {pendingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Processing Orders
              </Typography>
              <Typography variant="h5" component="h2">
                {processingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Shipped Orders
              </Typography>
              <Typography variant="h5" component="h2">
                {shippedOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div className={classes.buttonGroup}>
        <div className={classes.searchContainer}>
          <TextField
            className={classes.searchInput}
            label="Search Orders"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
          <FormControl variant="outlined" size="small" className={classes.formControl}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
          >
            Refresh Orders
          </Button>
        </div>
      </div>

      <Paper className={classes.paper}>
        <TableContainer className={classes.tableContainer}>
          <Table
            className={classes.table}
            stickyHeader
            aria-label="orders table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total ($)</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Tracking</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell align="right">{row.items}</TableCell>
                    <TableCell align="right">${row.total.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.status}
                        className={`${classes.chip} ${getStatusChipClass(row.status)}`}
                      />
                    </TableCell>
                    <TableCell>{row.tracking}</TableCell>
                    <TableCell align="center">
                      <Button size="small" color="primary">
                        View
                      </Button>
                      {row.status === 'Pending' && (
                        <Button size="small" color="secondary">
                          Process
                        </Button>
                      )}
                      {row.status === 'Processing' && (
                        <Button size="small" color="secondary">
                          Ship
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default Orders;
