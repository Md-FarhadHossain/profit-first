"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, 
  Package, DollarSign, Activity, Truck, MapPin, ChevronDown, 
  Smartphone, Monitor, Cpu, Share2, Globe, ShieldCheck 
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { UAParser } from 'ua-parser-js'; // Import the parser
import getAllOrders from '@/lib/getAllorders';

// --- CONFIGURATION: MODEL MAPPING ---
// Map cryptic model codes to readable marketing names
const DEVICE_CODEX = {
  '23129RAA4G': 'Redmi Note 13 5G',
  '23124RA7EO': 'Redmi Note 13 4G',
  'SM-S918B': 'Galaxy S23 Ultra',
  'SM-S928B': 'Galaxy S24 Ultra',
  'SM-A546B': 'Galaxy A54 5G',
  'iPhone16,1': 'iPhone 15 Pro',
  'iPhone16,2': 'iPhone 15 Pro Max',
  'iPhone15,2': 'iPhone 14 Pro',
  'CPH2529': 'Oppo A78',
  'V2250': 'Vivo V27',
};

// --- UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 shadow-xl flex flex-col ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }) => (
  <Card className="h-full justify-between hover:border-gray-600 transition-colors duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-opacity-20 ${color.bg} ${color.text} shadow-inner`}>
        <Icon size={22} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
          trend === 'up' 
            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur border border-gray-700 p-3 rounded-lg shadow-2xl z-50">
        <p className="text-gray-400 text-xs mb-1 font-mono uppercase tracking-wider">{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color || entry.fill}}></div>
            <p className="text-sm font-bold text-white">
              {entry.name}: <span className="font-mono ml-1">{entry.value.toLocaleString()}</span>
              {entry.payload.percentage && <span className="text-xs text-gray-400 ml-2">({entry.payload.percentage}%)</span>}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- HELPER: Aggregation ---
