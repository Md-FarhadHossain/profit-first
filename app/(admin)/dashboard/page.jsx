"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ChevronDown, 
  Package, Truck, CheckCircle, CircleDot, MapPin, Clock,
  XCircle, RotateCcw, Eye, X, User, Phone, Calendar, DollarSign,
  PhoneCall, PhoneOff, Check
} from 'lucide-react';
import getAllOrders from '@/lib/getAllorders';

// --- CONFIGURATION ---
const ACTION_OPTIONS = [
  { label: 'Processing', value: 'Processing' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancel', value: 'Cancelled' },
  { label: 'Return', value: 'Returned' }
];

// --- CALL STATUS CONFIGURATION ---
const CALL_OPTIONS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' }, 
  { label: 'No Answer', value: 'No Answer' },
];

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
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
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Information</h3>
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300"><User size={16} /></div>
                <div><p className="text-sm text-gray-400">Full Name</p><p className="font-medium text-white">{order.customer.name}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300"><Phone size={16} /></div>
                <div><p className="text-sm text-gray-400">Phone Number</p><p className="font-medium text-white">{order.customer.phone}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300"><Calendar size={16} /></div>
                <div><p className="text-sm text-gray-400">Order Date</p><p className="font-medium text-white">{new Date(order.date).toLocaleString()}</p></div>
              </div>
            </div>
          </div>
          {/* Delivery Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Details</h3>
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 space-y-3 h-full">
              <div>
                <p className="text-sm text-gray-400 mb-1 flex items-center gap-2"><MapPin size={14} /> Address</p>
                <p className="text-sm text-white leading-relaxed">{order.address}</p>
              </div>
              <div className="pt-3 border-t border-gray-700/50 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Method:</span>
                  <span className="text-sm font-medium text-white px-2 py-0.5 bg-gray-700 rounded">{order.shippingMethod}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Payment Summary */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Summary</h3>
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Shipping Cost</span>
                <span className="text-white font-mono">{order.shippingCost} ৳</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Subtotal (approx)</span>
                <span className="text-white font-mono">{order.totalValue - order.shippingCost} ৳</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-bold text-white">Total Amount</span>
                <div className="flex items-center gap-2 text-xl font-bold text-green-400">
                  <DollarSign size={20} />
                  {order.totalValue} ৳
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Action Buttons */}
        <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 shrink-0">
           <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
              <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-700 hover:text-white transition-colors">
                Close
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Call Status Control */}
                <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-lg border border-gray-700/50">
                   <span className="text-xs font-medium text-gray-400 pl-1">Call:</span>
                   <CallStatusDropdown currentStatus={order.callStatus} onStatusChange={onCallStatusChange} />
                </div>

                {/* Order Action Control */}
                <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-lg border border-gray-700/50">
                   <span className="text-xs font-medium text-gray-400 pl-1">Order:</span>
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

  // Calculate Status Counts dynamically
  const statusCounts = useMemo(() => {
    const counts = {
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0
    };
    orders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      } else {
        // Handle cases where status might not match exactly or is new
        counts.Processing++; 
      }
    });
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

  // --- ACTION HANDLERS ---
  const handleStatusChange = async (id, newStatus) => {
    setOrders(prevOrders => prevOrders.map(order => order.id === id ? { ...order, status: newStatus } : order));
    if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }

    try {
      await fetch(`https://profit-first-server.vercel.app/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleCallStatusChange = async (id, newCallStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id ? { ...order, callStatus: newCallStatus } : order
      )
    );
    if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, callStatus: newCallStatus }));
    }

    try {
      const response = await fetch(`https://profit-first-server.vercel.app/orders/${id}/call-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callStatus: newCallStatus }),
      });
      if (response.ok) console.log("Call status updated successfully");
    } catch (error) {
      console.error("Failed to update call status:", error);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm) ||
      order.id?.toString().includes(searchTerm)
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, filteredOrders.length);

  // Widget Configuration
  const statusWidgets = [
    { label: 'Processing', key: 'Processing', icon: CircleDot, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Shipped', key: 'Shipped', icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Delivered', key: 'Delivered', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Cancelled', key: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'Returned', key: 'Returned', icon: RotateCcw, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ];

  return (
    <div className="inter-font bg-gray-900 text-gray-100 min-h-screen p-4 md:p-8 relative">
      <style>{`.inter-font { font-family: "Inter", sans-serif; }`}</style>
      
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
      
      {/* Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Today's Orders", value: stats.today },
          { label: "Yesterday's Orders", value: stats.yesterday },
          { label: "This Month's Orders", value: stats.thisMonth }
        ].map((stat, idx) => (
          <div key={idx} className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* NEW STATUS VISUALIZATION DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
         {statusWidgets.map((widget) => {
            const Icon = widget.icon;
            return (
               <div key={widget.key} className={`flex items-center gap-3 p-4 rounded-xl border ${widget.border} ${widget.bg} transition-all hover:scale-[1.02]`}>
                  <div className={`p-2.5 rounded-lg bg-gray-900/50 ${widget.color} shadow-sm`}>
                     <Icon size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase tracking-wide">{widget.label}</p>
                     <p className="text-2xl font-bold text-white">{statusCounts[widget.key] || 0}</p>
                  </div>
               </div>
            )
         })}
      </div>
      
      {/* Search and Filter Bar */}
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
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Table Section */}
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
                        <button onClick={() => setSelectedOrder(order)} className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all" title="View Details">
                          <Eye size={18} />
                        </button>
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
                      
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                         <CallStatusDropdown currentStatus={order.callStatus} onStatusChange={(val) => handleCallStatusChange(order.id, val)} />
                      </td>
                      
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <ActionDropdown currentStatus={order.status} onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)} />
                      </td>
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
            <button onClick={prevPage} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-800 py-2 px-4 font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} />Prev</button>
            <span className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 font-mono">{currentPage} / {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-800 py-2 px-4 font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next<ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}