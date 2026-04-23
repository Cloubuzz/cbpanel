import React, { useState, useMemo } from "react";
import {
  Search,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  LayoutGrid,
  List,
  X,
  MapPin,
  Store,
  Utensils,
  Pencil,
  ChevronRight,
  User,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Modifier {
  id: string;
  name: string;
  price: number;
}

interface Size {
  id: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  sizes?: Size[];
}

interface CartItem {
  cartId: string;
  id: string;
  name: string;
  image: string;
  basePrice: number;
  size?: Size | null;
  quantity: number;
}

interface HeldOrder {
  id: string;
  items: CartItem[];
  subtotal: number;
  timestamp: string;
  orderType: "dinein" | "pickup" | "delivery";
  customerDetails: { name: string; phone: string; address: string };
  selectedTable: string | null;
}

const generateCartId = () => crypto.randomUUID();

// Mock menu data
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Margherita Pizza",
    price: 599,
    category: "pizzas",
    image:
      "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=400&fit=crop",
    sizes: [
      { id: "s1", name: "Medium", price: 0 },
      { id: "s2", name: "Large", price: 150 },
      { id: "s3", name: "Extra Large", price: 300 },
    ],
  },
  {
    id: "p2",
    name: "Pepperoni Feast",
    price: 749,
    category: "pizzas",
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=400&h=400&fit=crop",
    sizes: [
      { id: "s1", name: "Medium", price: 0 },
      { id: "s2", name: "Large", price: 150 },
      { id: "s3", name: "Extra Large", price: 300 },
    ],
  },
  {
    id: "p3",
    name: "BBQ Chicken",
    price: 699,
    category: "pizzas",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop",
    sizes: [
      { id: "s1", name: "Medium", price: 0 },
      { id: "s2", name: "Large", price: 150 },
      { id: "s3", name: "Extra Large", price: 300 },
    ],
  },
  {
    id: "p4",
    name: "Veggie Supreme",
    price: 549,
    category: "pizzas",
    image:
      "https://images.unsplash.com/photo-1511689915169-d2b97dc765f9?w=400&h=400&fit=crop",
    sizes: [
      { id: "s1", name: "Medium", price: 0 },
      { id: "s2", name: "Large", price: 150 },
      { id: "s3", name: "Extra Large", price: 300 },
    ],
  },
  {
    id: "p5",
    name: "Garlic Bread",
    price: 149,
    category: "sides",
    image:
      "https://images.unsplash.com/photo-1599599810994-87df7d0a0311?w=400&h=400&fit=crop",
  },
  {
    id: "p6",
    name: "Chicken Wings",
    price: 349,
    category: "sides",
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc46e?w=400&h=400&fit=crop",
  },
  {
    id: "p7",
    name: "Iced Tea",
    price: 89,
    category: "beverages",
    image:
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop",
  },
  {
    id: "p8",
    name: "Cola",
    price: 79,
    category: "beverages",
    image:
      "https://images.unsplash.com/photo-1554866585-cd4628902f4a?w=400&h=400&fit=crop",
  },
];

const CATEGORIES = ["pizzas", "sides", "beverages"];

