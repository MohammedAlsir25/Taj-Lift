import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, ClipboardCheck, Wrench, BarChart2, DollarSign } from 'lucide-react';
import Dock, { DockItemData } from './Dock';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/lead', label: 'Follow', icon: Users },
    { to: '/inspection', label: 'PM/AMC', icon: ClipboardCheck },
    { to: '/map', label: 'Breakdown', icon: Wrench },
    { to: '/finance', label: 'Finance', icon: DollarSign },
    { to: '/tracker', label: 'More', icon: BarChart2 },
  ];

  const dockItems: DockItemData[] = navItems.map((item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.to;
    return {
      label: item.label,
      icon: <Icon />,
      onClick: () => navigate(item.to),
      isActive: isActive,
    };
  });

  return <Dock items={dockItems} />;
}

