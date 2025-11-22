"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line 
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, 
  Package, DollarSign, Activity, Truck, MapPin, ChevronDown, Ship 
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import getAllOrders from '@/lib/getAllorders';

// --- UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 shadow-xl flex flex-col ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }) => (
  <Card className="h-full justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg bg-opacity-20 ${color.bg} ${color.text}`}>
        <Icon size={22} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-2xl z-50">
        <p className="text-gray-300 text-xs mb-2 font-mono">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN PAGE COMPONENT ---

export default function AnalyticsDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Process Data
  const analytics = useMemo(() => {
    if (!orders.length) return null;

    const today = new Date();
    const yesterday = subDays(today, 1);
    
    const chartDataArr = Array.from({ length: timeRange }, (_, i) => {
      const d = subDays(today, timeRange - 1 - i);
      return {
        date: format(d, 'MMM dd'),
        fullDate: d,
        orders: 0,
        revenue: 0,
        delivered: 0,
        cancelled: 0,
        shippedVolume: 0 // NEW: Tracks Shipped + Delivered (throughput)
      };
    });

    let totalRevenue = 0;
    let todayOrders = 0;
    let yesterdayOrders = 0;
    
    const statusDist = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Returned: 0 };
    const locationDist = { InsideDhaka: 0, OutsideDhaka: 0, Other: 0 };

    const cutoffDate = subDays(today, timeRange);

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt); 
      const orderTotal = parseFloat(order.totalValue) || 0;
      const shippingCost = parseFloat(order.shippingCost) || 0;
      const status = order.status || 'Processing';

      totalRevenue += orderTotal;

      if (isSameDay(orderDate, today)) todayOrders++;
      if (isSameDay(orderDate, yesterday)) yesterdayOrders++;

      // Filter by Time Range
      if (orderDate >= cutoffDate) {
        
        // Location Logic
        if (shippingCost === 60) locationDist.InsideDhaka++;
        else if (shippingCost === 99) locationDist.OutsideDhaka++;
        else locationDist.Other++;

        // Status Logic
        if (statusDist[status] !== undefined) statusDist[status]++;
        else statusDist['Processing']++;

        // Chart Logic
        const dayStat = chartDataArr.find(d => isSameDay(d.fullDate, orderDate));
        if (dayStat) {
          dayStat.orders += 1;
          dayStat.revenue += orderTotal;
          if (status === 'Delivered') dayStat.delivered += 1;
          if (status === 'Cancelled') dayStat.cancelled += 1;
          
          // NEW: Calculate Shipping Volume
          // We count it as "Shipped Volume" if it is currently Shipped OR Delivered
          if (['Shipped', 'Delivered'].includes(status)) {
            dayStat.shippedVolume += 1;
          }
        }
      }
    });

    const growth = yesterdayOrders === 0 ? 100 : ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100;
    
    // Calculate Location Percentages
    const totalLocations = locationDist.InsideDhaka + locationDist.OutsideDhaka + locationDist.Other;
    const insidePct = totalLocations > 0 ? ((locationDist.InsideDhaka / totalLocations) * 100).toFixed(1) : 0;
    const outsidePct = totalLocations > 0 ? ((locationDist.OutsideDhaka / totalLocations) * 100).toFixed(1) : 0;

    return {
      totalOrders: orders.length,
      totalRevenue,
      todayOrders,
      yesterdayOrders,
      growth: growth.toFixed(1) + '%',
      growthDirection: growth >= 0 ? 'up' : 'down',
      chartData: chartDataArr,
      statusData: [
        { name: 'Processing', value: statusDist.Processing, color: '#3B82F6' }, 
        { name: 'Shipped', value: statusDist.Shipped, color: '#A855F7' },    
        { name: 'Delivered', value: statusDist.Delivered, color: '#22C55E' },  
        { name: 'Cancelled', value: statusDist.Cancelled, color: '#EF4444' },  
        { name: 'Returned', value: statusDist.Returned, color: '#F97316' },   
      ].filter(i => i.value > 0),
      locationData: [
        { name: 'Inside Dhaka', value: locationDist.InsideDhaka, color: '#14B8A6', percentage: insidePct }, 
        { name: 'Outside Dhaka', value: locationDist.OutsideDhaka, color: '#F59E0B', percentage: outsidePct }, 
        ...(locationDist.Other > 0 ? [{ name: 'Other', value: locationDist.Other, color: '#6B7280', percentage: 0 }] : [])
      ],
      locationStats: { insidePct, outsidePct }
    };
  }, [orders, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <Activity size={48} className="text-blue-500 mb-4" />
          <p className="text-gray-400">Analyzing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans w-full">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h1>
          <p className="text-gray-400 mt-1">Performance metrics for the last <span className="text-blue-400 font-bold">{timeRange} days</span>.</p>
        </div>
        
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
            </div>
            <select 
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="appearance-none bg-gray-800 text-white text-sm font-medium border border-gray-700 rounded-lg py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-700 transition-colors cursor-pointer shadow-lg"
            >
                <option value={7}>Last 7 Days</option>
                <option value={15}>Last 15 Days</option>
                <option value={30}>Last 30 Days</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-400" />
            </div>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Revenue" 
          value={`${analytics?.totalRevenue.toLocaleString()} ৳`} 
          icon={DollarSign}
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-400' }}
          trend="up" trendValue="+12.5%" 
        />
        <StatCard 
          title="Total Orders" 
          value={analytics?.totalOrders} 
          icon={Package}
          color={{ bg: 'bg-blue-500', text: 'text-blue-400' }}
        />
        <StatCard 
          title="Today's Volume" 
          value={analytics?.todayOrders} 
          icon={TrendingUp}
          color={{ bg: 'bg-purple-500', text: 'text-purple-400' }}
          trend={analytics?.growthDirection} 
          trendValue={analytics?.growth}
        />
         <StatCard 
          title="Avg. Delivery Rate" 
          value="94%" 
          icon={Truck}
          color={{ bg: 'bg-orange-500', text: 'text-orange-400' }}
        />
      </div>

      {/* ROW 1: MAIN FLOW CHART */}
      <div className="mb-6">
        <Card className="min-h-[450px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h3 className="text-lg font-bold text-white">Order Volume Trend</h3>
                <p className="text-sm text-gray-400">Visualizing incoming orders vs deliveries over {timeRange} days.</p>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
              <span className="flex items-center gap-2 text-gray-300"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Total Orders</span>
              <span className="flex items-center gap-2 text-gray-300"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Delivered</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.chartData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  tick={{fontSize: 11}} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                  interval={timeRange > 15 ? 2 : 0}
                />
                <YAxis stroke="#9CA3AF" tick={{fontSize: 11}} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" name="Total Orders" animationDuration={1000} />
                <Area type="monotone" dataKey="delivered" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorDelivered)" name="Delivered" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ROW 2: DETAILED BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* COL 1: GEOGRAPHY */}
        <Card className="min-h-[380px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Geography</h3>
                  <p className="text-xs text-gray-500">Location distribution</p>
                </div>
                <MapPin size={18} className="text-gray-500" />
            </div>
            
            <div className="flex-1 w-full relative min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                        data={analytics?.locationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {analytics?.locationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{analytics?.locationData.reduce((a, b) => a + b.value, 0)}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Parcels</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-gray-700/50 pt-4">
                {analytics?.locationData.map((item) => (
                  <div key={item.name} className="group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-medium text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                        {item.name}
                      </span>
                      <div className="text-right">
                         <span className="text-sm font-bold text-white">{item.percentage}%</span>
                         <span className="text-[10px] text-gray-500 ml-1">({item.value})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
        </Card>

        {/* COL 2: STATUS BREAKDOWN */}
        <Card className="min-h-[380px]">
             <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Order Status</h3>
                  <p className="text-xs text-gray-500">Current stage metrics</p>
                </div>
                <Activity size={18} className="text-gray-500" />
            </div>
            <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={analytics?.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {analytics?.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-bold text-white">{analytics?.statusData.reduce((a, b) => a + b.value, 0)}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Active</span>
            </div>
            </div>
        </Card>

        {/* COL 3: DAILY PERFORMANCE */}
        <Card className="min-h-[380px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Daily Stats</h3>
                  <p className="text-xs text-gray-500">Orders vs Cancellations</p>
                </div>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                    <span className="text-xs text-gray-400">Active</span>
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 ml-1"></div>
                    <span className="text-xs text-gray-400">Cancel</span>
                </div>
            </div>
            <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  tick={{fontSize: 10}} 
                  tickLine={false} 
                  axisLine={false}
                  interval={timeRange > 15 ? 2 : 0} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#1f2937'}} />
                <Bar dataKey="orders" fill="#3B82F6" radius={[2, 2, 0, 0]} stackId="a" barSize={timeRange > 15 ? 10 : 20} name="Orders" />
                <Bar dataKey="cancelled" fill="#EF4444" radius={[2, 2, 0, 0]} stackId="a" barSize={timeRange > 15 ? 10 : 20} name="Cancelled" />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </Card>
      </div>

     

    </div>
  );
}