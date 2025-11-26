"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  CheckCircle,
  CircleDot,
  MapPin,
  Clock,
  XCircle,
  RotateCcw,
  Eye,
  X,
  User,
  Phone,
  Calendar,
  DollarSign,
  PhoneCall,
  PhoneOff,
  Check,
  Monitor,
  Smartphone,
  Globe,
  Cpu,
  Share2,
  Zap,
  LayoutTemplate,
  Info,
  ShieldCheck,
  AlertTriangle,
  ArrowLeftCircle,
  StickyNote,
  Save,
  Edit, // <--- Imported Edit icon
} from "lucide-react";
import { UAParser } from "ua-parser-js";

// --- CONFIGURATION ---
const ACTION_OPTIONS = [
  { label: "Processing", value: "Processing" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancel", value: "Cancelled" },
  { label: "Return", value: "Returned" },
  { label: "⚠️ Send to Abandoned", value: "Abandoned" },
];

const CALL_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "No Answer", value: "No Answer" },
];

const SHIPPING_METHOD_OPTIONS = [
  { label: "Inside Dhaka", value: "Inside Dhaka", cost: 60 },
  { label: "Outside Dhaka", value: "Outside Dhaka", cost: 99 },
];

// --- HELPER: MODEL MAPPING ---
const DEVICE_CODEX = {
  "23129RAA4G": "Redmi Note 13 5G",
  "23124RA7EO": "Redmi Note 13 4G",
  "SM-S918B": "Galaxy S23 Ultra",
  "SM-S908B": "Galaxy S22 Ultra",
  "iPhone16,1": "iPhone 15 Pro",
  "iPhone16,2": "iPhone 15 Pro Max",
};

// --- ADVANCED USER AGENT PARSER ---
const getDeepUserAgentInfo = (uaString) => {
  if (!uaString) return null;
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  const rawModel = result.device.model || "";
  const marketingName = DEVICE_CODEX[rawModel] || rawModel || "Unknown Device";
  const vendor = result.device.vendor || "Generic";

  let appSource = {
    name: "External Browser",
    code: "Browser",
    version: result.browser.version,
    insight: "User is browsing via a standard web browser.",
  };

  if (uaString.includes("FB_IAB") || uaString.includes("FB4A")) {
    const fbavMatch = uaString.match(/FBAV\/([\d.]+)/);
    appSource = {
      name: "Facebook App",
      code: "FB_IAB",
      version: fbavMatch ? fbavMatch[1] : "Unknown",
      insight: "User clicked a link inside the Facebook App.",
    };
  } else if (uaString.includes("Instagram")) {
    appSource = {
      name: "Instagram App",
      code: "Instagram",
      version: "Latest",
      insight: "User came from Instagram.",
    };
  }

  const isWebView =
    uaString.includes("wv") ||
    (result.os.name === "Android" && uaString.includes("Version/"));

  const environment = {
    type: isWebView ? "WebView (In-App)" : "Standalone Browser",
    code: isWebView ? "wv" : "Standard",
    insight: isWebView
      ? "Viewing inside another app."
      : "Using a dedicated browser.",
  };

  const summary = `${vendor} ${marketingName}, ${result.os.name}. Source: ${appSource.name}.`;

  return {
    raw: result,
    device: {
      marketingName,
      rawModel,
      vendor,
      os: `${result.os.name} ${result.os.version}`,
    },
    browser: {
      name: result.browser.name,
      engine: result.engine.name,
      version: result.browser.version,
    },
    appSource,
    environment,
    summary,
  };
};

// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Processing: { icon: <CircleDot size={14} />, color: "bg-blue-600" },
    Shipped: { icon: <Truck size={14} />, color: "bg-purple-600" },
    Delivered: { icon: <CheckCircle size={14} />, color: "bg-green-600" },
    Cancelled: { icon: <XCircle size={14} />, color: "bg-red-600" },
    Returned: { icon: <RotateCcw size={14} />, color: "bg-orange-600" },
    Abandoned: { icon: <AlertTriangle size={14} />, color: "bg-yellow-600" },
  };
  const config = statusConfig[status] || statusConfig.Processing;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white ${config.color} shadow-sm`}
    >
      {config.icon}
      {status}
    </span>
  );
};

const CallStatusDropdown = ({ currentStatus, onStatusChange }) => {
  const statusStyles = {
    Confirmed:
      "border-green-500/50 bg-green-500/20 text-green-200 focus:border-green-500",
    "No Answer":
      "border-red-500/50 bg-red-500/20 text-red-200 focus:border-red-500",
    Pending:
      "border-yellow-500/50 bg-yellow-500/20 text-yellow-200 focus:border-yellow-500",
  };
  const currentStyle = statusStyles[currentStatus] || statusStyles["Pending"];

  const getIcon = () => {
    if (currentStatus === "Confirmed") return <Check size={12} />;
    if (currentStatus === "No Answer") return <PhoneOff size={12} />;
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
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <div
        className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 opacity-80 text-currentColor`}
      >
        {getIcon()}
      </div>
    </div>
  );
};

