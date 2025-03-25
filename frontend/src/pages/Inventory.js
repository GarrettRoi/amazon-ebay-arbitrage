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
import AddIcon from '@material-ui/icons/Add';
import Chip from '@material-ui/core/Chip';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';

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
  statusLow: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  statusMedium: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  statusHigh: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  summaryCard: {
    minWidth: 275,
    marginBottom: theme.spacing(2),
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  progressLabel: {
    marginLeft: theme.spacing(1),
    minWidth: '40px',
  },
}));

// Sample data for inventory
const createData = (id, name, amazonSku, ebayId, quantity, price, stockLevel, reorderPoint) => {
  return { id, name, amazonSku, ebayId, quantity, price, stockLevel, reorderPoint };
};

const rows = [
  createData(1, 'Samsung Galaxy S21', 'AMZN-SG21-BLK', 'EB-SG21-001', 15, 699.99, 75, 5),
  createData(2, 'Apple AirPods Pro', 'AMZN-APP-WHT', 'EB-APP-001', 8, 189.99, 40, 5),
  createData(3, 'Instant Pot Duo', 'AMZN-IPD-6QT', 'EB-IPD-001', 12, 79.95, 60, 4),
  createData(4, 'Kindle Paperwhite', 'AMZN-KPW-8GB', 'EB-KPW-001', 20, 129.99, 100, 5),
  createData(5, 'LEGO Star Wars Set', 'AMZN-LSW-75192', 'EB-LSW-001', 3, 119.99, 15, 2),
  createData(6, 'Bose QuietComfort Earbuds', 'AMZN-BQC-BLK', 'EB-BQC-001', 6, 199.99, 30, 3),
  createData(7, 'Ninja Air Fryer', 'AMZN-NAF-4QT', 'EB-NAF-001', 9, 89.99, 45, 4),
  createData(8, 'Sony WH-1000XM4', 'AMZN-SWH-BLK', 'EB-SWH-001', 7, 299.99, 35, 3),
  createData(9, 'Cuisinart Coffee Maker', 'AMZN-CCM-12C', 'EB-CCM-001', 4, 69.99, 20, 3),
  createData(10, 'Fitbit Charge 5', 'AMZN-FC5-BLK', 'EB-FC5-001', 11, 149.99, 55, 4),
  createData(11, 'Dyson V11 Vacuum', 'AMZN-DV11-CRD', 'EB-DV11-001', 2, 499.99, 10, 2),
  createData(12, 'Nintendo Switch', 'AMZN-NS-32GB', 'EB-NS-001', 5, 299.99, 25, 3),
  createData(13, 'Keurig K-Elite', 'AMZN-KKE-SLV', 'EB-KKE-001', 8, 129.99, 40, 4),
  createData(14, 'Anker PowerCore', 'AMZN-APC-20K', 'EB-APC-001', 25, 39.99, 125, 10),
  createData(15, 'Roomba i3+', 'AMZN-RI3-GRY', 'EB-RI3-001', 3, 399.99, 15, 2),
];

const Inventory = () => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRows = rows.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.amazonSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.ebayId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalItems = rows.length;
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const lowStockItems = rows.filter(row => row.stockLevel < 30).length;
  const inventoryValue = rows.reduce((sum, row) => sum + (row.price * row.quantity), 0);

  const getStockLevelChip = (stockLevel) => {
    let className = '';
    let label = '';
    
    if (stockLevel < 30) {
      className = classes.statusLow;
      label = 'Low';
    } else if (stockLevel < 70) {
      className = classes.statusMedium;
      label = 'Medium';
    } else {
      className = classes.statusHigh;
      label = 'High';
    }
    
    return (
      <Chip
        label={label}
        className={`${classes.chip} ${className}`}
      />
    );
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Inventory Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h5" component="h2">
                {totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Quantity
              </Typography>
              <Typography variant="h5" component="h2">
                {totalQuantity}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h5" component="h2">
                {lowStockItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inventory Value
              </Typography>
              <Typography variant="h5" component="h2">
                ${inventoryValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div className={classes.buttonGroup}>
        <div className={classes.searchContainer}>
          <TextField
            className={classes.searchInput}
            label="Search Inventory"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            style={{ marginRight: '10px' }}
          >
            Refresh Inventory
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
          >
            Add Item
          </Button>
        </div>
      </div>

      <Paper className={classes.paper}>
        <TableContainer className={classes.tableContainer}>
          <Table
            className={classes.table}
            stickyHeader
            aria-label="inventory table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Amazon SKU</TableCell>
                <TableCell>eBay ID</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price ($)</TableCell>
                <TableCell align="center">Stock Level</TableCell>
                <TableCell align="center">Stock Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.amazonSku}</TableCell>
                    <TableCell>{row.ebayId}</TableCell>
                    <TableCell align="right">{row.quantity}</TableCell>
                    <TableCell align="right">${row.price.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Box className={classes.progressContainer}>
                        <Box width="100%">
                          <LinearProgress 
                            variant="determinate" 
                            value={row.stockLevel} 
                            className={classes.progressBar}
                            color={row.stockLevel < 30 ? "secondary" : "primary"}
                          />
                        </Box>
                        <Box className={classes.progressLabel}>
                          {row.stockLevel}%
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {getStockLevelChip(row.stockLevel)}
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" color="primary">
                        Edit
                      </Button>
                      <Button size="small" color="secondary">
                        Reorder
                      </Button>
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

export default Inventory;
