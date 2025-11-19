"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ChevronDown, 
  Package, Truck, CheckCircle, CircleDot, MapPin, Clock,
  XCircle, RotateCcw // Added new icons for Cancel and Return
} from 'lucide-react';
import getAllOrders from '@/lib/getAllorders';

// Define the core status options based on your requirements
const ACTION_OPTIONS = [
  { label: 'Processing', value: 'Processing' },
  { label: 'Shift', value: 'Shipped' },       // Display "Shift", save as "Shipped"
  { label: 'Deliver it', value: 'Delivered' }, // Display "Deliver it", save as "Delivered"
  { label: 'Cancel', value: 'Cancelled' },
  { label: 'Return', value: 'Returned' }
];

// --- Helper Components ---

// Component for Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Processing: { icon: <CircleDot size={14} />, color: 'bg-blue-600' },
    // "Shift" maps to Shipped
    Shipped:    { icon: <Truck size={14} />, color: 'bg-purple-600' }, 
    // "Deliver it" maps to Delivered
    Delivered:  { icon: <CheckCircle size={14} />, color: 'bg-green-600' },
    // New actions
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

// Component for Action Dropdown
const ActionDropdown = ({ currentStatus, onStatusChange }) => {
  return (
    <div className="relative w-32">
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`
          appearance-none w-full rounded-md border py-1.5 pl-3 pr-8 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800
          ${currentStatus === 'Cancelled' ? 'border-red-500/50 bg-red-900/20 text-red-200 focus:border-red-500 focus:ring-red-500' : 
            currentStatus === 'Delivered' ? 'border-green-500/50 bg-green-900/20 text-green-200 focus:border-green-500 focus:ring-green-500' :
            'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'}
        `}
      >
        {ACTION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
};

// Helper function to determine location based on shipping cost
const getShippingLocation = (shippingCost) => {
  if (shippingCost === 60) {
    return { location: 'Inside Dhaka', color: 'text-green-400' };
  } else if (shippingCost === 99) {
    return { location: 'Outside Dhaka', color: 'text-orange-400' };
  } else {
    return { location: 'N/A', color: 'text-gray-400' };
  }
};

// Helper function to format the time elapsed
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

// --- Main Dashboard Component ---
export default function App() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    yesterday: 0,
    thisMonth: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer for real-time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getAllOrders();
      const transformedData = data.map((order, index) => ({
        id: order._id || index,
        customer: {
          name: order.name || 'N/A',
          phone: order.number || 'N/A'
        },
        address: order.address || 'N/A',
        shippingMethod: order.shipping || 'N/A',
        shippingCost: order.shippingCost || 0,
        totalValue: order.totalValue || 0,
        status: order.status || 'Processing', // Default status from DB
        orderId: order.orderId,
        date: order.createdAt || new Date().toISOString() 
      }));
      setOrders(transformedData);
      
      // Calculate Stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setStats({
        today: transformedData.filter(o => new Date(o.date) >= today).length,
        yesterday: transformedData.filter(o => {
          const d = new Date(o.date);
          return d >= yesterday && d < today;
        }).length,
        thisMonth: transformedData.filter(o => new Date(o.date) >= startOfMonth).length
      });
    };
    fetchOrders();
  }, []);

  // Update order status
  const handleStatusChange = (orderId, newStatus) => {
    // Here you would typically make an API call to update the DB
    // await updateOrderStatus(orderId, newStatus);
    
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm) ||
      order.id?.toString().includes(searchTerm)
    );
  }, [orders, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, filteredOrders.length);

  return (
    <div className="inter-font bg-gray-900 text-gray-100 min-h-screen p-4 md:p-8">
      <style>{`.inter-font { font-family: "Inter", sans-serif; }`}</style>
      
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
      
      {/* Stats Section */}
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
      
      {/* Controls */}
      <div className="mb-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inter-font w-full rounded-lg border border-gray-600 bg-gray-900 py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <label className="text-sm text-gray-400">Rows per page:</label>
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="inter-font appearance-none rounded-md border border-gray-600 bg-gray-900 py-1.5 pl-3 pr-8 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="inter-font min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                {['Order ID', 'Customer', 'Time Ago', 'Address', 'Shipping', 'Total', 'Status', 'Action'].map((head) => (
                  <th key={head} scope="col" className="py-4 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {head}
                  </th>
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
                      
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <div className="font-medium text-white">{order.customer?.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{order.customer?.phone}</div>
                      </td>
                      
                      <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-400">
                         <div className="flex items-center gap-1.5 text-xs bg-gray-900/50 px-2 py-1 rounded border border-gray-700 w-fit">
                           <Clock size={12} />
                           {formatTimeAgo(order.date)}
                         </div>
                      </td>
                      
                      <td className="py-4 px-4 text-sm text-gray-300 max-w-xs truncate" title={order.address}>
                        {order.address}
                      </td>
                      
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <div className="text-white font-medium">{order.shippingMethod}</div>
                        <div className={`flex items-center gap-1 ${color} text-xs mt-1`}>
                          <MapPin size={10} />
                          {location} ({order.shippingCost}৳)
                        </div>
                      </td>
                      
                      <td className="whitespace-nowrap py-4 px-4 text-sm font-bold text-white">
                        {order.totalValue} ৳
                      </td>
                      
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <StatusBadge status={order.status} />
                      </td>
                      
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <ActionDropdown
                          currentStatus={order.status}
                          onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-lg">No orders found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-400">
            Showing <span className="font-medium text-white">{startItem}</span> to <span className="font-medium text-white">{endItem}</span> of <span className="font-medium text-white">{filteredOrders.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-800 py-2 px-4 font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <span className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-800 py-2 px-4 font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}