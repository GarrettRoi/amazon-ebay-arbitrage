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
import AddIcon from '@material-ui/icons/Add';
import RefreshIcon from '@material-ui/icons/Refresh';
import Chip from '@material-ui/core/Chip';

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
  statusProfit: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  statusLoss: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  statusNeutral: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  summaryCard: {
    minWidth: 275,
    marginBottom: theme.spacing(2),
  },
}));

// Sample data for products
const createData = (id, name, amazonPrice, ebayPrice, profit, margin, status, category) => {
  return { id, name, amazonPrice, ebayPrice, profit, margin, status, category };
};

const rows = [
  createData(1, 'Samsung Galaxy S21', 699.99, 849.99, 95.00, 13.6, 'Listed', 'Electronics'),
  createData(2, 'Apple AirPods Pro', 189.99, 229.99, 20.00, 10.5, 'Listed', 'Electronics'),
  createData(3, 'Instant Pot Duo', 79.95, 109.99, 15.04, 18.8, 'Listed', 'Home & Kitchen'),
  createData(4, 'Kindle Paperwhite', 129.99, 159.99, 15.00, 11.5, 'Listed', 'Electronics'),
  createData(5, 'LEGO Star Wars Set', 119.99, 149.99, 15.00, 12.5, 'Not Listed', 'Toys'),
  createData(6, 'Bose QuietComfort Earbuds', 199.99, 249.99, 25.00, 12.5, 'Listed', 'Electronics'),
  createData(7, 'Ninja Air Fryer', 89.99, 119.99, 15.00, 16.7, 'Listed', 'Home & Kitchen'),
  createData(8, 'Sony WH-1000XM4', 299.99, 349.99, 25.00, 8.3, 'Listed', 'Electronics'),
  createData(9, 'Cuisinart Coffee Maker', 69.99, 99.99, 15.00, 21.4, 'Not Listed', 'Home & Kitchen'),
  createData(10, 'Fitbit Charge 5', 149.99, 179.99, 15.00, 10.0, 'Listed', 'Electronics'),
  createData(11, 'Dyson V11 Vacuum', 499.99, 599.99, 50.00, 10.0, 'Listed', 'Home & Kitchen'),
  createData(12, 'Nintendo Switch', 299.99, 349.99, 25.00, 8.3, 'Listed', 'Electronics'),
  createData(13, 'Keurig K-Elite', 129.99, 169.99, 20.00, 15.4, 'Listed', 'Home & Kitchen'),
  createData(14, 'Anker PowerCore', 39.99, 59.99, 10.00, 25.0, 'Listed', 'Electronics'),
  createData(15, 'Roomba i3+', 399.99, 499.99, 50.00, 12.5, 'Not Listed', 'Home & Kitchen'),
];

const Products = () => {
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
    row.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalProducts = rows.length;
  const listedProducts = rows.filter(row => row.status === 'Listed').length;
  const averageProfit = rows.reduce((sum, row) => sum + row.profit, 0) / rows.length;
  const averageMargin = rows.reduce((sum, row) => sum + row.margin, 0) / rows.length;

  return (
    <div className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Product Management
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
                {totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Listed Products
              </Typography>
              <Typography variant="h5" component="h2">
                {listedProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Profit
              </Typography>
              <Typography variant="h5" component="h2">
                ${averageProfit.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Margin
              </Typography>
              <Typography variant="h5" component="h2">
                {averageMargin.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div className={classes.buttonGroup}>
        <div className={classes.searchContainer}>
          <TextField
            className={classes.searchInput}
            label="Search Products"
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
            Refresh Prices
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
          >
            Add Product
          </Button>
        </div>
      </div>

      <Paper className={classes.paper}>
        <TableContainer className={classes.tableContainer}>
          <Table
            className={classes.table}
            stickyHeader
            aria-label="products table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Amazon Price ($)</TableCell>
                <TableCell align="right">eBay Price ($)</TableCell>
                <TableCell align="right">Profit ($)</TableCell>
                <TableCell align="right">Margin (%)</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Category</TableCell>
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
                    <TableCell align="right">{row.amazonPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.ebayPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.profit.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.margin.toFixed(1)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.status}
                        className={classes.chip}
                        color={row.status === 'Listed' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell align="center">
                      <Button size="small" color="primary">
                        Edit
                      </Button>
                      <Button size="small" color="secondary">
                        {row.status === 'Listed' ? 'Unlist' : 'List'}
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

export default Products;
