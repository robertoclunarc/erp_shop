import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  //Box,
  Typography,
  Divider,  
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  PointOfSale as CashIcon,
  Inventory as InventoryIcon,
  ShoppingCart as SaleIcon,
  LocalShipping as PurchaseIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon, ManageAccounts} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: [1, 2, 3] },
  { path: '/users', label: 'Usuarios', icon: PeopleIcon, roles: [1] },
  { path: '/branches', label: 'Sucursales', icon: StoreIcon, roles: [1] },
  { label: 'Caja', icon: CashIcon, roles: [1, 2], children: [
    { path: '/cash/register', label: 'Caja Diaria' },
    { path: '/cash/movements', label: 'Movimientos' },
  ]},
  { label: 'Productos', icon: InventoryIcon, roles: [1, 2, 3], children: [
    { path: '/products', label: 'Productos' },
    { path: '/products/categories', label: 'Categorías' },
    { path: '/products/stock', label: 'Inventario' },
  ]},
  { label: 'Servicios', icon: ManageAccounts, roles: [1, 2, 3], path: '/services' },
  { label: 'Ventas', icon: SaleIcon, roles: [1, 2, 3], children: [
    { path: '/sales', label: 'Historial' },
    { path: '/sales/new', label: 'Nueva Venta' },
  ]},
  { label: 'Compras', icon: PurchaseIcon, roles: [1, 2], children: [
    { path: '/purchases', label: 'Historial' },
    { path: '/purchases/new', label: 'Nueva Compra' },
  ]},
  //{ path: '/customers', label: 'Clientes', icon: PeopleIcon, roles: [1, 2, 3] },
  { label: 'Reportes', icon: ReportIcon, roles: [1, 2], children: [
    { path: '/reports/sales', label: 'Ventas' },
    //{ path: '/reports/products', label: 'Productos' },
    //{ path: '/reports/cash', label: 'Caja' },
    { path: '/reports/sales-filtered', label: 'Ventas con Filtros' },
    { path: '/reports/sales-range', label: 'Ventas por Rango' },
    { path: '/reports/inventory', label: 'Inventario' },
    { path: '/reports/cash-register', label: 'Cajas' },
  ]},
  { path: '/settings', label: 'Configuración', icon: SettingsIcon, roles: [1] },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'temporary';
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const handleToggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary') onClose();
  };

  const filteredMenu = menuItems.filter(item => 
    user && item.roles.includes(user.role_id)
  );

  const drawerContent = (
    <>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Shop ERP
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {filteredMenu.map((item) => {
          if (item.children) {
            return (
              <React.Fragment key={item.label}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleToggleSubmenu(item.label)}>
                    <ListItemIcon>{<item.icon />}</ListItemIcon>
                    <ListItemText primary={item.label} />
                    {openSubmenus[item.label] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openSubmenus[item.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        sx={{ pl: 4 }}
                        selected={location.pathname === child.path}
                        onClick={() => handleNavigate(child.path)}
                      >
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path!)}
              >
                <ListItemIcon>{<item.icon />}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box' },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};