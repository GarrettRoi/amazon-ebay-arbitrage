import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import SaveIcon from '@material-ui/icons/Save';
import SecurityIcon from '@material-ui/icons/Security';
import NotificationsIcon from '@material-ui/icons/Notifications';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import SyncIcon from '@material-ui/icons/Sync';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginTop: 64, // AppBar height
    marginLeft: 240, // Drawer width
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    marginBottom: theme.spacing(2),
    minWidth: '100%',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
  saveButton: {
    marginLeft: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  tabPanel: {
    padding: theme.spacing(3, 0),
  },
  formSection: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
  },
  apiKeyField: {
    fontFamily: 'monospace',
  },
  card: {
    marginBottom: theme.spacing(2),
  },
  tabIcon: {
    marginRight: theme.spacing(1),
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className={props.classes.tabPanel}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // API Settings
  const [amazonApiKey, setAmazonApiKey] = useState('AMZN-API-XXXX-XXXX-XXXX-XXXX');
  const [amazonSecretKey, setAmazonSecretKey] = useState('amzn-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [ebayApiKey, setEbayApiKey] = useState('EBAY-API-XXXX-XXXX-XXXX-XXXX');
  const [ebaySecretKey, setEbaySecretKey] = useState('ebay-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  
  // General Settings
  const [defaultProfitMargin, setDefaultProfitMargin] = useState(15);
  const [minimumProfitAmount, setMinimumProfitAmount] = useState(10);
  const [autoListProducts, setAutoListProducts] = useState(true);
  const [autoFulfillOrders, setAutoFulfillOrders] = useState(true);
  const [scanFrequency, setScanFrequency] = useState('6');
  const [priceUpdateFrequency, setPriceUpdateFrequency] = useState('4');
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailAddress, setEmailAddress] = useState('user@example.com');
  const [notifyOnSale, setNotifyOnSale] = useState(true);
  const [notifyOnLowStock, setNotifyOnLowStock] = useState(true);
  const [notifyOnError, setNotifyOnError] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  
  // Account Settings
  const [username, setUsername] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = () => {
    setSnackbarMessage('Settings saved successfully!');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Settings
      </Typography>

      <Paper className={classes.paper}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<SettingsIcon className={classes.tabIcon} />} label="General" />
          <Tab icon={<SecurityIcon className={classes.tabIcon} />} label="API Keys" />
          <Tab icon={<NotificationsIcon className={classes.tabIcon} />} label="Notifications" />
          <Tab icon={<AccountCircleIcon className={classes.tabIcon} />} label="Account" />
        </Tabs>

        {/* General Settings Tab */}
        <TabPanel value={tabValue} index={0} classes={classes}>
          <div className={classes.formSection}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Business Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Default Profit Margin (%)"
                  type="number"
                  value={defaultProfitMargin}
                  onChange={(e) => setDefaultProfitMargin(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Minimum Profit Amount ($)"
                  type="number"
                  value={minimumProfitAmount}
                  onChange={(e) => setMinimumProfitAmount(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>
          </div>

          <div className={classes.formSection}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Automation Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoListProducts}
                        onChange={(e) => setAutoListProducts(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Automatically list new profitable products"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoFulfillOrders}
                        onChange={(e) => setAutoFulfillOrders(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Automatically fulfill orders"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel id="scan-frequency-label">Product Scan Frequency</InputLabel>
                  <Select
                    labelId="scan-frequency-label"
                    value={scanFrequency}
                    onChange={(e) => setScanFrequency(e.target.value)}
                    label="Product Scan Frequency"
                  >
                    <MenuItem value="1">Every hour</MenuItem>
                    <MenuItem value="3">Every 3 hours</MenuItem>
                    <MenuItem value="6">Every 6 hours</MenuItem>
                    <MenuItem value="12">Every 12 hours</MenuItem>
                    <MenuItem value="24">Once daily</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel id="price-update-frequency-label">Price Update Frequency</InputLabel>
                  <Select
                    labelId="price-update-frequency-label"
                    value={priceUpdateFrequency}
                    onChange={(e) => setPriceUpdateFrequency(e.target.value)}
                    label="Price Update Frequency"
                  >
                    <MenuItem value="1">Every hour</MenuItem>
                    <MenuItem value="2">Every 2 hours</MenuItem>
                    <MenuItem value="4">Every 4 hours</MenuItem>
                    <MenuItem value="6">Every 6 hours</MenuItem>
                    <MenuItem value="12">Every 12 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </div>

          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </div>
        </TabPanel>

        {/* API Keys Tab */}
        <TabPanel value={tabValue} index={1} classes={classes}>
          <div className={classes.formSection}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Amazon API Settings
            </Typography>
            <Card className={classes.card}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Amazon API Key"
                      value={amazonApiKey}
                      onChange={(e) => setAmazonApiKey(e.target.value)}
                      fullWidth
                      variant="outlined"
                      className={classes.apiKeyField}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Amazon Secret Key"
                      value={amazonSecretKey}
                      onChange={(e) => setAmazonSecretKey(e.target.value)}
                      fullWidth
                      variant="outlined"
                      type="password"
                      className={classes.apiKeyField}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </div>

          <div className={classes.formSection}>
            <Typography variant="h6" className={classes.sectionTitle}>
              eBay API Settings
            </Typography>
            <Card className={classes.card}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="eBay API Key"
                      value={ebayApiKey}
                      onChange={(e) => setEbayApiKey(e.target.value)}
                      fullWidth
                      variant="outlined"
                      className={classes.apiKeyField}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="eBay Secret Key"
                      value={ebaySecretKey}
                      onChange={(e) => setEbaySecretKey(e.target.value)}
                      fullWidth
                      variant="outlined"
                      type="password"
                      className={classes.apiKeyField}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </div>

          <div className={classes.buttonContainer}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SyncIcon />}
              style={{ marginRight: '8px' }}
            >
              Test Connections
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save API Keys
            </Button>
          </div>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2} classes={classes}>
          <div className={classes.formSection}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Email Notifications
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable email notifications"
                />
                <TextField
                  label="Email Address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  fullWidth
                  variant="outlined"
                  disabled={!emailNotifications}
                  style={{ marginTop: '16px' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifyOnSale}
                        onChange={(e) => setNotifyOnSale(e.target.checked)}
                        color="primary"
                        disabled={!emailNotifications}
                      />
                    }
                    label="Notify on new sales"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifyOnLowStock}
                        onChange={(e) => setNotifyOnLowStock(e.target.checked)}
                        color="primary"
                        disabled={!emailNotifications}
                      />
                    }
                    label="Notify on low stock"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifyOnError}
                        onChange={(e) => setNotifyOnError(e.target.checked)}
                        color="primary"
                        disabled={!emailNotifications}
                      />
                    }
                    label="Notify on system errors"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </div>

          <div className={classes.formSection}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Notification Thresholds
            </Typography>
            <Grid container spacing={3}>
         <response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>