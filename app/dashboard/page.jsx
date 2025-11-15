"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Package, Truck, CheckCircle, CircleDot, MapPin, Clock } from 'lucide-react';
import getAllOrders from '@/lib/getAllorders';

const STATUSES = ['Processing', 'Packaged', 'Shipped', 'Delivered'];

// --- Helper Components ---

// Component for Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Processing: { icon: <CircleDot size={14} />, color: 'bg-blue-600' },
    Packaged: { icon: <Package size={14} />, color: 'bg-yellow-600' },
    Shipped: { icon: <Truck size={14} />, color: 'bg-purple-600' },
    Delivered: { icon: <CheckCircle size={14} />, color: 'bg-green-600' },
  };

  const config = statusConfig[status] || statusConfig.Processing;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-white ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
};

// Component for Status Dropdown
const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="appearance-none rounded-md border border-gray-600 bg-gray-700 py-1.5 pl-3 pr-8 text-sm text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
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

// Helper function to format the time elapsed since a given date
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  
  if (isNaN(seconds) || seconds < 0) return 'Just now';

  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) {
    return `${seconds} sec ago`;
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hr ago`;
  } else {
    return `${days} days ago`;
  }
};


// --- Main Dashboard Component ---
export default function App() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Set up a timer to update the current time every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timer);
  }, []);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getAllOrders();
      // Transform the data to match expected structure
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
        status: order.status || 'Processing',
        date: order.createdAt || new Date().toISOString() // Ensure a valid date for time ago calculation
      }));
      setOrders(transformedData);
    };

    fetchOrders();
  }, []);

  // Update order status
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Memoized filtering logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm) ||
      order.id?.toString().includes(searchTerm)
    );
  }, [orders, searchTerm]);

  // Memoized pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Pagination handlers
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, filteredOrders.length);

  return (
    <div className="inter-font bg-gray-900 text-gray-100 min-h-screen p-4 md:p-8">
      <style>{`
        .inter-font { font-family: "Inter", sans-serif; }
      `}</style>
      
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Book Order Dashboard</h1>
      </header>

      {/* Controls: Search and Items per Page */}
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inter-font w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        
        {/* Items per Page Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-300">Show:</label>
          <div className="relative">
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="inter-font appearance-none rounded-md border border-gray-700 bg-gray-800 py-2 pl-3 pr-8 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
        <table className="inter-font min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Order ID</th>
              <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Customer</th>
              <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Time Ago</th>
              <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Address</th>
              <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Shipping</th>
              <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Total</th>
              <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Status</th>
              <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-white">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map(order => {
                const { location, color } = getShippingLocation(order.shippingCost);
                return (
                  <tr key={order.id} className="hover:bg-gray-700/50">
                    <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-white">#{order.id}</td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm">
                      <div className="font-medium text-white">{order.customer?.name || 'N/A'}</div>
                      <div className="text-gray-400">{order.customer?.phone || 'N/A'}</div>
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-300">
                       <div className="flex items-center gap-1.5">
                         <Clock size={14} />
                         {formatTimeAgo(order.date)}
                       </div>
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-300">{order.address || 'N/A'}</td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm">
                      <div className="text-white">{order.shippingMethod || 'N/A'}</div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>Cost: {order.shippingCost || 0} ৳</span>
                      </div>
                      <div className={`flex items-center gap-1 ${color} text-xs font-medium mt-1`}>
                        <MapPin size={12} />
                        {location}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm font-semibold text-white">{order.totalValue || 0} ৳</td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm">
                      <StatusBadge status={order.status || 'Processing'} />
                    </td>
                    <td className="whitespace-nowrap py-4 px-4 text-sm">
                      <StatusDropdown
                        currentStatus={order.status || 'Processing'}
                        onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-8 px-4 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400 mb-2 md:mb-0">
            Showing <span className="font-medium text-white">{startItem}</span> to <span className="font-medium text-white">{endItem}</span> of <span className="font-medium text-white">{filteredOrders.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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