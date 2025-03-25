import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Line, Bar, Pie } from 'react-chartjs-2';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: 64, // AppBar height
    marginLeft: 240, // Drawer width
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  card: {
    minWidth: 275,
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  chartContainer: {
    height: 300,
    marginBottom: theme.spacing(2),
  },
}));

// Sample data for charts
const salesData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Sales',
      data: [12, 19, 3, 5, 2, 3, 9],
      fill: false,
      backgroundColor: 'rgb(75, 192, 192)',
      borderColor: 'rgba(75, 192, 192, 0.2)',
    },
  ],
};

const profitData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Profit',
      data: [5, 9, 1.5, 2, 1, 1.5, 4],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1,
    },
  ],
};

const categoryData = {
  labels: ['Electronics', 'Home & Kitchen', 'Toys', 'Books', 'Clothing'],
  datasets: [
    {
      label: 'Categories',
      data: [12, 19, 3, 5, 2],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const Home = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h5" component="h2">
                247
              </Typography>
              <Typography className={classes.pos} color="textSecondary">
                Active Listings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h5" component="h2">
                38
              </Typography>
              <Typography className={classes.pos} color="textSecondary">
                This Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Revenue
              </Typography>
              <Typography variant="h5" component="h2">
                $5,240
              </Typography>
              <Typography className={classes.pos} color="textSecondary">
                This Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Profit
              </Typography>
              <Typography variant="h5" component="h2">
                $1,872
              </Typography>
              <Typography className={classes.pos} color="textSecondary">
                This Month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <div className={classes.chartContainer}>
              <Line data={salesData} options={{ maintainAspectRatio: false }} />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Profit Margin
            </Typography>
            <div className={classes.chartContainer}>
              <Bar data={profitData} options={{ maintainAspectRatio: false }} />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Product Categories
            </Typography>
            <div className={classes.chartContainer}>
              <Pie data={categoryData} options={{ maintainAspectRatio: false }} />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <div style={{ textAlign: 'left', padding: '10px' }}>
              <Typography variant="body2" gutterBottom>• New order received - Order #1089</Typography>
              <Typography variant="body2" gutterBottom>• Price change detected for Samsung Galaxy S21</Typography>
              <Typography variant="body2" gutterBottom>• 5 new products added to inventory</Typography>
              <Typography variant="body2" gutterBottom>• Order #1088 fulfilled successfully</Typography>
              <Typography variant="body2" gutterBottom>• System backup completed</Typography>
              <Typography variant="body2" gutterBottom>• API connection status: Healthy</Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