const aggregateCounts = (dataArray, keyFetcher, topLimit = 5) => {
  const counts = {};
  let total = 0;

  dataArray.forEach(item => {
    const key = keyFetcher(item) || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
    total++;
  });

  const sorted = Object.entries(counts)
    .map(([name, value]) => ({ name, value, percentage: ((value/total)*100).toFixed(1) }))
    .sort((a, b) => b.value - a.value);

  const topItems = sorted.slice(0, topLimit);
  const otherCount = sorted.slice(topLimit).reduce((acc, curr) => acc + curr.value, 0);

  if (otherCount > 0) {
    topItems.push({ 
      name: 'Others', 
      value: otherCount, 
      percentage: ((otherCount/total)*100).toFixed(1) 
    });
  }

  return topItems;
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
    const cutoffDate = subDays(today, timeRange);

    // --- BASIC METRICS VARIABLES ---
    let totalRevenue = 0;
    let todayOrders = 0;
    let yesterdayOrders = 0;
    const statusDist = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Returned: 0 };
    const locationDist = { InsideDhaka: 0, OutsideDhaka: 0, Other: 0 };
    
    // --- TECH ANALYTICS STORAGE ---
    const uaDataList = [];

    // --- CHART DATA SKELETON ---
    const chartDataArr = Array.from({ length: timeRange }, (_, i) => {
      const d = subDays(today, timeRange - 1 - i);
      return { date: format(d, 'MMM dd'), fullDate: d, orders: 0, delivered: 0, cancelled: 0 };
    });

    // --- MAIN LOOP ---
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const isWithinRange = orderDate >= cutoffDate;

      // Global Stats (All Time / Or filter based on preference)
      // For this example, Revenue/Total is All Time, Charts are timeRange
      totalRevenue += parseFloat(order.totalValue) || 0;
      
      // Daily Counters
      if (isSameDay(orderDate, today)) todayOrders++;
      if (isSameDay(orderDate, subDays(today, 1))) yesterdayOrders++;

      // UA Parsing (For Tech Analytics) - We'll use ALL orders for better sample size
      // Or move this inside "isWithinRange" if you only want recent tech stats
      const uaString = order.clientInfo?.userAgent || order.userAgent || '';
      if (uaString) {
        const parser = new UAParser(uaString);
        const res = parser.getResult();
        
        // Custom Logic for "Marketing Name"
        const rawModel = res.device.model;
        const marketingName = DEVICE_CODEX[rawModel] || rawModel || 'Generic';
        
        // Detect App Context
        let appType = 'Browser';
        if (uaString.includes('FB_IAB') || uaString.includes('FB4A')) appType = 'Facebook App';
        else if (uaString.includes('Instagram')) appType = 'Instagram App';
        else if (uaString.includes('wv') || (res.os.name === 'Android' && uaString.includes('Version/'))) appType = 'WebView';

        uaDataList.push({
          os: res.os.name || 'Desktop',
          osVersion: res.os.version, // e.g., "10", "15"
          vendor: res.device.vendor || 'Unknown',
          model: marketingName,
          browser: res.browser.name,
          appType: appType
        });
      }

      if (isWithinRange) {
         const shippingCost = parseFloat(order.shippingCost) || 0;
         const status = order.status || 'Processing';

         // Location
         if (shippingCost === 60) locationDist.InsideDhaka++;
         else if (shippingCost === 99) locationDist.OutsideDhaka++;
         else locationDist.Other++;

         // Status
         if (statusDist[status] !== undefined) statusDist[status]++;
         else statusDist['Processing']++;

         // Chart Data
         const dayStat = chartDataArr.find(d => isSameDay(d.fullDate, orderDate));
         if (dayStat) {
           dayStat.orders += 1;
           if (status === 'Delivered') dayStat.delivered += 1;
           if (status === 'Cancelled') dayStat.cancelled += 1;
         }
      }
    });

    // --- AGGREGATE TECH DATA ---
    const osData = aggregateCounts(uaDataList, (item) => item.os, 4).map(i => ({
      ...i, 
      color: i.name === 'Android' ? '#10B981' : i.name === 'iOS' ? '#94A3B8' : i.name === 'Windows' ? '#3B82F6' : '#6366F1'
    }));

    const modelData = aggregateCounts(uaDataList.filter(i => i.model !== 'Generic'), (item) => item.model, 6);
    
    const androidVersions = aggregateCounts(uaDataList.filter(i => i.os === 'Android'), (item) => {
        // Group Android versions (e.g. 15, 14, 13)
        return `Android ${item.osVersion ? item.osVersion.split('.')[0] : 'Old'}`;
    }, 5);

    const appContextData = aggregateCounts(uaDataList, (item) => item.appType, 4).map(i => ({
      ...i,
      color: i.name.includes('Facebook') ? '#1877F2' : i.name.includes('Instagram') ? '#E1306C' : i.name === 'Browser' ? '#F59E0B' : '#6B7280'
    }));


    // --- FINAL CALCULATIONS ---
    const growth = yesterdayOrders === 0 ? 100 : ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100;
    const totalLocations = locationDist.InsideDhaka + locationDist.OutsideDhaka + locationDist.Other;
    const insidePct = totalLocations > 0 ? ((locationDist.InsideDhaka / totalLocations) * 100).toFixed(0) : 0;

    return {
      totalOrders: orders.length,
      totalRevenue,
      todayOrders,
      growth: growth.toFixed(1) + '%',
      growthDirection: growth >= 0 ? 'up' : 'down',
      chartData: chartDataArr,
      statusData: Object.entries(statusDist).map(([name, value]) => {
          const colors = { Processing: '#3B82F6', Shipped: '#A855F7', Delivered: '#22C55E', Cancelled: '#EF4444', Returned: '#F97316' };
          return { name, value, color: colors[name] || '#9CA3AF' };
      }).filter(i => i.value > 0),
      locationData: [
        { name: 'Inside Dhaka', value: locationDist.InsideDhaka, color: '#14B8A6' }, 
        { name: 'Outside Dhaka', value: locationDist.OutsideDhaka, color: '#F59E0B' }, 
      ],
      insidePct,
      // Tech Stats
      osData,
      modelData,
      androidVersions,
      appContextData
    };
  }, [orders, timeRange]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><Activity className="animate-pulse mr-2" /> Loading Analytics...</div>;

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
                className="appearance-none bg-gray-800 text-white text-sm font-medium border border-gray-700 rounded-lg py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700 transition-colors cursor-pointer shadow-lg"
            >
                <option value={7}>Last 7 Days</option>
                <option value={15}>Last 15 Days</option>
                <option value={30}>Last 30 Days</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Revenue" value={`${analytics?.totalRevenue.toLocaleString()} ৳`} icon={DollarSign}
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-400' }} trend="up" trendValue="+12%" 
        />
        <StatCard 
          title="Total Orders" value={analytics?.totalOrders} icon={Package}
          color={{ bg: 'bg-blue-500', text: 'text-blue-400' }}
        />
        <StatCard 
          title="Today's Volume" value={analytics?.todayOrders} icon={TrendingUp}
          color={{ bg: 'bg-purple-500', text: 'text-purple-400' }} trend={analytics?.growthDirection} trendValue={analytics?.growth}
        />
         <StatCard 
          title="Avg. Delivery" value="94%" icon={Truck} color={{ bg: 'bg-orange-500', text: 'text-orange-400' }}
        />
      </div>

      {/* MAIN CHART */}
      <div className="mb-6">
        <Card className="min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Order Volume Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.chartData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{fontSize: 11}} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9CA3AF" tick={{fontSize: 11}} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} fill="url(#colorOrders)" name="Total Orders" />
                <Area type="monotone" dataKey="delivered" stroke="#22C55E" strokeWidth={2} fill="none" name="Delivered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* GEOGRAPHY */}
        <Card className="min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Geography</h3>
                <MapPin size={18} className="text-gray-500" />
            </div>
            <div className="flex items-center gap-8 h-full">
                <div className="w-[180px] h-[180px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={analytics?.locationData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {analytics?.locationData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-3xl font-bold text-white">{analytics?.insidePct}%</span>
                        <span className="text-[10px] text-gray-500 uppercase">Dhaka</span>
                    </div>
                </div>
                <div className="flex-1 space-y-3">
                    {analytics?.locationData.map((item) => (
                        <div key={item.name} className="flex justify-between items-center p-3 rounded-lg bg-gray-900/40 border border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                                <span className="text-sm text-gray-300">{item.name}</span>
                            </div>
                            <span className="font-bold text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>

        {/* STATUS */}
        <Card className="min-h-[300px]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Order Status</h3>
                <Activity size={18} className="text-gray-500" />
            </div>
            <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.statusData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fill: '#9CA3AF', fontSize: 11}} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#374151', opacity: 0.4}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {analytics?.statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </div>

      {/* --- TECH INTELLIGENCE SECTION (NEW) --- */}
      <div className="mb-4 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
            <Cpu size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">Tech Intelligence</h2>
            <p className="text-sm text-gray-400">Device, OS, and Browser analytics derived from User Agents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         
         {/* 1. OS Market Share */}
         <Card className="col-span-1 lg:col-span-1 border-t-4 border-t-indigo-500">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-300 uppercase">OS Share</h3>
                <Smartphone size={16} className="text-gray-500" />
            </div>
            <div className="w-full h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={analytics?.osData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                            {analytics?.osData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xl font-bold text-white">{analytics?.osData[0]?.percentage}%</span>
                     <span className="text-[9px] text-gray-500 uppercase">{analytics?.osData[0]?.name}</span>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
                {analytics?.osData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                        {item.name}
                    </div>
                ))}
            </div>
         </Card>

         {/* 2. Top Device Models */}
         <Card className="col-span-1 lg:col-span-1 border-t-4 border-t-pink-500">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-300 uppercase">Top Devices</h3>
                <ShieldCheck size={16} className="text-gray-500" />
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                {analytics?.modelData.map((item, idx) => (
                    <div key={idx} className="group">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-white truncate max-w-[140px]" title={item.name}>
                                {idx+1}. {item.name}
                            </span>
                            <span className="text-[10px] text-gray-400">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                            <div 
                                className="h-1.5 rounded-full bg-pink-500 group-hover:bg-pink-400 transition-colors"
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
         </Card>

         {/* 3. Android Fragmentation */}
         <Card className="col-span-1 lg:col-span-1 border-t-4 border-t-emerald-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-300 uppercase">Android Versions</h3>
                <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">OS Health</div>
            </div>
            <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.androidVersions} layout="vertical" margin={{ left: 0, right: 20, top: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={70} tick={{fill: '#9CA3AF', fontSize: 10}} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#374151', opacity: 0.3}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16} fill="#10B981">
                            {analytics?.androidVersions.map((entry, index) => (
                                <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.15)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </Card>

         {/* 4. App Context (Where are they buying?) */}
         <Card className="col-span-1 lg:col-span-1 border-t-4 border-t-blue-500">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-300 uppercase">Traffic Source</h3>
                <Share2 size={16} className="text-gray-500" />
            </div>
             <div className="space-y-4">
                 {analytics?.appContextData.map((item) => (
                     <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/40 border border-gray-700/30">
                         <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${item.name.includes('Facebook') ? 'bg-blue-600/20 text-blue-400' : item.name.includes('Instagram') ? 'bg-pink-600/20 text-pink-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                 {item.name.includes('Browser') ? <Globe size={14} /> : <Share2 size={14} />}
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-white">{item.name}</p>
                                 <p className="text-[10px] text-gray-500">{item.value} users</p>
                             </div>
                         </div>
                         <span className="text-sm font-bold text-white">{item.percentage}%</span>
                     </div>
                 ))}
             </div>
         </Card>
      </div>

    </div>
  );
}