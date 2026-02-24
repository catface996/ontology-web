/**
 * Shared mapping from lucide icon name → React component.
 * Used by ClassEditorPage (picker) and ClassesPage (list display).
 */
import {
  Boxes,
  // Building / Facility
  Factory, Building2, Warehouse, Home, Store, Hospital, School, Church, Landmark,
  // People / Org
  User, Users, UserCheck, UserPlus, Contact, PersonStanding, Briefcase, BadgeCheck,
  // Transport / Logistics
  Truck, Car, Plane, Ship, Train, Package, Box, Container, ShoppingCart,
  // Food / Dining
  Utensils, ChefHat, Apple, Beef, Egg, Milk, Wheat, Cookie, Cake, Coffee, Wine, Pizza,
  // Industry / Production
  Wrench, Settings, Cog, Hammer, HardHat, Zap, Gauge, Thermometer, FlaskConical, Atom,
  // Document / Data
  File, FileText, Folder, Database, Server, Cloud, Clipboard, BookOpen, Notebook,
  // Time / Schedule
  Calendar, Clock, Timer, AlarmClock, Hourglass,
  // Status / Mark
  CheckCircle, AlertTriangle, CircleAlert, Star, Heart, Flag, Tag, Bookmark,
  // Communication
  Mail, Phone, MessageCircle, Bell, Megaphone,
  // Nature / Location
  MapPin, Globe, Mountain, TreePine, Sun, Moon, Droplet,
  // Tech
  Cpu, Monitor, Smartphone, Wifi, Bluetooth, Code, Terminal,
  // Other
  Link, Share2, GitBranch, Layers, Grid3x3, List, Shield, Lock, Key, Eye,
  Network,
} from 'lucide-react';
import type { FC } from 'react';

type IconComponent = FC<{ size?: number; color?: string }>;

/** Map from kebab-case icon name to lucide-react component */
export const CLASS_ICON_MAP: Record<string, IconComponent> = {
  'boxes': Boxes,
  // Building / Facility
  'factory': Factory, 'building-2': Building2, 'warehouse': Warehouse,
  'home': Home, 'store': Store, 'hospital': Hospital,
  'school': School, 'church': Church, 'landmark': Landmark,
  // People / Org
  'user': User, 'users': Users, 'user-check': UserCheck,
  'user-plus': UserPlus, 'contact': Contact, 'person-standing': PersonStanding,
  'briefcase': Briefcase, 'badge-check': BadgeCheck,
  // Transport / Logistics
  'truck': Truck, 'car': Car, 'plane': Plane, 'ship': Ship,
  'train': Train, 'package': Package, 'box': Box,
  'container': Container, 'shopping-cart': ShoppingCart,
  // Food / Dining
  'utensils': Utensils, 'chef-hat': ChefHat, 'apple': Apple,
  'beef': Beef, 'egg': Egg, 'milk': Milk, 'wheat': Wheat,
  'cookie': Cookie, 'cake': Cake, 'coffee': Coffee, 'wine': Wine, 'pizza': Pizza,
  // Industry / Production
  'wrench': Wrench, 'settings': Settings, 'cog': Cog,
  'hammer': Hammer, 'hard-hat': HardHat, 'zap': Zap,
  'gauge': Gauge, 'thermometer': Thermometer, 'flask-conical': FlaskConical, 'atom': Atom,
  // Document / Data
  'file': File, 'file-text': FileText, 'folder': Folder,
  'database': Database, 'server': Server, 'cloud': Cloud,
  'clipboard': Clipboard, 'book-open': BookOpen, 'notebook': Notebook,
  // Time / Schedule
  'calendar': Calendar, 'clock': Clock, 'timer': Timer,
  'alarm-clock': AlarmClock, 'hourglass': Hourglass,
  // Status / Mark
  'check-circle': CheckCircle, 'alert-triangle': AlertTriangle, 'circle-alert': CircleAlert,
  'star': Star, 'heart': Heart, 'flag': Flag, 'tag': Tag, 'bookmark': Bookmark,
  // Communication
  'mail': Mail, 'phone': Phone, 'message-circle': MessageCircle,
  'bell': Bell, 'megaphone': Megaphone,
  // Nature / Location
  'map-pin': MapPin, 'globe': Globe, 'mountain': Mountain,
  'tree-pine': TreePine, 'sun': Sun, 'moon': Moon, 'droplet': Droplet,
  // Tech
  'cpu': Cpu, 'monitor': Monitor, 'smartphone': Smartphone,
  'wifi': Wifi, 'bluetooth': Bluetooth, 'code': Code, 'terminal': Terminal,
  // Other
  'link': Link, 'share-2': Share2, 'git-branch': GitBranch,
  'layers': Layers, 'grid-3x3': Grid3x3, 'list': List,
  'shield': Shield, 'lock': Lock, 'key': Key, 'eye': Eye,
  'network': Network,
};

/** Default icon component when no icon is set or name not found */
export const DEFAULT_CLASS_ICON = Boxes;

/** Default color when no color is set */
export const DEFAULT_CLASS_COLOR = 'var(--primary-color)';

/** Resolve an icon name to a component, falling back to default */
export function resolveClassIcon(iconName: string | null | undefined): IconComponent {
  if (!iconName) return DEFAULT_CLASS_ICON;
  return CLASS_ICON_MAP[iconName] ?? DEFAULT_CLASS_ICON;
}