const ActionDropdown = ({ currentStatus, onStatusChange }) => {
  const statusStyles = {
    Shipped:
      "border-purple-500/50 bg-purple-900/20 text-purple-200 focus:border-purple-500 focus:ring-purple-500",
    Delivered:
      "border-green-500/50 bg-green-900/20 text-green-200 focus:border-green-500 focus:ring-green-500",
    Cancelled:
      "border-red-500/50 bg-red-900/20 text-red-200 focus:border-red-500 focus:ring-red-500",
    Returned:
      "border-orange-500/50 bg-orange-900/20 text-orange-200 focus:border-orange-500 focus:ring-orange-500",
    Abandoned:
      "border-yellow-500/50 bg-yellow-900/20 text-yellow-200 focus:border-yellow-500 focus:ring-yellow-500",
    Default:
      "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500",
  };
  const currentStyle = statusStyles[currentStatus] || statusStyles.Default;

  return (
    <div className="relative w-40">
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`appearance-none w-full rounded-md border py-1.5 pl-3 pr-8 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 ${currentStyle}`}
      >
        {ACTION_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 text-currentColor`}
      />
    </div>
  );
};

const ShippingMethodDropdown = ({ currentMethod, onMethodChange }) => {
  const methodStyles = {
    "Inside Dhaka":
      "border-green-500/50 bg-green-900/20 text-green-200 focus:border-green-500 focus:ring-green-500",
    "Outside Dhaka":
      "border-orange-500/50 bg-orange-900/20 text-orange-200 focus:border-orange-500 focus:ring-orange-500",
    Default:
      "border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500",
  };
  const currentStyle = methodStyles[currentMethod] || methodStyles.Default;

  return (
    <div className="relative w-40">
      <select
        value={currentMethod}
        onChange={(e) => onMethodChange(e.target.value)}
        className={`appearance-none w-full rounded-md border py-1.5 pl-3 pr-8 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 ${currentStyle}`}
      >
        {SHIPPING_METHOD_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 text-currentColor`}
      />
    </div>
  );
};

