declare module 'lucide-react' {
  import { ComponentType } from 'react';
  
  export interface IconProps {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
    className?: string;
    [key: string]: any;
  }
  
  // Define the icon components used in the application
  export const BookOpen: ComponentType<IconProps>;
  export const Award: ComponentType<IconProps>;
  export const FileText: ComponentType<IconProps>;
  export const Clock: ComponentType<IconProps>;
  export const User: ComponentType<IconProps>;
  export const Users: ComponentType<IconProps>;
  export const Calendar: ComponentType<IconProps>;
  export const Mail: ComponentType<IconProps>;
  export const Phone: ComponentType<IconProps>;
  export const ChevronLeft: ComponentType<IconProps>;
  export const ChevronRight: ComponentType<IconProps>;
  export const MoreHorizontal: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  export const Circle: ComponentType<IconProps>;
  export const ChevronDown: ComponentType<IconProps>;
  export const ChevronUp: ComponentType<IconProps>;
  export const ArrowLeft: ComponentType<IconProps>;
  export const ArrowRight: ComponentType<IconProps>;
  export const Dot: ComponentType<IconProps>;
  export const DollarSign: ComponentType<IconProps>;
  export const CircleDollarSign: ComponentType<IconProps>;
  export const UserPlus: ComponentType<IconProps>;
  export const PlusCircle: ComponentType<IconProps>;
  export const CircleUserPlus: ComponentType<IconProps>;
  export const Menu: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
  export const LayoutDashboard: ComponentType<IconProps>;
  export const LogOut: ComponentType<IconProps>;
  export const Key: ComponentType<IconProps>;
  export const ImageIcon: ComponentType<IconProps>;
  export const RefreshCw: ComponentType<IconProps>;
  export const CreditCard: ComponentType<IconProps>;
  
  // Search and other utility icons
  export const Search: ComponentType<IconProps>;
  export const Eye: ComponentType<IconProps>;
  export const EyeOff: ComponentType<IconProps>;
  export const RefreshCcw: ComponentType<IconProps>;
  export const Trash: ComponentType<IconProps>;
  export const Trash2: ComponentType<IconProps>;
  export const Pencil: ComponentType<IconProps>;
} 