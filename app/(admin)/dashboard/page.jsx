"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ChevronDown, 
  Package, Truck, CheckCircle, CircleDot, MapPin, Clock,
  XCircle, RotateCcw, Eye, X, User, Phone, Calendar, DollarSign,
  PhoneCall, PhoneOff, Check, Monitor, Smartphone, Globe, Cpu,
  Share2, Zap, LayoutTemplate, Info, ShieldCheck
} from 'lucide-react';
import { UAParser } from 'ua-parser-js'; 
import getAllOrders from '@/lib/getAllorders';

// --- CONFIGURATION ---
const ACTION_OPTIONS = [
  { label: 'Processing', value: 'Processing' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancel', value: 'Cancelled' },
  { label: 'Return', value: 'Returned' }
];

const CALL_OPTIONS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' }, 
  { label: 'No Answer', value: 'No Answer' },
];

// --- HELPER: MODEL MAPPING ---
// Add common cryptic model codes here to translate them to marketing names
const DEVICE_CODEX = {
  '23129RAA4G': 'Redmi Note 13 5G', // The specific one you asked for
  '23124RA7EO': 'Redmi Note 13 4G',
  'SM-S918B': 'Galaxy S23 Ultra',
  'SM-S908B': 'Galaxy S22 Ultra',
  'iPhone16,1': 'iPhone 15 Pro',
  'iPhone16,2': 'iPhone 15 Pro Max',
};

// --- ADVANCED USER AGENT PARSER ---
const getDeepUserAgentInfo = (uaString) => {
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  
  // 1. Better Device Name Logic
  const rawModel = result.device.model || '';
  const marketingName = DEVICE_CODEX[rawModel] || rawModel || 'Unknown Device';
  const vendor = result.device.vendor || 'Generic';

  // 2. Detect In-App Browsers (Facebook/Instagram/TikTok)
  let appSource = { 
    name: 'External Browser', 
    code: 'Browser', 
    version: result.browser.version,
    insight: 'User is browsing via a standard web browser (Chrome, Safari, etc.).' 
  };
  
  // Facebook Detection
  if (uaString.includes('FB_IAB') || uaString.includes('FB4A')) {
    // Try to extract FBAV version (e.g., FBAV/539.0.0.54.69)
    const fbavMatch = uaString.match(/FBAV\/([\d.]+)/);
    const fbVersion = fbavMatch ? fbavMatch[1] : 'Unknown';

    appSource = { 
      name: 'Facebook App', 
      code: 'FB_IAB', 
      version: fbVersion,
      insight: 'User clicked a link inside the Facebook App (Feed/Ad).' 
    };
  } else if (uaString.includes('Instagram')) {
    appSource = { 
      name: 'Instagram App', 
      code: 'Instagram', 
      version: 'Latest',
      insight: 'User came from an Instagram Story or Post.' 
    };
  }

  // 3. Detect Environment (WebView)
  // "wv" is the key indicator in the UA string for Android WebViews
  const isWebView = uaString.includes('wv') || (result.os.name === 'Android' && uaString.includes('Version/'));
  
  const environment = {
    type: isWebView ? 'WebView (In-App)' : 'Standalone Browser',
    code: isWebView ? 'wv' : 'Standard',
    insight: isWebView 
      ? 'Viewing inside another app, not a full browser. High chance of Social Media traffic.' 
      : 'Using a dedicated browser application (Chrome/Safari).'
  };

  // 4. Construct the "Summary"
  const summary = `A person using a ${vendor} ${marketingName} running ${result.os.name} ${result.os.version}. They are browsing directly inside ${appSource.name === 'External Browser' && isWebView ? 'an App' : appSource.name}.`;

  return {
    raw: result,
    device: {
      marketingName,
      rawModel,
      vendor,
      os: `${result.os.name} ${result.os.version}`
    },
    browser: {
      name: result.browser.name,
      engine: result.engine.name,
      version: result.browser.version
    },
    appSource,
    environment,
    summary
  };
};

// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Processing: { icon: <CircleDot size={14} />, color: 'bg-blue-600' },
    Shipped:    { icon: <Truck size={14} />, color: 'bg-purple-600' }, 
    Delivered:  { icon: <CheckCircle size={14} />, color: 'bg-green-600' },
    Cancelled:  { icon: <XCircle size={14} />, color: 'bg-red-600' },
    Returned:   { icon: <RotateCcw size={14} />, color: 'bg-orange-600' },
  };
  const config = statusConfig[status] || statusConfig.Processing;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white ${config.color} shadow-sm`}>
      {config.icon}
      {status}
    </span>
  );
};

const CallStatusDropdown = ({ currentStatus, onStatusChange }) => {
  const statusStyles = {
    Confirmed: 'border-green-500/50 bg-green-500/20 text-green-200 focus:border-green-500',
    'No Answer': 'border-red-500/50 bg-red-500/20 text-red-200 focus:border-red-500',
    'Pending': 'border-yellow-500/50 bg-yellow-500/20 text-yellow-200 focus:border-yellow-500'
  };
  const currentStyle = statusStyles[currentStatus] || statusStyles['Pending'];

  const getIcon = () => {
    if (currentStatus === 'Confirmed') return <Check size={12} />;
    if (currentStatus === 'No Answer') return <PhoneOff size={12} />;
    return <PhoneCall size={12} />;
  };

  return (
    <div className="relative w-36"> 
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`appearance-none w-full rounded-md border py-1.5 pl-8 pr-2 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 ${currentStyle} transition-colors cursor-pointer`}
      >
        {CALL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <div className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 opacity-80 text-currentColor`}>
        {getIcon()}
      </div>
    </div>
  );
};

