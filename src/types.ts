export interface Lead {
  id: string;
  name: string;
  firmName: string;
  siteName: string;
  leadDate: string;
  assignedTo: string;
  status: 'success' | 'warning' | 'info' | 'neutral';
  statusLabel: string;
  phone: string;
  email: string;
  requirements: string;
}

export interface InspectionRow {
  id: string;
  componentName: string;
  status: 'good' | 'help' | 'bad' | null;
  description: string;
}

export interface TimelineNode {
  id: string;
  status: 'active' | 'pending' | 'future';
  title: string;
  date: string;
  description: string;
}

export interface Technician {
  id: string;
  name: string;
  status: 'Moving' | 'Active' | 'Idle' | 'Offline';
  batteryLevel: number;
  phone: string;
  avatarUrl: string;
  distance: string;
  recentTasks: Array<{
    time: string;
    icon: string;
    text: string;
  }>;
}