export const Pos: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("pizzas");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [configSize, setConfigSize] = useState<Size | null>(null);
  const [orderType, setOrderType] = useState<"dinein" | "pickup" | "delivery">(
    "dinein",
  );
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [showBillDetails, setShowBillDetails] = useState(false);

  const theme = {
    bg: "bg-slate-50 dark:bg-[#020617]",
    panel:
      "bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800",
    sidebar:
      "bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800",
    text: "text-slate-900 dark:text-white",
    textMuted: "text-slate-500 dark:text-slate-400",
    input:
      "bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800",
    modal:
      "bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/50",
    modalHeader:
      "bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800",
    divider: "border-slate-200 dark:border-slate-800",
  };

  const filteredProducts = useMemo(() => {
    if (searchQuery.trim() !== "") {
      return MOCK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return MOCK_PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory, searchQuery]);

  const subtotal = cart.reduce((acc, item) => {
    const itemTotal =
      (item.basePrice + (item.size?.price || 0)) * item.quantity;
    return acc + itemTotal;
  }, 0);

  const tax = Math.round(subtotal * 0.15);
  const grandTotal = subtotal + tax;

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    if (product.sizes) {
      setConfigSize(product.sizes[0]);
    } else {
      setConfigSize(null);
    }
  };

  const addToCart = (product: Product, size: Size | null) => {
    const cartId = generateCartId();
    const newItem: CartItem = {
      cartId,
      id: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      size,
      quantity: 1,
    };
    setCart([...cart, newItem]);
    setSelectedProduct(null);
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.cartId === cartId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const now = new Date();
    const newHeld: HeldOrder = {
      id: `HOLD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      items: [...cart],
      subtotal,
      timestamp: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      orderType,
      customerDetails: { ...customerDetails },
      selectedTable,
    };
    setHeldOrders([...heldOrders, newHeld]);
    setCart([]);
    setCustomerDetails({ name: "", phone: "", address: "" });
    setSelectedTable(null);
    setOrderType("dinein");
  };

  const handleResumeOrder = (order: HeldOrder) => {
    setCart(order.items);
    setOrderType(order.orderType);
    setCustomerDetails(order.customerDetails);
    setSelectedTable(order.selectedTable);
    setHeldOrders(heldOrders.filter((o) => o.id !== order.id));
    setShowHeldOrders(false);
  };

  const handleCancelOrder = () => {
    if (window.confirm("Cancel current order?")) {
      setCart([]);
      setCustomerDetails({ name: "", phone: "", address: "" });
      setSelectedTable(null);
      setOrderType("dinein");
    }
  };

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: 'Courier New', monospace; width: 300px; padding: 20px; color: #000; background: #fff;">
        <h2 style="text-align: center; margin-bottom: 5px;">BROADWAY PIZZA</h2>
        <p style="text-align: center; font-size: 11px; margin: 0; font-weight: bold; text-transform: uppercase;">*** ${orderType} ORDER ***</p>
        <p style="text-align: center; font-size: 10px; margin: 5px 0;">DATE: ${new Date().toLocaleString()}</p>
        
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0; font-size: 11px;">
          ${customerDetails.name ? `<div>CUST: ${customerDetails.name.toUpperCase()}</div>` : ""}
          ${orderType !== "delivery" && customerDetails.phone ? `<div>PHONE: ${customerDetails.phone}</div>` : ""}
          ${orderType === "dinein" && selectedTable ? `<div style="font-weight: bold; font-size: 14px; text-align: center; margin-top: 5px;">TABLE: ${selectedTable}</div>` : ""}
          ${orderType === "delivery" ? `<div style="margin-top: 8px; padding-top: 5px; border-top: 1px dashed #000;"><div style="margin-bottom: 3px;"><strong>PHONE:</strong> ${customerDetails.phone || "N/A"}</div><div><strong>ADDRESS:</strong><br/>${customerDetails.address?.toUpperCase() || "N/A"}</div></div>` : ""}
        </div>

        ${cart
          .map(
            (item) => `
          <div style="margin-bottom: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>${item.quantity}x ${item.name}</span>
              <span>RS ${(item.basePrice + (item.size?.price || 0)) * item.quantity}</span>
            </div>
            ${item.size ? `<div style="font-size: 9px; margin-left: 10px;">- SIZE: ${item.size.name}</div>` : ""}
          </div>
        `,
          )
          .join("")}
        <hr style="border: none; border-top: 1px dashed #000; margin: 10px 0;" />
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>SUBTOTAL</span>
          <span>RS ${subtotal}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>TAX (15%)</span>
          <span>RS ${tax}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 8px;">
          <span>TOTAL</span>
          <span>RS ${grandTotal}</span>
        </div>
        <p style="text-align: center; margin-top: 25px; font-size: 9px; letter-spacing: 2px;">*** THANK YOU! ***</p>
      </div>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    if (iframe.contentDocument) {
      iframe.contentDocument.write(`
        <html>
          <head><title>Receipt</title></head>
          <body onload="window.print(); setTimeout(() => window.frameElement.remove(), 1000);">${printContent}</body>
        </html>
      `);
      iframe.contentDocument.close();
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPrintPreview(true);
  };

  const confirmAndPrint = () => {
    handlePrint();
    setOrderSuccess(true);
    setTimeout(() => {
      setCart([]);
      setCustomerDetails({ name: "", phone: "", address: "" });
      setSelectedTable(null);
      setShowPrintPreview(false);
      setOrderSuccess(false);
    }, 2000);
  };

  return (
    <div
      className={`flex flex-col md:flex-row h-full w-full ${theme.bg} overflow-hidden font-sans select-none p-2 md:p-4 gap-2 md:gap-4 transition-colors duration-500`}
    >
      {/* Categories Sidebar */}
      <div
        className={`w-full md:w-32 flex flex-row md:flex-col items-center ${theme.panel} rounded-2xl md:rounded-3xl py-2 md:py-4 gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto custom-scrollbar shadow-xl md:shadow-2xl`}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center p-2 md:p-3 transition-all duration-300 font-bold text-[10px] md:text-xs uppercase tracking-tight text-center ${
              activeCategory === cat
                ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 scale-105"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Terminal Area */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${theme.panel} rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl relative`}
      >
        {/* Top Bar */}
        <div
          className={`h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b ${theme.divider}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] font-bold text-teal-600 dark:text-teal-500 uppercase tracking-[0.2em]">
                Restaurant POS
              </span>
              <span
                className={`text-sm md:text-base font-black ${theme.text} tracking-tight italic`}
              >
                TERMINAL 01
              </span>
            </div>
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-11 pr-4 py-2.5 ${theme.input} rounded-xl md:rounded-2xl text-sm ${theme.text} focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-32 md:w-64 transition-all placeholder:text-slate-600 font-medium`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {heldOrders.length > 0 && (
              <button
                onClick={() => setShowHeldOrders(true)}
                className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold text-amber-600 hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-500/5 uppercase tracking-widest"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                {heldOrders.length}{" "}
                <span className="hidden sm:inline">Held</span>
              </button>
            )}
            <div
              className={`hidden md:flex ${theme.input} rounded-xl p-1 gap-1 border`}
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-teal-500 text-slate-950" : "text-slate-500"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-teal-500 text-slate-950" : "text-slate-500"}`}
              >
                <List size={18} />
              </button>
            </div>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="md:hidden p-3 bg-teal-500 text-slate-950 rounded-xl relative"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {showHeldOrders ? (
              <motion.div
                key="held"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2
                      className={`text-2xl font-black ${theme.text} tracking-tight uppercase italic leading-none`}
                    >
                      Held Orders
                    </h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Select to resume
                    </p>
                  </div>
                  <button
                    onClick={() => setShowHeldOrders(false)}
                    className={`px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 ${theme.text} rounded-xl text-[11px] font-black uppercase transition-all`}
                  >
                    Back
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {heldOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-5 flex flex-col gap-5`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <div className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest w-fit mb-2">
                            {order.id}
                          </div>
                          <span className="text-[12px] font-bold text-slate-900 dark:text-white">
                            {order.customerDetails.name || "Walk-in"}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-teal-600 leading-none">
                            {order.subtotal}
                          </div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">
                            PKR
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResumeOrder(order)}
                        className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-xl text-[11px] uppercase tracking-wide transition-all"
                      >
                        Resume Order
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory + searchQuery + viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -5 }}
                    onClick={() => handleProductClick(product)}
                    className={`cursor-pointer group relative overflow-hidden transition-all border shadow-sm hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[20px] p-3 ${viewMode === "list" && "flex items-center justify-between"}`}
                  >
                    {viewMode === "grid" ? (
                      <>
                        <div className="w-full aspect-square rounded-[1.2rem] overflow-hidden mb-4 bg-slate-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="px-1">
                          <h3
                            className={`text-[14px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight tracking-tight mb-2`}
                          >
                            {product.name}
                          </h3>
                          <div
                            className={`text-[12px] font-bold text-teal-600 dark:text-teal-400`}
                          >
                            PKR {product.price}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3
                            className={`text-[15px] font-bold text-slate-900 dark:text-white`}
                          >
                            {product.name}
                          </h3>
                        </div>
                        <div
                          className={`px-5 py-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-[10px] text-[13px] font-bold`}
                        >
                          PKR {product.price}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-0 z-50 flex flex-col md:relative md:inset-auto md:z-0 md:w-[400px] h-full transition-all ${isCartOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsCartOpen(false)}
        />
        <div
          className={`relative ml-auto md:ml-0 w-full h-full flex flex-col bg-[#f0f2f5] dark:bg-slate-900 md:rounded-2xl border ${theme.divider} shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="flex-none px-6 py-5 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center shadow-sm">
                <ShoppingCart size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-slate-900 dark:text-white">
                  Current Order
                </span>
                <span className="text-[12px] text-teal-500 capitalize font-medium">
                  {orderType}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOrderTypeModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Pencil size={12} />
                Order Info
              </button>
              <button
                onClick={() => setIsCartOpen(false)}
                className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                <X size={18} />
              </button>
              <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-[12px] font-bold">
                  {cart.length}
                </span>
              </div>
            </div>
          </div>

          {/* Context Tags */}
          {(customerDetails.name || selectedTable) && (
            <div
              className={`flex-none flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex-wrap bg-white dark:bg-slate-950`}
            >
              {customerDetails.name && (
                <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-400 rounded-lg px-3 py-1.5">
                  <User size={12} />
                  <span className="text-[11px] font-semibold truncate max-w-[100px]">
                    {customerDetails.name}
                  </span>
                </div>
              )}
              {customerDetails.phone && (
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg px-3 py-1.5">
                  <Phone size={12} />
                  <span className="text-[11px] font-semibold">
                    {customerDetails.phone}
                  </span>
                </div>
              )}
              {orderType === "dinein" && selectedTable && (
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg px-3 py-1.5">
                  <Utensils size={12} />
                  <span className="text-[11px] font-semibold">
                    Table {selectedTable}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="bg-white dark:bg-slate-800 p-2.5 rounded-[15px] border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shadow-sm bg-slate-100"
                  />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <div className="text-[13px] font-black text-teal-600">
                        {(
                          (item.basePrice + (item.size?.price || 0)) *
                          item.quantity
                        ).toLocaleString()}
                      </div>
                    </div>
                    {item.size && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                        {item.size.name}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-md overflow-hidden border border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => updateQuantity(item.cartId, -1)}
                          className="px-2 py-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Minus size={10} strokeWidth={3} />
                        </button>
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, 1)}
                          className="px-2 py-1 text-slate-400 hover:text-teal-500 transition-colors"
                        >
                          <Plus size={10} strokeWidth={3} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div
              className="mb-3 cursor-pointer group"
              onClick={() => setShowBillDetails(!showBillDetails)}
            >
              <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-teal-500 transition-colors">
                <span>Bill Details</span>
                <ChevronRight
                  size={14}
                  className={`transform transition-transform ${showBillDetails ? "rotate-90" : ""}`}
                />
              </div>
              {showBillDetails && (
                <div className="space-y-2 py-2 border-b border-dashed border-slate-200 dark:border-slate-800 mb-3">
                  <div className="flex justify-between items-center text-[13px] font-medium text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] font-medium text-slate-500 dark:text-slate-400">
                    <span>Tax (15%)</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      +{tax.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-end">
                <span className="text-[14px] font-bold text-slate-900 dark:text-white">
                  Amount Due
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-black text-teal-600">
                    {grandTotal.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    PKR
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleHoldOrder}
                className="py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 text-[11px] font-bold uppercase tracking-wide transition-colors"
              >
                Hold
              </button>
              <button
                onClick={handleCancelOrder}
                className="py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 text-[11px] font-bold uppercase tracking-wide transition-colors"
              >
                Clear
              </button>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-3 py-[18px] bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              Checkout <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${theme.modal} w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh] border`}
            >
              <div
                className={`p-8 ${theme.modalHeader} flex items-center justify-between border-b`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20">
                    <img
                      src={selectedProduct.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-black text-slate-900 dark:text-white uppercase italic leading-none`}
                    >
                      {selectedProduct.name}
                    </h2>
                    <p
                      className={`text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2`}
                    >
                      Configure selection
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className={`p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-900 dark:text-white`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {selectedProduct.sizes && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      Select Size
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setConfigSize(size)}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            configSize?.id === size.id
                              ? "bg-teal-500 border-teal-500 text-white shadow-xl shadow-teal-500/20"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/40"
                          }`}
                        >
                          <div
                            className={`text-[13px] font-black uppercase leading-tight mb-2`}
                          >
                            {size.name}
                          </div>
                          <div
                            className={`text-[11px] font-bold ${configSize?.id === size.id ? "text-teal-50" : "text-teal-600 dark:text-teal-400"}`}
                          >
                            +PKR {size.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`p-8 ${theme.modalHeader} border-t flex items-center justify-between`}
              >
                <div>
                  <span
                    className={`text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase block mb-1`}
                  >
                    Total
                  </span>
                  <span
                    className={`text-xl font-black text-slate-900 dark:text-white`}
                  >
                    RS {selectedProduct.price + (configSize?.price || 0)}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(selectedProduct, configSize)}
                  className="px-10 py-5 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all"
                >
                  Add to Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Type Modal */}
      <AnimatePresence>
        {showOrderTypeModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderTypeModal(false)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${theme.modal} rounded-[3rem] w-full max-w-3xl border p-12 text-center relative z-10`}
            >
              <h2
                className={`text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic`}
              >
                Order Configuration
              </h2>
              <p
                className={`text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-12 opacity-60`}
              >
                Select service type
              </p>
              <div className="grid grid-cols-3 gap-8">
                {[
                  {
                    id: "dinein" as const,
                    label: "Dine-In",
                    icon: Utensils,
                    color: "bg-emerald-500",
                  },
                  {
                    id: "pickup" as const,
                    label: "Pickup",
                    icon: Store,
                    color: "bg-amber-500",
                  },
                  {
                    id: "delivery" as const,
                    label: "Delivery",
                    icon: MapPin,
                    color: "bg-rose-500",
                  },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setOrderType(type.id);
                      setShowOrderTypeModal(false);
                      setShowOrderDetailsModal(true);
                    }}
                    className={`group flex flex-col items-center p-10 rounded-[3rem] border ${theme.input} hover:border-teal-500/50 transition-all`}
                  >
                    <div
                      className={`w-24 h-24 rounded-[2rem] ${type.color} flex items-center justify-center text-slate-950 mb-8`}
                    >
                      <type.icon size={40} />
                    </div>
                    <span
                      className={`text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight`}
                    >
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetailsModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderDetailsModal(false)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${theme.modal} rounded-[3rem] w-full max-w-xl border flex flex-col relative z-10`}
            >
              <div
                className={`p-8 ${theme.modalHeader} flex items-center justify-between border-b`}
              >
                <div>
                  <h3
                    className={`text-xl font-black text-slate-900 dark:text-white uppercase italic`}
                  >
                    Order Information
                  </h3>
                  <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">
                    {orderType} Details
                  </span>
                </div>
                <button
                  onClick={() => setShowOrderDetailsModal(false)}
                  className={`p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-900 dark:text-white`}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerDetails.name}
                      onChange={(e) =>
                        setCustomerDetails({
                          ...customerDetails,
                          name: e.target.value,
                        })
                      }
                      className={`w-full px-6 py-5 ${theme.input} rounded-2xl text-sm text-slate-900 dark:text-white border outline-none font-bold`}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={customerDetails.phone}
                      onChange={(e) =>
                        setCustomerDetails({
                          ...customerDetails,
                          phone: e.target.value,
                        })
                      }
                      className={`w-full px-6 py-5 ${theme.input} rounded-2xl text-sm text-slate-900 dark:text-white border outline-none font-bold`}
                    />
                  </div>
                </div>
                {orderType === "delivery" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Delivery Address
                    </label>
                    <textarea
                      rows={3}
                      value={customerDetails.address}
                      onChange={(e) =>
                        setCustomerDetails({
                          ...customerDetails,
                          address: e.target.value,
                        })
                      }
                      className={`w-full px-6 py-5 ${theme.input} rounded-2xl text-sm text-slate-900 dark:text-white border outline-none font-bold resize-none`}
                    />
                  </div>
                )}
                {orderType === "dinein" && (
                  <div className="grid grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-dashed">
                    {["1", "2", "3", "4", "5", "6", "7", "8"].map((table) => (
                      <button
                        key={table}
                        onClick={() => setSelectedTable(table)}
                        className={`p-4 rounded-xl border text-center transition-all ${selectedTable === table ? "bg-teal-500 text-white text-slate-950" : `bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400`}`}
                      >
                        <span className="text-[10px] font-black">
                          T-{table}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className={`p-8 border-t`}>
                <button
                  onClick={() => setShowOrderDetailsModal(false)}
                  className="w-full py-6 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {showPrintPreview && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-950 rounded-[3rem] w-full max-w-md max-h-[90vh] overflow-hidden relative z-10 flex flex-col border shadow-2xl"
            >
              <div className="p-8 border-b bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">
                    Confirm Order
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Final Review
                  </p>
                </div>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="p-3 bg-slate-100 dark:bg-slate-800 border rounded-2xl text-slate-900 dark:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-8 pt-6 pb-2">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700">
                  {[
                    {
                      id: "cash" as const,
                      label: "Cash",
                      color: "bg-emerald-500",
                    },
                    {
                      id: "card" as const,
                      label: "Card",
                      color: "bg-blue-500",
                    },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === method.id ? `${method.color} text-white shadow-lg` : "text-slate-500 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-900"}`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-inner font-mono text-sm">
                  <div className="text-center space-y-1 mb-4">
                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      BROADWAY PIZZA
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Receipt
                    </p>
                  </div>

                  <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-4 space-y-1 text-[10px] text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-bold uppercase text-teal-600 dark:text-teal-400 tracking-widest">
                        {orderType}
                      </span>
                    </div>
                    {customerDetails.name && (
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>Customer:</span>{" "}
                        <span>{customerDetails.name}</span>
                      </div>
                    )}
                    {customerDetails.phone && (
                      <div className="flex justify-between">
                        <span>Phone:</span> <span>{customerDetails.phone}</span>
                      </div>
                    )}
                    {orderType === "dinein" && selectedTable && (
                      <div className="flex justify-between font-black text-amber-600 dark:text-amber-400">
                        <span>Table:</span> <span>T-{selectedTable}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-4 space-y-3 mb-4">
                    {cart.map((item) => (
                      <div key={item.cartId} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            RS{" "}
                            {(item.basePrice + (item.size?.price || 0)) *
                              item.quantity}
                          </span>
                        </div>
                        {item.size && (
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 ml-4">
                            - {item.size.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-4 space-y-1 font-bold text-slate-900 dark:text-white">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>SUBTOTAL</span>
                      <span>RS {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>TAX (15%)</span>
                      <span>RS {tax}</span>
                    </div>
                    <div className="flex justify-between text-base pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                      <span>TOTAL</span>
                      <span>RS {grandTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-100 dark:bg-slate-900 flex gap-3">
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="flex-1 py-4 bg-white dark:bg-slate-800 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 transition-all text-xs uppercase text-slate-900 dark:text-white"
                >
                  Back
                </button>
                <button
                  onClick={confirmAndPrint}
                  disabled={orderSuccess}
                  className="flex-[2] py-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-2xl shadow-xl shadow-teal-500/20 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {orderSuccess ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Order Placed!</span>
                    </>
                  ) : (
                    <>
                      <span>Print & Finish</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