const ActionDropdown = ({ currentStatus, onStatusChange }) => {
  const statusStyles = {
    Shipped:   'border-purple-500/50 bg-purple-900/20 text-purple-200 focus:border-purple-500 focus:ring-purple-500',
    Delivered: 'border-green-500/50 bg-green-900/20 text-green-200 focus:border-green-500 focus:ring-green-500',
    Cancelled: 'border-red-500/50 bg-red-900/20 text-red-200 focus:border-red-500 focus:ring-red-500',
    Returned:  'border-orange-500/50 bg-orange-900/20 text-orange-200 focus:border-orange-500 focus:ring-orange-500',
    Default:   'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
  };
  const currentStyle = statusStyles[currentStatus] || statusStyles.Default;
  return (
    <div className="relative w-36">
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`appearance-none w-full rounded-md border py-1.5 pl-3 pr-8 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 ${currentStyle}`}
      >
        {ACTION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 ${currentStatus === 'Processing' ? 'text-gray-400' : 'text-currentColor'}`} />
    </div>
  );
};

// --- UPDATED ORDER MODAL ---
const OrderModal = ({ order, onClose, onStatusChange, onCallStatusChange }) => {
  if (!order) return null;

  // Grab UA string from clientInfo (as per your screenshot structure)
  const uaString = order.clientInfo?.userAgent || order.userAgent || '';
  const uaData = getDeepUserAgentInfo(uaString);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Package className="text-blue-400" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Order Details</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-blue-400 font-mono">#{order.orderId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
          
          {/* LEFT COLUMN: Basic Order Info */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
                    <User size={14} className="text-gray-400"/> 
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border border-gray-700"><User size={18} /></div>
                    <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-white">{order.customer.name}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border border-gray-700"><Phone size={14} /></div>
                        <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-white">{order.customer.phone}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border border-gray-700"><Calendar size={14} /></div>
                        <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-white text-xs">{new Date(order.date).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                </div>
            </div>

            {/* Delivery & Finance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 flex flex-col">
                 <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400"/>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery</span>
                 </div>
                 <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">{order.address}</p>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-200 w-fit">{order.shippingMethod}</span>
                 </div>
               </div>
               
               <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 flex flex-col">
                 <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
                    <DollarSign size={14} className="text-gray-400"/>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment</span>
                 </div>
                 <div className="p-4 flex-1 space-y-2">
                    <div className="flex justify-between text-xs text-gray-400"><span>Subtotal</span><span>{order.totalValue - order.shippingCost}</span></div>
                    <div className="flex justify-between text-xs text-gray-400"><span>Shipping</span><span>{order.shippingCost}</span></div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-700/50">
                      <span>Total</span><span className="text-green-400">{order.totalValue} ৳</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Digital ID Card (User Agent Analysis) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" /> 
              Digital ID Card
              <span className="text-xs font-normal text-gray-500 ml-auto bg-gray-900 px-2 py-0.5 rounded-full border border-gray-700">Client Info Decoder</span>
            </h3>
            
            <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg relative">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              {/* 1. Device Hardware */}
              <div className="p-5 border-b border-gray-700/50 flex gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 shrink-0 shadow-inner">
                    <Smartphone size={24} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">1. The Device (Hardware)</h4>
                    <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-white tracking-tight">
                            {uaData.device.vendor} <span className="text-blue-400">{uaData.device.marketingName}</span>
                        </p>
                    </div>
                    {/* Show Raw Code if different */}
                    {uaData.device.marketingName !== uaData.device.rawModel && (
                         <p className="text-xs text-gray-500 font-mono mt-0.5">Code: {uaData.device.rawModel}</p>
                    )}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-900/20 text-green-400 text-xs font-medium border border-green-900/50">
                        <Zap size={10} fill="currentColor" /> {uaData.device.os}
                    </div>
                 </div>
              </div>

              {/* 2. Environment */}
              <div className="p-5 border-b border-gray-700/50 flex gap-4 relative z-10 bg-gray-800/30">
                 <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 shrink-0 shadow-inner">
                    <LayoutTemplate size={24} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">2. The Environment (Software)</h4>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{uaData.environment.type}</span>
                        <code className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-yellow-500 font-mono border border-gray-700">Code: {uaData.environment.code}</code>
                    </div>
                    <p className="text-xs text-gray-400 leading-snug">
                       {uaData.environment.insight}
                    </p>
                 </div>
              </div>

              {/* 3. App Source */}
              <div className="p-5 border-b border-gray-700/50 flex gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 shrink-0 shadow-inner">
                    <Share2 size={24} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">3. The App Source</h4>
                    <p className={`text-lg font-bold ${uaData.appSource.name.includes('Facebook') ? 'text-blue-400' : 'text-white'}`}>
                        {uaData.appSource.name}
                    </p>
                    
                    {uaData.appSource.code === 'FB_IAB' && (
                        <div className="text-xs text-gray-500 font-mono mt-1 mb-2">
                           Ver: {uaData.appSource.version}
                        </div>
                    )}

                    <div className="relative pl-3 border-l-2 border-blue-500/30">
                        <p className="text-xs text-gray-300 italic">
                            "{uaData.appSource.insight}"
                        </p>
                    </div>
                 </div>
              </div>

              {/* 4. Browser Engine & Summary */}
              <div className="p-5 bg-blue-600/5 flex gap-4 items-start relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-blue-900/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Info size={24} />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Summary Profile</h4>
                    <p className="text-sm text-blue-100/90 leading-relaxed">
                      {uaData.summary}
                    </p>
                    <div className="mt-2 text-[10px] text-blue-300/50 font-mono">
                      Engine: {uaData.browser.engine}
                    </div>
                 </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer: Action Buttons */}
        <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 shrink-0">
           <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
              <button onClick={onClose} className="px-5 py-2.5 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-700 hover:text-white transition-all">
                Close
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
                   <span className="text-xs font-medium text-gray-400 pl-2">Call Status:</span>
                   <CallStatusDropdown currentStatus={order.callStatus} onStatusChange={onCallStatusChange} />
                </div>
                <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
                   <span className="text-xs font-medium text-gray-400 pl-2">Action:</span>
                   <ActionDropdown currentStatus={order.status} onStatusChange={onStatusChange} />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- LOGIC HELPERS ---
const getShippingLocation = (shippingCost) => {
  if (shippingCost === 60) return { location: 'Inside Dhaka', color: 'text-green-400' };
  if (shippingCost === 99) return { location: 'Outside Dhaka', color: 'text-orange-400' };
  return { location: 'N/A', color: 'text-gray-400' };
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  
  if (isNaN(seconds) || seconds < 0) return 'Just now';
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  
  if (seconds < 60) return `${seconds} sec ago`;
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} days ago`;
};

// --- MAIN COMPONENT ---
export default function App() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [stats, setStats] = useState({ today: 0, yesterday: 0, thisMonth: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate Status Counts
  const statusCounts = useMemo(() => {
    const counts = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Returned: 0 };
    orders.forEach(order => { if (counts[order.status] !== undefined) counts[order.status]++; else counts.Processing++; });
    return counts;
  }, [orders]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getAllOrders();
      const transformedData = data.map((order, index) => ({
        id: order._id || index,
        customer: { name: order.name || 'N/A', phone: order.number || 'N/A' },
        address: order.address || 'N/A',
        shippingMethod: order.shipping || 'N/A',
        shippingCost: order.shippingCost || 0,
        totalValue: order.totalValue || 0,
        status: order.status || 'Processing',
        callStatus: order.phoneCallStatus || 'Pending', 
        orderId: order.orderId,
        // Grab clientInfo based on structure
        clientInfo: order.clientInfo || {}, 
        userAgent: order.clientInfo?.userAgent || order.userAgent || '',
        date: order.createdAt || new Date().toISOString() 
      }));
      setOrders(transformedData);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setStats({
        today: transformedData.filter(o => new Date(o.date) >= today).length,
        yesterday: transformedData.filter(o => { const d = new Date(o.date); return d >= yesterday && d < today; }).length,
        thisMonth: transformedData.filter(o => new Date(o.date) >= startOfMonth).length
      });
    };
    fetchOrders();
  }, []);

  // --- HANDLERS ---
  const handleStatusChange = async (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    try {
      await fetch(`https://profit-first-server.vercel.app/orders/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) { console.error(e); }
  };

  const handleCallStatusChange = async (id, newCallStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, callStatus: newCallStatus } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, callStatus: newCallStatus }));
    try {
      await fetch(`https://profit-first-server.vercel.app/orders/${id}/call-status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callStatus: newCallStatus }),
      });
    } catch (e) { console.error(e); }
  };

  const filteredOrders = useMemo(() => orders.filter(o => 
    o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer?.phone?.includes(searchTerm) || o.id?.toString().includes(searchTerm)
  ), [orders, searchTerm]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, filteredOrders.length);

  // Widgets
  const statusWidgets = [
    { label: 'Processing', key: 'Processing', icon: CircleDot, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Shipped', key: 'Shipped', icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Delivered', key: 'Delivered', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Cancelled', key: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'Returned', key: 'Returned', icon: RotateCcw, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ];

  return (
    <div className="inter-font bg-gray-900 text-gray-100 min-h-screen p-4 md:p-8 relative">
      <style>{`.inter-font { font-family: "Inter", sans-serif; } .custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }`}</style>
      
      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(val) => handleStatusChange(selectedOrder.id, val)}
          onCallStatusChange={(val) => handleCallStatusChange(selectedOrder.id, val)}
        />
      )}

      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Book Order Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your orders and shipments efficiently.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          <Clock size={14} />
          {currentTime.toLocaleString()}
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[{ label: "Today's", value: stats.today }, { label: "Yesterday's", value: stats.yesterday }, { label: "This Month's", value: stats.thisMonth }].map((s, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">{s.label}</h3>
            <p className="text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
         {statusWidgets.map((w) => {
            const Icon = w.icon;
            return (
               <div key={w.key} className={`flex items-center gap-3 p-4 rounded-xl border ${w.border} ${w.bg} transition-all hover:scale-[1.02]`}>
                  <div className={`p-2.5 rounded-lg bg-gray-900/50 ${w.color} shadow-sm`}><Icon size={20} /></div>
                  <div><p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase">{w.label}</p><p className="text-2xl font-bold text-white">{statusCounts[w.key] || 0}</p></div>
               </div>
            )
         })}
      </div>
      
      <div className="mb-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
        <div className="relative w-full md:w-1/3">
          <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="inter-font w-full rounded-lg border border-gray-600 bg-gray-900 py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <label className="text-sm text-gray-400">Rows per page:</label>
          <div className="relative">
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="inter-font appearance-none rounded-md border border-gray-600 bg-gray-900 py-1.5 pl-3 pr-8 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="inter-font min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                {['Order ID', 'View', 'Customer', 'Time Ago', 'Address', 'Shipping', 'Total', 'Status', 'Call', 'Action'].map((head) => (
                  <th key={head} scope="col" className="py-4 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map(order => {
                  const { location, color } = getShippingLocation(order.shippingCost);
                  return (
                    <tr key={order.id} className="hover:bg-gray-700/40 transition-colors">
                      <td className="whitespace-nowrap py-4 px-4 text-sm font-mono text-blue-400">#{order.orderId}</td>
                      <td className="whitespace-nowrap py-4 px-4">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all" title="View Details"><Eye size={18} /></button>
                      </td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <div className="font-medium text-white">{order.customer?.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{order.customer?.phone}</div>
                      </td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-400">
                         <div className="flex items-center gap-1.5 text-xs bg-gray-900/50 px-2 py-1 rounded border border-gray-700 w-fit"><Clock size={12} />{formatTimeAgo(order.date)}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-300 max-w-xs truncate" title={order.address}>{order.address}</td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <div className="text-white font-medium">{order.shippingMethod}</div>
                        <div className={`flex items-center gap-1 ${color} text-xs mt-1`}><MapPin size={10} />{location} ({order.shippingCost}৳)</div>
                      </td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm font-bold text-white">{order.totalValue} ৳</td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm"><StatusBadge status={order.status} /></td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm"><CallStatusDropdown currentStatus={order.callStatus} onStatusChange={(val) => handleCallStatusChange(order.id, val)} /></td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm"><ActionDropdown currentStatus={order.status} onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)} /></td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-lg">No orders found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-400">Showing <span className="font-medium text-white">{startItem}</span> to <span className="font-medium text-white">{endItem}</span> of <span className="font-medium text-white">{filteredOrders.length}</span></p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p=>Math.max(1, p-1))} disabled={currentPage===1} className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-800 py-2 px-4 font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"><ChevronLeft size={16} />Prev</button>
            <span className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 font-mono">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p=>Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-800 py-2 px-4 font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors">Next<ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}