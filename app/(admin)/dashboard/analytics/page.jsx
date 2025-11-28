"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, 
  Package, DollarSign, Activity, MapPin, ChevronDown, 
  Smartphone, Cpu, Share2, Globe, ShieldCheck, CheckCircle, Send,
  Megaphone, Wallet, ShoppingBag
} from 'lucide-react';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { UAParser } from 'ua-parser-js'; 
import getAllOrders from '@/lib/getAllorders';

// --- CONFIGURATION: MODEL MAPPING ---
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
  <div className={`bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl flex flex-col ${className}`}>
    {children}
  </div>
);

// Improved Stat Card with Gradient Icons
const StatCard = ({ title, value, trend, trendValue, icon: Icon, theme = 'blue', isHero = false }) => {
  
  // Theme configurations for gradients and borders
  const themes = {
    blue: {
      iconBg: "from-blue-500/20 to-blue-600/5",
      iconText: "text-blue-400",
      border: "border-blue-500/20",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]"
    },
    green: {
      iconBg: "from-emerald-500/20 to-emerald-600/5",
      iconText: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]"
    },
    purple: {
      iconBg: "from-purple-500/20 to-purple-600/5",
      iconText: "text-purple-400",
      border: "border-purple-500/20",
      glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]"
    },
    orange: {
      iconBg: "from-orange-500/20 to-orange-600/5",
      iconText: "text-orange-400",
      border: "border-orange-500/20",
      glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]"
    },
    rose: {
      iconBg: "from-rose-500/20 to-rose-600/5",
      iconText: "text-rose-400",
      border: "border-rose-500/20",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]"
    }
  };

  const currentTheme = themes[theme] || themes.blue;

  return (
    <div className={`relative overflow-hidden group bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 ${isHero ? 'ring-1 ring-emerald-500/30 bg-emerald-900/10' : ''}`}>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-linear-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-white/10 transition-colors"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3.5 rounded-2xl bg-linear-to-br ${currentTheme.iconBg} ${currentTheme.iconText} border ${currentTheme.border} ${currentTheme.glow}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border backdrop-blur-sm ${
            trend === 'up' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
          <p className={`font-bold text-white tracking-tight ${isHero ? 'text-3xl' : 'text-2xl'}`}>
            {value}
          </p>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 p-4 rounded-xl shadow-2xl z-50">
        <p className="text-gray-400 text-xs mb-2 font-mono uppercase tracking-wider border-b border-gray-700 pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-1 last:mb-0">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: entry.color || entry.fill}}></div>
            <div className="flex justify-between w-full gap-6">
              <span className="text-sm font-medium text-gray-200">{entry.name}</span>
              <span className="text-sm font-bold text-white font-mono">{entry.value.toLocaleString()}</span>
            </div>
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

  return sorted.slice(0, topLimit);
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

    // --- CRITICAL CHANGE: FILTER OUT FAKE ORDERS ---
    // This ensures only real orders are used for ALL calculations below
    const validOrders = orders.filter(order => order.status !== 'Fake');
    
    // If no valid orders exist after filtering, handle gracefully
    if (validOrders.length === 0 && orders.length > 0) return {
        totalOrders: 0, rangeOrdersCount: 0, rangeRevenue: 0, rangeShippedCount: 0, 
        rangeDeliveredCount: 0, totalRevenue: 0, todayOrders: 0, growth: '0%', 
        growthDirection: 'flat', chartData: [], statusData: [], locationData: [], 
        marketingData: [], insidePct: 0, paidPct: 0, osData: [], modelData: [], 
        androidVersions: [], appContextData: []
    };

    const today = startOfDay(new Date());
    const cutoffDate = subDays(today, timeRange);

    // --- VARIABLES ---
    let totalRevenue = 0; 
    let rangeRevenue = 0; 
    let todayOrders = 0;
    let yesterdayOrders = 0;
    
    // Range Counters
    let rangeOrdersCount = 0;
    let rangeShippedCount = 0;
    let rangeDeliveredCount = 0;
    
    // Marketing Counters
    let paidCount = 0;
    let organicCount = 0;

    const statusDist = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Returned: 0 };
    const locationDist = { InsideDhaka: 0, OutsideDhaka: 0, Other: 0 };
    
    // --- TECH ANALYTICS STORAGE ---
    const uaDataList = [];

    // --- CHART DATA SKELETON ---
    const chartDataArr = Array.from({ length: timeRange }, (_, i) => {
      const d = subDays(today, timeRange - 1 - i);
      return { 
        date: format(d, 'MMM dd'), 
        fullDate: d, 
        orders: 0, 
        shipped: 0, 
        delivered: 0,
        cancelled: 0 
      };
    });

    // --- MAIN LOOP (Using validOrders) ---
    validOrders.forEach(order => {
      // 1. Parsing Dates
      const createdDate = new Date(order.createdAt);
      const shippedDate = order.shippedAt ? new Date(order.shippedAt) : null;
      const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : null;
      
      const isCreatedInRange = createdDate >= cutoffDate;

      // 2. Revenue Calculation
      const orderValue = parseFloat(order.totalValue) || 0;
      totalRevenue += orderValue; 

      // 3. Growth Metrics 
      if (isSameDay(createdDate, today)) todayOrders++;
      if (isSameDay(createdDate, subDays(today, 1))) yesterdayOrders++;

      // 4. CHART POPULATION & RANGE COUNTS
      
      // A. Order Creation Logic
      if (isCreatedInRange) {
         rangeOrdersCount++;
         rangeRevenue += orderValue;

         const dayStat = chartDataArr.find(d => isSameDay(d.fullDate, createdDate));
         if (dayStat) dayStat.orders += 1;

         // Location
         const shippingCost = parseFloat(order.shippingCost) || 0;
         if (shippingCost === 60) locationDist.InsideDhaka++;
         else if (shippingCost === 99) locationDist.OutsideDhaka++;
         else locationDist.Other++;

         // Status
         const status = order.status || 'Processing';
         if (statusDist[status] !== undefined) statusDist[status]++;
         else statusDist['Processing']++;

         // --- PAID VS ORGANIC LOGIC ---
         const marketing = order.marketing;
         const isPaid = !marketing || marketing.utm_medium === 'paid';

         if (isPaid) {
            paidCount++;
         } else {
            organicCount++;
         }
      }

      // B. Shipped Logic 
      if (shippedDate && shippedDate >= cutoffDate) {
        rangeShippedCount++;
        const dayStat = chartDataArr.find(d => isSameDay(d.fullDate, shippedDate));
        if (dayStat) dayStat.shipped += 1;
      }

      // C. Delivered Logic 
      if (deliveredDate && deliveredDate >= cutoffDate) {
        rangeDeliveredCount++;
        const dayStat = chartDataArr.find(d => isSameDay(d.fullDate, deliveredDate));
        if (dayStat) dayStat.delivered += 1;
      }

      // 5. UA Parsing 
      const uaString = order.clientInfo?.userAgent || order.userAgent || '';
      if (uaString) {
        const parser = new UAParser(uaString);
        const res = parser.getResult();
        
        const rawModel = res.device.model;
        const marketingName = DEVICE_CODEX[rawModel] || rawModel || 'Generic';
        
        let appType = 'Browser';
        if (uaString.includes('FB_IAB') || uaString.includes('FB4A')) appType = 'Facebook App';
        else if (uaString.includes('Instagram')) appType = 'Instagram App';
        else if (uaString.includes('wv') || (res.os.name === 'Android' && uaString.includes('Version/'))) appType = 'WebView';

        uaDataList.push({
          os: res.os.name || 'Desktop',
          osVersion: res.os.version, 
          vendor: res.device.vendor || 'Unknown',
          model: marketingName,
          browser: res.browser.name,
          appType: appType
        });
      }
    });

    // --- AGGREGATE TECH DATA ---
    const osData = aggregateCounts(uaDataList, (item) => item.os, 4).map(i => ({
      ...i, 
      color: i.name === 'Android' ? '#10B981' : i.name === 'iOS' ? '#94A3B8' : i.name === 'Windows' ? '#3B82F6' : '#6366F1'
    }));

    const modelData = aggregateCounts(uaDataList.filter(i => i.model !== 'Generic'), (item) => item.model, 6);
    
    const androidVersions = aggregateCounts(uaDataList.filter(i => i.os === 'Android'), (item) => {
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
    
    const totalMarketing = paidCount + organicCount;
    const paidPct = totalMarketing > 0 ? ((paidCount / totalMarketing) * 100).toFixed(0) : 0;

    return {
      totalOrders: validOrders.length, // Uses only valid count
      rangeOrdersCount,
      rangeRevenue, 
      rangeShippedCount,
      rangeDeliveredCount,
      totalRevenue,
      todayOrders,
      growth: growth.toFixed(1) + '%',
      growthDirection: growth >= 0 ? 'up' : 'down',
      chartData: chartDataArr,
      statusData: Object.entries(statusDist).map(([name, value]) => {
          const colors = { Processing: '#3B82F6', Shipped: '#A855F7', Delivered: '#10B981', Cancelled: '#EF4444', Returned: '#F97316' };
          return { name, value, color: colors[name] || '#9CA3AF' };
      }).filter(i => i.value > 0),
      locationData: [
        { name: 'Inside Dhaka', value: locationDist.InsideDhaka, color: '#14B8A6' }, 
        { name: 'Outside Dhaka', value: locationDist.OutsideDhaka, color: '#F59E0B' }, 
      ],
      marketingData: [
        { name: 'Paid Ads', value: paidCount, color: '#F43F5E' }, 
        { name: 'Organic', value: organicCount, color: '#10B981' }
      ],
      insidePct,
      paidPct,
      osData,
      modelData,
      androidVersions,
      appContextData
    };
  }, [orders, timeRange]);

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-white"><Activity className="animate-pulse mr-2" /> Loading Analytics...</div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-4 md:p-8 font-sans w-full">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Overview for the last <span className="text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-md">{timeRange} days</span>.
          </p>
        </div>
        
        {/* Custom Date Picker UI */}
        <div className="relative group min-w-[180px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Calendar size={16} className="text-blue-400" />
            </div>
            <select 
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="w-full appearance-none bg-gray-800/80 backdrop-blur border border-gray-700 hover:border-blue-500/50 rounded-xl py-3 pl-10 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer shadow-lg"
            >
                <option value={7}>Last 7 Days</option>
                <option value={15}>Last 15 Days</option>
                <option value={30}>Last 30 Days</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </header>

      {/* KPI CARDS (Updated Icons & UI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`৳${analytics?.rangeRevenue?.toLocaleString() || 0}`} 
          icon={Wallet}
          theme="green"
          isHero={true}
        />
        <StatCard 
          title="Orders" 
          value={analytics?.rangeOrdersCount} 
          icon={ShoppingBag}
          theme="blue"
        />
        <StatCard 
          title="Shipped" 
          value={analytics?.rangeShippedCount} 
          icon={Send}
          theme="purple"
        />
        <StatCard 
          title="Delivered" 
          value={analytics?.rangeDeliveredCount} 
          icon={CheckCircle}
          theme="green"
        />
        <StatCard 
          title="Today's Volume" 
          value={analytics?.todayOrders} 
          icon={Activity}
          theme="orange"
          trend={analytics?.growthDirection} 
          trendValue={analytics?.growth}
        />
      </div>

      {/* MAIN CHART */}
      <div className="mb-8">
        <Card className="min-h-[420px]">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-lg font-bold text-white">Performance Trend</h3>
                <p className="text-xs text-gray-500 mt-1">Order lifecycle metrics over time</p>
             </div>
             <div className="flex gap-2">
               {['Orders', 'Shipped', 'Delivered'].map(status => (
                 <div key={status} className="flex items-center gap-2 px-3 py-1 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <div className={`w-2 h-2 rounded-full ${status === 'Orders' ? 'bg-blue-500' : status === 'Shipped' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
                    <span className="text-xs font-medium text-gray-300">{status}</span>
                 </div>
               ))}
             </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorShipped" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" tick={{fontSize: 11, fontWeight: 500}} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="#6B7280" tick={{fontSize: 11, fontWeight: 500}} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                
                <Area type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={3} fill="url(#colorOrders)" activeDot={{r: 6, strokeWidth: 0}} />
                <Area type="monotone" dataKey="shipped" stroke="#A855F7" strokeWidth={3} fill="url(#colorShipped)" activeDot={{r: 6, strokeWidth: 0}} />
                <Area type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={3} fill="url(#colorDelivered)" activeDot={{r: 6, strokeWidth: 0}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* SECONDARY STATS - 3 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* 1. GEOGRAPHY */}
        <Card className="min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Geography</h3>
                <div className="p-2 bg-gray-700/30 rounded-lg"><MapPin size={16} className="text-gray-400" /></div>
            </div>
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-48 h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={analytics?.locationData} innerRadius={60} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
                                {analytics?.locationData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-3xl font-bold text-white tracking-tighter">{analytics?.insidePct}%</span>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">Inside Dhaka</span>
                    </div>
                </div>
                <div className="flex gap-6">
                    {analytics?.locationData.map((item) => (
                         <div key={item.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-medium">{item.name}</span>
                                <span className="text-lg font-bold text-white">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>

        {/* 2. ACQUISITION SOURCE */}
        <Card className="min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Traffic Source</h3>
                <div className="p-2 bg-gray-700/30 rounded-lg"><Megaphone size={16} className="text-gray-400" /></div>
            </div>
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-48 h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={analytics?.marketingData} innerRadius={60} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
                                {analytics?.marketingData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-3xl font-bold text-white tracking-tighter">{analytics?.paidPct}%</span>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">Paid Ads</span>
                    </div>
                </div>
                <div className="flex gap-6">
                    {analytics?.marketingData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-medium">{item.name}</span>
                                <span className="text-lg font-bold text-white">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>

        {/* 3. STATUS */}
        <Card className="min-h-[300px]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Order Status</h3>
                <div className="p-2 bg-gray-700/30 rounded-lg"><Package size={16} className="text-gray-400" /></div>
            </div>
            <div className="w-full h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.statusData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#374151', opacity: 0.2}} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                            {analytics?.statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>

      </div>

      {/* --- TECH INTELLIGENCE SECTION --- */}
      <div className="mb-6 flex items-center gap-4">
        <div className="p-3 bg-linear-to-br from-indigo-500/20 to-purple-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Cpu size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">Tech Intelligence</h2>
            <p className="text-sm text-gray-400">Device, OS, and Browser analytics derived from User Agents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {/* OS Market Share */}
         <Card className="col-span-1 lg:col-span-1 border-t-4 border-t-indigo-500">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">OS Share</h3>
                <Smartphone size={16} className="text-gray-500" />
            </div>
            <div className="w-full h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={analytics?.osData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                            {analytics?.osData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xl font-bold text-white">{analytics?.osData[0]?.percentage || 0}%</span>
                     <span className="text-[10px] text-gray-500 uppercase font-bold">{analytics?.osData[0]?.name || 'N/A'}</span>
                </div>
            </div>
         </Card>

         {/* Top Device Models */}
         <Card className="col-span-1 lg:col-span-1 border-t-4 border-t-rose-500">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Top Devices</h3>
                <ShieldCheck size={16} className="text-gray-500" />
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                {analytics?.modelData.map((item, idx) => (
                    <div key={idx} className="group">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-medium text-white truncate max-w-[140px]" title={item.name}>
                                {idx+1}. {item.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700/30 rounded-full h-1.5">
                            <div 
                                className="h-1.5 rounded-full bg-rose-500 group-hover:bg-rose-400 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
         </Card>

         {/* Android Fragmentation */}
         <Card className="col-span-1 lg:col-span-1 border-t-4 border-t-emerald-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Android Versions</h3>
                <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">Health</div>
            </div>
            <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.androidVersions} layout="vertical" margin={{ left: 0, right: 20, top: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={70} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 500}} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#374151', opacity: 0.3}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14} fill="#10B981">
                            {analytics?.androidVersions.map((entry, index) => (
                                <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.15)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </Card>

         {/* App Context */}
         <Card className="col-span-1 lg:col-span-1 border-t-4 border-t-blue-500">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Platform</h3>
                <Share2 size={16} className="text-gray-500" />
            </div>
             <div className="space-y-3">
                 {analytics?.appContextData.map((item) => (
                     <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30 border border-gray-700/30 hover:bg-gray-800/50 transition-colors">
                         <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${item.name.includes('Facebook') ? 'bg-blue-600/20 text-blue-400' : item.name.includes('Instagram') ? 'bg-pink-600/20 text-pink-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                 {item.name.includes('Browser') ? <Globe size={14} /> : <Share2 size={14} />}
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-white">{item.name}</p>
                                 <p className="text-[10px] text-gray-500">{item.value} users</p>
                             </div>
                         </div>
                         <span className="text-xs font-bold text-gray-300 bg-gray-700/50 px-2 py-1 rounded-md">{item.percentage}%</span>
                     </div>
                 ))}
             </div>
         </Card>
      </div>

    </div>
  );
}