// --- ABANDON CONFIRMATION MODAL ---
const AbandonConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  customerName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl transform scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 mb-4">
            <ArrowLeftCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Move to Abandoned?
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Are you sure you want to move <strong>{customerName}</strong> back
            to the Abandoned list?
            <br />
            <br />
            <span className="text-xs text-red-400">
              This will remove it from this dashboard.
            </span>
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Yes, Move
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NOTE MODAL COMPONENT ---
const NoteModal = ({ isOpen, onClose, onSave, order, initialNote }) => {
  const [noteText, setNoteText] = useState("");

  // Reset text when modal opens
  useEffect(() => {
    if (isOpen) {
      setNoteText(initialNote || "");
    }
  }, [isOpen, initialNote]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
              <StickyNote size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Order Note</h3>
              <p className="text-xs text-gray-400">For {order.customer.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">
          <label className="block text-sm text-gray-400 mb-2">
            Special instructions or details:
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full h-32 bg-gray-950 border border-gray-700 rounded-lg p-3 text-gray-200 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none"
            placeholder="e.g. Customer requested price reduction, deliver after 5PM..."
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(order.id, noteText)}
              className="flex-1 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 font-bold transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- UPDATED ORDER MODAL ---
const OrderModal = ({
  order,
  onClose,
  onStatusChange,
  onCallStatusChange,
  onShippingMethodChange,
  onPriceChange, // <--- New prop for price update
}) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(order?.totalValue || 0);

  useEffect(() => {
    setTempPrice(order?.totalValue || 0);
  }, [order]);

  const handleSavePrice = () => {
    if (tempPrice < 0) return;
    onPriceChange(tempPrice);
    setIsEditingPrice(false);
  };

  if (!order) return null;
  const uaData = getDeepUserAgentInfo(
    order.clientInfo?.userAgent || order.userAgent || ""
  );

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
              <p className="text-sm text-blue-400 font-mono">
                #{order.orderId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
          {/* LEFT COLUMN: Basic Order Info */}
          <div className="space-y-6">
            {/* Display Note if exists inside Details too */}
            {order.note && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 flex gap-3">
                <StickyNote className="text-yellow-500 shrink-0" size={20} />
                <div>
                  <h4 className="text-yellow-500 font-bold text-xs uppercase tracking-wider mb-1">
                    Special Note
                  </h4>
                  <p className="text-gray-200 text-sm italic">"{order.note}"</p>
                </div>
              </div>
            )}

            {/* Customer */}
            <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Customer
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border border-gray-700">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-white">
                      {order.customer.name}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border border-gray-700">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-white">
                        {order.customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 border border-gray-700">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-white text-xs">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Finance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 flex flex-col">
                <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Delivery
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    {order.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-200 w-fit">
                      {order.shippingMethod}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        order.shippingCost === 60
                          ? "text-green-400"
                          : "text-orange-400"
                      }`}
                    >
                      ({order.shippingCost}৳)
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENT CARD WITH EDIT FUNCTIONALITY */}
              <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 flex flex-col">
                <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
                  <DollarSign size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Payment
                  </span>
                </div>
                <div className="p-4 flex-1 space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Subtotal</span>
                    {/* Dynamically calculate subtotal even during edit if needed, or just keep as static derived */}
                    <span>{order.totalValue - order.shippingCost}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Shipping</span>
                    <span>{order.shippingCost}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                    <span className="text-sm font-bold text-white">Total</span>
                    {isEditingPrice ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          className="w-20 bg-gray-950 border border-blue-500 rounded px-2 py-0.5 text-sm text-right text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSavePrice}
                          className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPrice(false);
                            setTempPrice(order.totalValue);
                          }}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 text-sm font-bold">
                          {order.totalValue} ৳
                        </span>
                        <button
                          onClick={() => setIsEditingPrice(true)}
                          className="text-gray-500 hover:text-white transition-colors"
                          title="Edit Price"
                        >
                          <Edit size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Digital ID Card */}
          <div className="space-y-3">
            {uaData ? (
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="p-5 border-b border-gray-700/50 flex gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 shrink-0 shadow-inner">
                    <Smartphone size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Device
                    </h4>
                    <p className="text-lg font-bold text-white tracking-tight">
                      {uaData.device.vendor}{" "}
                      <span className="text-blue-400">
                        {uaData.device.marketingName}
                      </span>
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-900/20 text-green-400 text-xs font-medium border border-green-900/50">
                      <Zap size={10} fill="currentColor" /> {uaData.device.os}
                    </div>
                  </div>
                </div>
                <div className="p-5 border-b border-gray-700/50 flex gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 shrink-0 shadow-inner">
                    <Share2 size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Source
                    </h4>
                    <p
                      className={`text-lg font-bold ${
                        uaData.appSource.name.includes("Facebook")
                          ? "text-blue-400"
                          : "text-white"
                      }`}
                    >
                      {uaData.appSource.name}
                    </p>
                    <p className="text-xs text-gray-300 italic mt-1">
                      "{uaData.appSource.insight}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-500">
                No Digital Footprint Data
              </div>
            )}
          </div>
        </div>

        {/* Footer: Action Buttons */}
        <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 shrink-0">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-700 hover:text-white transition-all"
            >
              Close
            </button>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
                <span className="text-xs font-medium text-gray-400 pl-2">
                  Shipping:
                </span>
                <ShippingMethodDropdown
                  currentMethod={order.shippingMethod}
                  onMethodChange={onShippingMethodChange}
                />
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
                <span className="text-xs font-medium text-gray-400 pl-2">
                  Call Status:
                </span>
                <CallStatusDropdown
                  currentStatus={order.callStatus}
                  onStatusChange={onCallStatusChange}
                />
              </div>
              <div className="flex items-center gap-3 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50">
                <span className="text-xs font-medium text-gray-400 pl-2">
                  Action:
                </span>
                <ActionDropdown
                  currentStatus={order.status}
                  onStatusChange={onStatusChange}
                />
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
  if (shippingCost === 60)
    return { location: "Inside Dhaka", color: "text-green-400" };
  if (shippingCost === 99)
    return { location: "Outside Dhaka", color: "text-orange-400" };
  return { location: "N/A", color: "text-gray-400" };
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  if (isNaN(seconds) || seconds < 0) return "Just now";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Abandon State
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [orderToAbandon, setOrderToAbandon] = useState(null);

  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteOrder, setNoteOrder] = useState(null);

  // Status filter state
  const [statusFilter, setStatusFilter] = useState(null);

  // COLLAPSIBLE STATE (Only for the Status Widgets now)
  const [isStatusWidgetOpen, setIsStatusWidgetOpen] = useState(false);

  // Calculate Status Counts
  const statusCounts = useMemo(() => {
    const counts = {
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0,
    };
    orders.forEach((order) => {
      if (counts[order.status] !== undefined) counts[order.status]++;
      else counts.Processing++;
    });
    return counts;
  }, [orders]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          "https://profit-first-server.vercel.app/orders"
        );
        const data = await res.json();
        const transformedData = data.map((order, index) => ({
          id: order._id || index,
          customer: { name: order.name || "N/A", phone: order.number || "N/A" },
          address: order.address || "N/A",
          shippingMethod: order.shipping || "N/A",
          shippingCost: order.shippingCost || 0,
          totalValue: order.totalValue || 0,
          status: order.status || "Processing",
          callStatus: order.phoneCallStatus || "Pending",
          orderId: order.orderId,
          clientInfo: order.clientInfo || {},
          userAgent: order.clientInfo?.userAgent || order.userAgent || "",
          date: order.createdAt || new Date().toISOString(),
          note: order.note || "",
        }));

        setOrders(transformedData);

        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        setStats({
          today: transformedData.filter((o) => new Date(o.date) >= today)
            .length,
          yesterday: transformedData.filter((o) => {
            const d = new Date(o.date);
            return d >= yesterday && d < today;
          }).length,
          thisMonth: transformedData.filter(
            (o) => new Date(o.date) >= startOfMonth
          ).length,
        });
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };
    fetchOrders();
  }, []);

  // --- HANDLERS ---
  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "Abandoned") {
      const order = orders.find((o) => o.id === id);
      if (order) {
        setOrderToAbandon(order);
        setShowAbandonConfirm(true);
      }
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder?.id === id)
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));

    try {
      await fetch(`https://profit-first-server.vercel.app/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const proceedWithAbandon = async () => {
    if (!orderToAbandon) return;

    if (
      typeof orderToAbandon.id === "number" ||
      orderToAbandon.id.length < 10
    ) {
      alert("Error: Invalid Order ID. Cannot migrate.");
      return;
    }

    try {
      const res = await fetch(
        `https://profit-first-server.vercel.app/orders/${orderToAbandon.id}/move-to-abandoned`,
        {
          method: "POST",
        }
      );

      const contentType = res.headers.get("content-type");
      if (
        !res.ok ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        const text = await res.text();
        console.error("Migration Failed. Server Response:", text);
        alert(
          `Server returned status ${res.status}. Please check console for details.`
        );
        return;
      }

      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderToAbandon.id));
        setShowAbandonConfirm(false);
        setOrderToAbandon(null);
        setSelectedOrder(null);
        alert("Order moved to Abandoned successfully");
      } else {
        alert(data.message || "Failed to move order");
      }
    } catch (error) {
      console.error("Error moving to abandoned:", error);
      alert("A network or server error occurred. Check console.");
    }
  };

  const handleCallStatusChange = async (id, newCallStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, callStatus: newCallStatus } : o))
    );
    if (selectedOrder?.id === id)
      setSelectedOrder((prev) => ({ ...prev, callStatus: newCallStatus }));

    try {
      await fetch(
        `https://profit-first-server.vercel.app/orders/${id}/call-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callStatus: newCallStatus }),
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleShippingMethodChange = async (id, newMethod) => {
    const selectedOption = SHIPPING_METHOD_OPTIONS.find(
      (option) => option.value === newMethod
    );
    if (!selectedOption) return;
    const newCost = selectedOption.cost;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              shippingMethod: newMethod,
              shippingCost: newCost,
              totalValue: o.totalValue - o.shippingCost + newCost,
            }
          : o
      )
    );
    if (selectedOrder?.id === id)
      setSelectedOrder((prev) => ({
        ...prev,
        shippingMethod: newMethod,
        shippingCost: newCost,
        totalValue: prev.totalValue - prev.shippingCost + newCost,
      }));

    try {
      await fetch(
        `https://profit-first-server.vercel.app/orders/${id}/shipping-method`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shippingMethod: newMethod,
            shippingCost: newCost,
          }),
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  // --- NEW PRICE CHANGE HANDLER ---
  const handlePriceChange = async (id, newPrice) => {
    const price = Number(newPrice);
    if (isNaN(price)) return;

    // Optimistically update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, totalValue: price } : o))
    );

    // Update selected order if open
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => ({
        ...prev,
        totalValue: price,
      }));
    }

    try {
      // Assuming a standard endpoint for price update exists or is handled here
      await fetch(
        `https://profit-first-server.vercel.app/orders/${id}/price`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalValue: price }),
        }
      );
    } catch (e) {
      console.error("Failed to update price", e);
    }
  };

  const handleSaveNote = async (id, noteText) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, note: noteText } : o))
    );
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => ({ ...prev, note: noteText }));
    }
    setIsNoteModalOpen(false);
    setNoteOrder(null);

    try {
      await fetch(`https://profit-first-server.vercel.app/orders/${id}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText }),
      });
    } catch (e) {
      console.error("Failed to save note", e);
      alert("Failed to save note to server");
    }
  };

  const openNoteModal = (order) => {
    setNoteOrder(order);
    setIsNoteModalOpen(true);
  };

  const handleStatusWidgetClick = (statusKey) => {
    if (statusFilter === statusKey) {
      setStatusFilter(null);
    } else {
      setStatusFilter(statusKey);
    }
    setCurrentPage(1);
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(
      (o) =>
        o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer?.phone?.includes(searchTerm) ||
        o.id?.toString().includes(searchTerm)
    );

    if (statusFilter) {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
    return filtered;
  }, [orders, searchTerm, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, filteredOrders.length);

  const statusWidgets = [
    {
      label: "Processing",
      key: "Processing",
      icon: CircleDot,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Shipped",
      key: "Shipped",
      icon: Truck,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Delivered",
      key: "Delivered",
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: "Cancelled",
      key: "Cancelled",
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      label: "Returned",
      key: "Returned",
      icon: RotateCcw,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
  ];

  return (
    <div className="inter-font bg-gray-900 text-gray-100 min-h-screen p-4 md:p-8 relative">
      <style>{`.inter-font { font-family: "Inter", sans-serif; } .custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }`}</style>

      <AbandonConfirmationModal
        isOpen={showAbandonConfirm}
        onClose={() => setShowAbandonConfirm(false)}
        onConfirm={proceedWithAbandon}
        customerName={orderToAbandon?.customer?.name || "Customer"}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        order={noteOrder}
        initialNote={noteOrder?.note}
      />

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(val) => handleStatusChange(selectedOrder.id, val)}
          onCallStatusChange={(val) =>
            handleCallStatusChange(selectedOrder.id, val)
          }
          onShippingMethodChange={(val) =>
            handleShippingMethodChange(selectedOrder.id, val)
          }
          onPriceChange={(val) => handlePriceChange(selectedOrder.id, val)}
        />
      )}

      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Book Order Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your orders and shipments efficiently.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          <Clock size={14} />
          {currentTime.toLocaleString()}
        </div>
      </header>

      {/* STATISTICS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Today's", value: stats.today },
          { label: "Yesterday's", value: stats.yesterday },
          { label: "This Month's", value: stats.thisMonth },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg hover:border-gray-600 transition-colors"
          >
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
              {s.label}
            </h3>
            <p className="text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Mobile Collapsible View for Status Widgets */}
      <div className="md:hidden bg-gray-800 rounded-xl border border-gray-700 mb-6 overflow-hidden">
        <button
          onClick={() => setIsStatusWidgetOpen(!isStatusWidgetOpen)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <CircleDot size={20} className="text-gray-400" />
            <span className="font-medium text-white">Order Status</span>
          </div>
          {isStatusWidgetOpen ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </button>
        {isStatusWidgetOpen && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {statusWidgets.map((w) => {
                const Icon = w.icon;
                const isActive = statusFilter === w.key;
                return (
                  <div
                    key={w.key}
                    onClick={() => handleStatusWidgetClick(w.key)}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? `${w.border} ${w.bg} ring-2 ring-white/20`
                        : `${w.border} ${w.bg} hover:border-white/50`
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg bg-gray-900/50 ${w.color} shadow-sm`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">
                        {w.label}
                      </p>
                      <p className="text-xl font-bold text-white">
                        {statusCounts[w.key] || 0}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Grid View for Status Widgets */}
      <div className="hidden md:grid md:grid-cols-5 gap-3 mb-6">
        {statusWidgets.map((w) => {
          const Icon = w.icon;
          const isActive = statusFilter === w.key;
          return (
            <div
              key={w.key}
              onClick={() => handleStatusWidgetClick(w.key)}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                isActive
                  ? `${w.border} ${w.bg} ring-2 ring-white/20`
                  : `${w.border} ${w.bg} hover:border-white/50`
              }`}
            >
              <div
                className={`p-2.5 rounded-lg bg-gray-900/50 ${w.color} shadow-sm`}
              >
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase">
                  {w.label}
                </p>
                <p className="text-2xl font-bold text-white">
                  {statusCounts[w.key] || 0}
                </p>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Filter Indicator */}
      {statusFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-400">Active filter:</span>
          <StatusBadge status={statusFilter} />
          <button
            onClick={() => setStatusFilter(null)}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* SEARCH SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 mb-5">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inter-font w-full rounded-lg border border-gray-600 bg-gray-900 py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <label className="text-sm text-gray-400">Rows per page:</label>
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="inter-font appearance-none rounded-md border border-gray-600 bg-gray-900 py-1.5 pl-3 pr-8 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="inter-font min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/50">
              <tr>
                {[
                  "Order ID",
                  "View / Note",
                  "Customer",
                  "Time Ago",
                  "Address",
                  "Shipping",
                  "Total",
                  "Status",
                  "Call",
                  "Action",
                ].map((head) => (
                  <th
                    key={head}
                    scope="col"
                    className="py-4 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const { location, color } = getShippingLocation(
                    order.shippingCost
                  );
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="whitespace-nowrap py-4 px-4 text-sm font-mono text-blue-400">
                        #{order.orderId}
                      </td>
                      <td className="whitespace-nowrap py-4 px-4">
                        <div className="flex items-center gap-2">
                          {/* VIEW BUTTON WITH INDICATOR */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all relative"
                            title="View Details"
                          >
                            <Eye size={18} />
                            {order.note && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                              </span>
                            )}
                          </button>
                          {/* NOTE BUTTON WITH INDICATOR */}
                          <button
                            onClick={() => openNoteModal(order)}
                            className={`p-2 rounded-lg transition-all border ${
                              order.note
                                ? "bg-yellow-500 text-black border-yellow-400 hover:bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                : "bg-gray-700 text-gray-400 border-transparent hover:bg-gray-600 hover:text-white"
                            }`}
                            title={order.note ? "Edit Note" : "Add Note"}
                          >
                            <StickyNote
                              size={18}
                              fill={order.note ? "currentColor" : "none"}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <div className="font-medium text-white">
                          {order.customer?.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          <span className="hidden lg:block md:block">{order.customer?.phone}</span>
                          <a
                            href={`tel:${order.customer?.phone}`}
                            className="text-xs text-gray-400 mt-0.5 hover:text-blue-500 hover:underline cursor-pointer block lg:hidden md:hidden"
                          >
                            {order.customer?.phone}
                          </a>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1.5 text-xs bg-gray-900/50 px-2 py-1 rounded border border-gray-700 w-fit">
                          <Clock size={12} />
                          {formatTimeAgo(order.date)}
                        </div>
                      </td>
                      <td
                        className="py-4 px-4 text-sm text-gray-300 max-w-xs truncate"
                        title={order.address}
                      >
                        {order.address}
                      </td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <div className="text-white font-medium">
                          {order.shippingMethod}
                        </div>
                        <div
                          className={`flex items-center gap-1 ${color} text-xs mt-1`}
                        >
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
                        <CallStatusDropdown
                          currentStatus={order.callStatus}
                          onStatusChange={(val) =>
                            handleCallStatusChange(order.id, val)
                          }
                        />
                      </td>
                      <td className="whitespace-nowrap py-4 px-4 text-sm">
                        <ActionDropdown
                          currentStatus={order.status}
                          onStatusChange={(newStatus) =>
                            handleStatusChange(order.id, newStatus)
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-lg">
                      No orders found matching your criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-400">
            Showing <span className="font-medium text-white">{startItem}</span>{" "}
            to <span className="font-medium text-white">{endItem}</span> of{" "}
            <span className="font-medium text-white">
              {filteredOrders.length}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-800 py-2 px-4 font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <span className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-800 py-2 px-4 font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
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