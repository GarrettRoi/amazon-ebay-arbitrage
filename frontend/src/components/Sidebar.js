import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import InventoryIcon from '@material-ui/icons/Storage';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';
import SettingsIcon from '@material-ui/icons/Settings';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    marginTop: 64, // AppBar height
  },
  toolbar: theme.mixins.toolbar,
  link: {
    color: 'inherit',
    textDecoration: 'none',
  },
  active: {
    backgroundColor: theme.palette.action.selected,
  }
}));

const Sidebar = () => {
  const classes = useStyles();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Products', icon: <LocalOfferIcon />, path: '/products' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'System Status', icon: <SystemUpdateIcon />, path: '/system' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <div className={classes.toolbar} />
      <List>
        {menuItems.map((item, index) => (
          <Link to={item.path} className={classes.link} key={item.text}>
            <ListItem 
              button 
              selected={selectedIndex === index}
              onClick={(event) => handleListItemClick(event, index)}
              className={selectedIndex === index ? classes.active : ''}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar;
