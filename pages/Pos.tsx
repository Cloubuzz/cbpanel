import React, { useState, useMemo, useEffect } from 'react';
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
  Loader2,
  ChevronRight,
  User,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  loadPosMenu,
  loadPosProductOptions,
  setPosActiveCategory,
} from '../store/slices/posSlice';
import {
  selectPosActiveCategory,
  selectPosCategories,
  selectPosMenuError,
  selectPosMenuLoading,
  selectPosOptionLoadingByProduct,
  selectPosOptionsByProduct,
  selectPosProducts,
} from '../store/selectors/posSelectors';
import type {
  PosModifier as Modifier,
  PosProduct as Product,
  PosSize as Size,
} from '../services/posApi';

type ConfigurableProduct = Product & { sizes?: Size[] };

interface CartItem {
  cartId: string;
  id: string;
  name: string;
  image: string;
  basePrice: number;
  size?: Size | null;
  modifiers: Modifier[];
  quantity: number;
}

interface HeldOrder {
  id: string;
  items: CartItem[];
  subtotal: number;
  timestamp: string;
  orderType: 'dinein' | 'pickup' | 'delivery';
  customerDetails: { name: string; phone: string; address: string };
  selectedTable: string | null;
}

const generateCartId = () => crypto.randomUUID();

export const Pos: React.FC = () => {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectPosCategories);
  const products = useAppSelector(selectPosProducts);
  const activeCategory = useAppSelector(selectPosActiveCategory);
  const loading = useAppSelector(selectPosMenuLoading);
  const menuError = useAppSelector(selectPosMenuError);
  const optionsByProduct = useAppSelector(selectPosOptionsByProduct);
  const optionLoadingByProduct = useAppSelector(selectPosOptionLoadingByProduct);

  // --- State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ConfigurableProduct | null>(null);
  const [configSize, setConfigSize] = useState<Size | null>(null);
  const [configModifiers, setConfigModifiers] = useState<Modifier[]>([]);
  const [orderType, setOrderType] = useState<'dinein' | 'pickup' | 'delivery'>('dinein');
  const [resumedOrderId, setResumedOrderId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', address: '' });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [editingCartId, setEditingCartId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [showBillDetails, setShowBillDetails] = useState(false);

  // --- Theme ---
  const theme = {
    bg: 'bg-slate-50 dark:bg-[#020617]',
    panel: 'bg-white dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-800',
    sidebar: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
    text: 'text-slate-900 dark:text-white',
    textMuted: 'text-slate-500 dark:text-slate-400',
    itemCard: 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-teal-500/50',
    categoryBtn: 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    input: 'bg-slate-100 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800',
    modal: 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700/50',
    modalHeader: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800',
    modalFooter: 'bg-slate-100 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800',
    accent: 'teal-500',
    accentText: 'text-teal-600 dark:text-teal-400',
    accentBg: 'bg-teal-500',
    accentBgLight: 'bg-teal-500/10 dark:bg-teal-500/20',
    card: 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/50',
    divider: 'border-slate-200 dark:border-slate-800',
  };

  // --- API Fetching ---

  useEffect(() => {
    dispatch(loadPosMenu());
  }, [dispatch]);

  const prepareProductConfiguration = (product: Product, sizes: Size[]) => {
    const configurableProduct: ConfigurableProduct = {
      ...product,
      sizes:
        sizes.length > 1 || (sizes.length === 1 && sizes[0].name !== 'Regular')
          ? sizes
          : undefined,
    };

    const initialSize = sizes.length > 0 ? sizes[0] : null;

    if (!initialSize?.modifierGroups?.length && !configurableProduct.sizes) {
      addToCart(product, null, []);
      return;
    }

    setSelectedProduct(configurableProduct);
    setConfigSize(initialSize);
    setActiveAccordion(configurableProduct.sizes ? 'size' : (initialSize?.modifierGroups?.[0]?.id || ''));

    const initialMods: Modifier[] = [];
    initialSize?.modifierGroups?.forEach((group) => {
      if (group.selectionType === 'single' && group.modifiers.length > 0) {
        initialMods.push(group.modifiers[0]);
      }
    });
    setConfigModifiers(initialMods);
  };

  const fetchOptions = async (product: Product) => {
    const cachedSizes = optionsByProduct[product.id];
    if (cachedSizes) {
      prepareProductConfiguration(product, cachedSizes);
      return;
    }

    try {
      const { sizes } = await dispatch(loadPosProductOptions(product.id)).unwrap();
      if (sizes.length === 0) {
        addToCart(product, null, []);
        return;
      }

      prepareProductConfiguration(product, sizes);
    } catch (error) {
      console.error('Options fetch error:', error);
      addToCart(product, null, []);
    }
  };

  // --- Filtering & Calculations ---

  const filteredProducts = useMemo(() => {
    if (searchQuery.trim() !== '') {
      return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return products.filter(p => p.catId === activeCategory);
  }, [activeCategory, searchQuery, products]);

  const subtotal = cart.reduce((acc, item) => {
    const itemTotal = (item.basePrice + (item.size?.price || 0) + item.modifiers.reduce((mAcc, m) => mAcc + m.price, 0)) * item.quantity;
    return acc + itemTotal;
  }, 0);

  const tax = Math.round(subtotal * 0.15);
  const grandTotal = subtotal + tax;

  // --- Handlers ---

  const handleProductClick = (product: Product) => {
    setEditingCartId(null);
    fetchOptions(product);
  };

  const toggleModifier = (mod: Modifier, groupId: string) => {
    const group = configSize?.modifierGroups?.find(g => g.id === groupId);
    if (!group) return;

    if (group.selectionType === 'single') {
      const otherGroupMods = group.modifiers.map(m => m.id);
      setConfigModifiers(prev => [
        ...prev.filter(m => !otherGroupMods.includes(m.id)),
        mod
      ]);
    } else {
      if (configModifiers.find(m => m.id === mod.id)) {
        setConfigModifiers(configModifiers.filter(m => m.id !== mod.id));
      } else {
        const currentInGroup = configModifiers.filter(m => group.modifiers.map(gm => gm.id).includes(m.id)).length;
        if (group.max && currentInGroup >= group.max) {
            return; 
        }
        setConfigModifiers([...configModifiers, mod]);
      }
    }
  };

  const handleEditCartItem = (item: CartItem) => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;
    setEditingCartId(item.cartId);
    fetchOptions(product);
  };

  const addToCart = (product: Product, size: Size | null, modifiers: Modifier[]) => {
    if (editingCartId) {
      setCart(cart.map(item => {
        if (item.cartId === editingCartId) {
          return {
            ...item,
            size,
            modifiers,
            quantity: item.quantity
          };
        }
        return item;
      }));
      setEditingCartId(null);
    } else {
      const cartId = generateCartId();
      const newItem: CartItem = {
        cartId,
        id: product.id,
        name: product.name,
        image: product.image,
        basePrice: product.price,
        size,
        modifiers,
        quantity: 1
      };
      setCart([...cart, newItem]);
    }
    setSelectedProduct(null);
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCancelOrder = () => {
    const hasActiveOrder = cart.length > 0 || resumedOrderId || customerDetails.name || selectedTable || orderType !== 'dinein';
    if (!hasActiveOrder) return;
    
    if (window.confirm('Are you sure you want to cancel the current order?')) {
      setCart([]);
      setResumedOrderId(null);
      setCustomerDetails({ name: '', phone: '', address: '' });
      setSelectedTable(null);
      setEditingCartId(null);
      setOrderType('dinein');
      setShowOrderDetailsModal(false);
      setShowOrderTypeModal(false);
      setIsCartOpen(false);
    }
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const now = new Date();
    const newHeld: HeldOrder = {
      id: `HOLD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      items: [...cart],
      subtotal,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      orderType,
      customerDetails: { ...customerDetails },
      selectedTable
    };
    setHeldOrders([...heldOrders, newHeld]);
    
    setCart([]);
    setCustomerDetails({ name: '', phone: '', address: '' });
    setSelectedTable(null);
    setResumedOrderId(null);
    setOrderType('dinein');
    setEditingCartId(null);
  };

  const handleResumeOrder = (order: HeldOrder) => {
    setCart(order.items);
    setResumedOrderId(order.id);
    setOrderType(order.orderType);
    setCustomerDetails(order.customerDetails);
    setSelectedTable(order.selectedTable);
    
    setHeldOrders(heldOrders.filter(o => o.id !== order.id));
    setShowHeldOrders(false);
  };

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: 'Courier New', monospace; width: 300px; padding: 20px; color: #000; background: #fff;">
        <h2 style="text-align: center; margin-bottom: 5px;">BROADWAY PIZZA</h2>
        <p style="text-align: center; font-size: 11px; margin: 0; font-weight: bold; text-transform: uppercase;">*** ${orderType} ORDER ***</p>
        <p style="text-align: center; font-size: 10px; margin: 5px 0;">TERMINAL: AIS-01 | DATE: ${new Date().toLocaleString()}</p>
        
        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0; font-size: 11px;">
          ${customerDetails.name ? `<div>CUST: ${customerDetails.name.toUpperCase()}</div>` : ''}
          ${orderType !== 'delivery' && customerDetails.phone ? `<div>PHONE: ${customerDetails.phone}</div>` : ''}
          ${orderType === 'dinein' && selectedTable ? `<div style="font-weight: bold; font-size: 14px; text-align: center; margin-top: 5px;">TABLE: ${selectedTable}</div>` : ''}
          ${orderType === 'delivery' ? `
            <div style="margin-top: 8px; padding-top: 5px; border-top: 1px dashed #000;">
              <div style="margin-bottom: 3px;"><strong>PHONE:</strong> ${customerDetails.phone || 'N/A'}</div>
              <div><strong style="font-size: 12px;">DELIVERY ADDRESS:</strong><br/>${customerDetails.address?.toUpperCase() || 'N/A'}</div>
            </div>
          ` : ''}
        </div>

        ${cart.map(item => `
          <div style="margin-bottom: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>${item.quantity}x ${item.name}</span>
              <span>RS ${((item.basePrice + (item.size?.price || 0) + item.modifiers.reduce((acc, m) => acc + m.price, 0)) * item.quantity)}</span>
            </div>
            ${item.size ? `<div style="font-size: 9px; margin-left: 10px;">- SIZE: ${item.size.name}</div>` : ''}
            ${item.modifiers.map(m => `<div style="font-size: 9px; margin-left: 10px;">- ${m.name}</div>`).join('')}
          </div>
        `).join('')}
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

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
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

  const confirmAndPrint = async () => {
    const payload = {
      orderId: `ORD-${crypto.randomUUID().slice(0,8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      orderType,
      paymentMethod,
      customer: customerDetails,
      selectedTable,
      subtotal,
      tax,
      grandTotal,
      items: cart.map(item => ({
        cartId: item.cartId,
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        basePrice: item.basePrice,
        size: item.size ? { id: item.size.id, name: item.size.name, price: item.size.price } : null,
        modifiers: item.modifiers.map(m => ({ id: m.id, name: m.name, price: m.price })),
        itemTotal: (item.basePrice + (item.size?.price || 0) + item.modifiers.reduce((acc, m) => acc + m.price, 0)) * item.quantity
      }))
    };

    try {
      fetch("https://automate.megnus.app/webhook/bwv3api", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error("Webhook post failed:", err));
    } catch (e) {
      console.error("Order POST failed", e);
    }

    handlePrint();
    setOrderSuccess(true);
    setTimeout(() => {
      setCart([]);
      setCustomerDetails({ name: '', phone: '', address: '' });
      setSelectedTable(null);
      setResumedOrderId(null);
      setShowPrintPreview(false);
      setOrderSuccess(false);
    }, 2000);
  };

  return (
    <div className={`flex flex-col md:flex-row h-full w-full ${theme.bg} overflow-hidden font-sans select-none p-2 md:p-4 gap-2 md:gap-4 transition-colors duration-500`}>
      
      {/* Categories Sidebar */}
      <div className={`w-full md:w-32 flex flex-row md:flex-col items-center ${theme.panel} rounded-2xl md:rounded-3xl py-2 md:py-4 gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto custom-scrollbar shadow-xl md:shadow-2xl`}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => dispatch(setPosActiveCategory(cat.id))}
            className={`
              flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex flex-col items-center justify-center p-2 md:p-3 transition-all duration-300 group
              ${activeCategory === cat.id 
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 scale-105' 
                : `${theme.categoryBtn} border-transparent bg-opacity-10`}
            `}
          >
            <div className="text-[10px] md:text-[12px] font-black uppercase leading-tight text-center break-words tracking-tight group-hover:scale-105 transition-transform">{cat.name}</div>
          </button>
        ))}
      </div>

      {/* Main Terminal Area */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${theme.panel} rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl relative`}>
        
        {/* Terminal Top Bar */}
        <div className={`h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b ${theme.divider}`}>
          <div className="flex items-center gap-2 md:gap-8 overflow-x-auto no-scrollbar py-2">
             <div className="flex flex-col flex-shrink-0">
                <span className="text-[8px] md:text-[10px] font-bold text-teal-600 dark:text-teal-500 uppercase tracking-[0.2em] mb-0.5">Broadway Pizza</span>
                <span className={`text-sm md:text-base font-black ${theme.text} tracking-tight italic`}>TERMINAL 01</span>
             </div>

             <div className="relative flex-shrink-0 hidden sm:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-11 pr-4 py-2.5 ${theme.input} border rounded-xl md:rounded-2xl text-sm ${theme.text} focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-32 md:w-64 transition-all placeholder:text-slate-600 font-medium`}
                />
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             {loading && <Loader2 className="animate-spin text-teal-500" size={20} />}
             {heldOrders.length > 0 && (
               <button 
                 onClick={() => setShowHeldOrders(true)}
                 className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold text-amber-600 hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-500/5 uppercase tracking-widest"
               >
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
                 {heldOrders.length} <span className="hidden sm:inline">Held</span>
               </button>
             )}
             <div className={`hidden md:flex ${theme.input} rounded-xl p-1 gap-1 border`}>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal-500 text-slate-950' : 'text-slate-500'}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-teal-500 text-slate-950' : 'text-slate-500'}`}><List size={18} /></button>
             </div>
             <button onClick={() => setIsCartOpen(!isCartOpen)} className="md:hidden p-3 bg-teal-500 text-slate-950 rounded-xl relative">
                <ShoppingCart size={20} />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">{cart.length}</span>}
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
                      <h2 className={`text-2xl font-black ${theme.text} tracking-tight uppercase italic leading-none`}>Held Orders</h2>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Select an order to resume processing</p>
                    </div>
                    <button onClick={() => setShowHeldOrders(false)} className={`px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 ${theme.text} rounded-xl text-[11px] font-black uppercase transition-all tracking-widest`}>Back to Menu</button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                   {heldOrders.map(order => (
                     <div key={order.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-5 flex flex-col gap-5 transition-all shadow-md group hover:border-teal-500/30 overflow-hidden`}>
                       
                       {/* Header */}
                       <div className="flex justify-between items-start">
                         <div className="flex flex-col">
                           <div className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest w-fit mb-2 shadow-sm">{order.id}</div>
                           <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold text-slate-900 dark:text-white leading-none">{order.customerDetails.name || 'Walk-in'}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase">• {order.orderType}</span>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-lg font-black text-[#13b8a6] leading-none mb-1">{order.subtotal}</div>
                           <div className="text-[9px] text-slate-400 font-bold uppercase">PKR</div>
                         </div>
                       </div>

                       {/* Body Items List */}
                       <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 custom-scrollbar overflow-y-auto max-h-[140px] space-y-2">
                         {order.items.map((i, idx) => (
                           <div key={idx} className="flex justify-between items-start text-[11px]">
                              <div className="font-bold text-slate-700 dark:text-slate-300"><span className="text-slate-400 font-black mr-1">{i.quantity}x</span> {i.name}</div>
                           </div>
                         ))}
                       </div>

                       {/* Footer / Resume Action */}
                       <div className="flex items-center justify-between pt-2">
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.timestamp}</div>
                         <button 
                           onClick={() => handleResumeOrder(order)}
                           className="px-5 py-2.5 bg-[#13b8a6] hover:bg-teal-600 text-white font-black rounded-xl text-[11px] uppercase tracking-wide transition-all shadow-sm active:scale-95"
                         >
                           Resume Order
                         </button>
                       </div>

                     </div>
                   ))}
                 </div>
               </motion.div>
             ) : loading ? (
                 <div className="h-full flex items-center justify-center flex-col gap-4" key="loading">
                    <Loader2 className="animate-spin text-teal-500" size={48} />
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Warming Ovens...</span>
                 </div>
             ) : menuError ? (
               <div className="h-full flex items-center justify-center flex-col gap-3" key="error">
                <span className="text-sm font-black text-rose-500 uppercase tracking-widest">Menu Unavailable</span>
                <p className="text-xs font-semibold text-slate-500">{menuError}</p>
               </div>
             ) : (
                 <motion.div 
                   key={activeCategory + searchQuery + viewMode}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6" : "flex flex-col gap-4"}
                 >
                   {filteredProducts.map(product => (
                     <motion.div
                       key={product.id}
                       whileHover={{ y: -5 }}
                       onClick={() => handleProductClick(product)}
                       className={`cursor-pointer group relative overflow-hidden transition-all border shadow-sm hover:shadow-md ${viewMode === 'grid' ? `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[20px] p-3` : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between`}`}
                     >
                       {viewMode === 'grid' ? (
                         <>
                           <div className="w-full aspect-square rounded-[1.2rem] overflow-hidden mb-4 relative bg-slate-100">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              {optionLoadingByProduct[product.id] && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Loader2 className="animate-spin text-white" size={32} />
                                </div>
                              )}
                           </div>
                           <div className="px-1">
                              <h3 className={`text-[14px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight tracking-tight mb-2`}>{product.name}</h3>
                              <div className={`text-[12px] font-bold text-[#13b8a6]`}>PKR {product.price}</div>
                           </div>
                         </>
                       ) : (
                         <>
                           <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100`}>
                                 <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <h3 className={`text-[15px] font-bold text-slate-900 dark:text-white leading-none`}>{product.name}</h3>
                           </div>
                           <div className={`px-5 py-2.5 bg-teal-50 dark:bg-teal-900/30 text-[#13b8a6] rounded-[10px] text-[13px] font-bold`}>PKR {product.price}</div>
                         </>
                       )}
                     </motion.div>
                   ))}
                 </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar - Cart */}
      <div className={`fixed inset-0 z-50 flex flex-col md:relative md:inset-auto md:z-0 md:w-[400px] h-full transition-all ${isCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsCartOpen(false)} />
        <div className={`relative ml-auto md:ml-0 w-full h-full flex flex-col bg-[#f0f2f5] dark:bg-slate-900 md:rounded-2xl border ${theme.divider} shadow-2xl overflow-hidden`}>
          
          {/* Header */}
          <div className="flex-none px-6 py-5 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#13b8a6] flex items-center justify-center shadow-sm">
                <ShoppingCart size={18} className="text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">Current Order</span>
                <span className="text-[12px] text-[#13b8a6] capitalize font-medium">{orderType}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowOrderTypeModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Pencil size={12} className="text-slate-400" />
                <span className="tracking-wide">Order Info</span>
              </button>
              {/* Mobile Close Button */}
              <button onClick={() => setIsCartOpen(false)} className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                <X size={18} />
              </button>
              <div className="w-7 h-7 rounded-full bg-[#13b8a6] flex items-center justify-center shadow-sm">
                <span className="text-white text-[12px] font-bold">{cart.length}</span>
              </div>
            </div>
          </div>

          {/* ── Order Context Tags ── */}
          {(customerDetails.name || selectedTable || customerDetails.phone) && (
            <div className={`flex-none flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex-wrap bg-white dark:bg-slate-950`}>
              {customerDetails.name && (
                <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-700 dark:text-teal-400 rounded-lg px-3 py-1.5">
                  <User size={12} />
                  <span className="text-[11px] font-semibold truncate max-w-[100px]">{customerDetails.name}</span>
                </div>
              )}
              {customerDetails.phone && (
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg px-3 py-1.5">
                  <Phone size={12} />
                  <span className="text-[11px] font-semibold">{customerDetails.phone}</span>
                </div>
              )}
              {orderType === 'dinein' && selectedTable && (
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg px-3 py-1.5">
                  <Utensils size={12} />
                  <span className="text-[11px] font-semibold">Table {selectedTable}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {cart.map(item => (
              <div key={item.cartId} className="bg-white dark:bg-slate-800 p-2.5 rounded-[15px] border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                <div className="flex items-start gap-3">
                  {/* Image */}
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shadow-sm bg-slate-100" />
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight pr-2 truncate">{item.name}</h4>
                      <div className="text-right">
                        <div className="text-[13px] font-black text-[#13b8a6] leading-tight">
                          {((item.basePrice + (item.size?.price || 0) + item.modifiers.reduce((acc, m) => acc + m.price, 0)) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Size small text */}
                    {item.size && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">{item.size.name}</span>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-md overflow-hidden border border-slate-100 dark:border-slate-800">
                        <button onClick={() => updateQuantity(item.cartId, -1)} className="px-2 py-1 text-slate-400 hover:text-rose-500 transition-colors">
                          <Minus size={10} strokeWidth={3} />
                        </button>
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} className="px-2 py-1 text-slate-400 hover:text-teal-500 transition-colors">
                          <Plus size={10} strokeWidth={3} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditCartItem(item)} className="p-1.5 text-slate-300 hover:text-[#13b8a6] transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => removeFromCart(item.cartId)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div 
              className="mb-3 cursor-pointer select-none group"
              onClick={() => setShowBillDetails(!showBillDetails)}
            >
              <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-teal-500 transition-colors">
                <span>Payment Details</span>
                <ChevronRight size={14} className={`transform transition-transform ${showBillDetails ? 'rotate-90' : ''}`} />
              </div>

              {showBillDetails && (
                <div className="space-y-2 py-2 border-b border-dashed border-slate-200 dark:border-slate-800 mb-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-center text-[13px] font-medium text-[#64748b] dark:text-slate-400">
                    <span className="tracking-wide">Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white tracking-wide">{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] font-medium text-[#64748b] dark:text-slate-400">
                    <span className="tracking-wide">Tax (15%)</span>
                    <span className="font-bold text-[#13b8a6]">+{tax.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end mt-1">
                <span className="text-[14px] font-bold text-slate-900 dark:text-white">Amount Due</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-black text-[#13b8a6] tracking-tight">{grandTotal.toLocaleString()}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">PKR</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={handleHoldOrder} className="py-3 rounded-xl border border-[#e2e8f0] dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#d97706] text-[11px] font-bold uppercase tracking-wide transition-colors">Hold Order</button>
              <button onClick={handleCancelOrder} className="py-3 rounded-xl border border-[#e2e8f0] dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#fb325a] text-[11px] font-bold uppercase tracking-wide transition-colors">Clear Cart</button>
            </div>
            
            <button onClick={handleCheckout} className="w-full mt-3 py-[18px] bg-[#13b8a6] hover:bg-teal-500 text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-1.5 transition-colors shadow-sm">
              Proceed to Checkout <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Modifier/Option Modal */}
      <AnimatePresence>
        {selectedProduct && (configSize?.modifierGroups?.length || selectedProduct.sizes) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`${theme.modal} w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh] border`}>
                <div className={`p-8 ${theme.modalHeader} flex items-center justify-between border-b`}>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20"><img src={selectedProduct.image} alt="" className="w-full h-full object-cover" /></div>
                        <div><h2 className={`text-2xl font-black ${theme.text} uppercase italic leading-none`}>{selectedProduct.name}</h2><p className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mt-2`}>Configure your selection</p></div>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className={`p-3 ${theme.input} rounded-2xl ${theme.text}`}><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                    {selectedProduct.sizes && (
                      <div className={`overflow-hidden rounded-[2rem] border transition-all duration-300 ${activeAccordion === 'size' ? 'border-[#13b8a6] shadow-lg shadow-teal-500/10 bg-white dark:bg-slate-950' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 opacity-70 hover:opacity-100'}`}>
                        <button onClick={() => setActiveAccordion(activeAccordion === 'size' ? '' : 'size')} className={`w-full flex justify-between items-center px-6 py-5 outline-none`}>
                          <div className="flex flex-col text-left">
                             <h4 className={`text-xs md:text-sm font-black uppercase tracking-widest ${activeAccordion === 'size' ? 'text-[#13b8a6]' : 'text-slate-600 dark:text-slate-400'}`}>Pick Your Size</h4>
                             {configSize && activeAccordion !== 'size' && <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wide">Selected: {configSize.name}</span>}
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeAccordion === 'size' ? 'bg-teal-50 dark:bg-teal-500/10 text-[#13b8a6]' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                             <ChevronRight size={16} className={`transition-transform duration-300 ${activeAccordion === 'size' ? 'rotate-90' : ''}`} />
                          </div>
                        </button>
                        <AnimatePresence initial={false}>
                          {activeAccordion === 'size' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 pt-2">
                                  {selectedProduct.sizes.map(size => (
                                      <button key={size.id} onClick={() => { 
                                          setConfigSize(size); 
                                          const initialMods: Modifier[] = [];
                                          size.modifierGroups.forEach(g => {
                                              if (g.selectionType === 'single' && g.modifiers.length > 0) {
                                                  initialMods.push(g.modifiers[0]);
                                              }
                                          });
                                          setConfigModifiers(initialMods);
                                          if(size.modifierGroups && size.modifierGroups.length > 0) setActiveAccordion(size.modifierGroups[0].id) 
                                      }} className={`px-4 py-3 rounded-xl border text-center transition-all duration-300 ${configSize?.id === size.id ? 'bg-[#13b8a6] border-[#13b8a6] text-white shadow-md shadow-teal-500/10 scale-[1.02]' : `bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#13b8a6]/40 text-slate-500`}`}>
                                          <div className={`text-[12px] font-black uppercase tracking-tight leading-none mb-1 ${configSize?.id === size.id ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{size.name}</div>
                                          <div className={`text-[10px] font-bold ${configSize?.id === size.id ? 'text-teal-50' : 'text-[#13b8a6]'}`}>+PKR {size.price}</div>
                                      </button>
                                  ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    
                    {configSize?.modifierGroups?.map((group, idx) => {
                        const selectedInGroup = configModifiers.filter(m => group.modifiers.some(gm => gm.id === m.id));
                        const isSatisfied = group.selectionType === 'multiple' || selectedInGroup.length > 0;
                        
                        return (
                          <div key={group.id} className={`overflow-hidden rounded-[2rem] border transition-all duration-300 ${activeAccordion === group.id ? 'border-[#13b8a6] shadow-lg shadow-teal-500/10 bg-white dark:bg-slate-950' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 opacity-70 hover:opacity-100'}`}>
                              <button onClick={() => setActiveAccordion(activeAccordion === group.id ? '' : group.id)} className={`w-full flex justify-between items-center px-6 py-5 outline-none`}>
                                  <div className="flex flex-col text-left max-w-[70%]">
                                     <div className="flex items-center gap-2">
                                        <h4 className={`text-xs md:text-sm font-black uppercase tracking-widest leading-none ${activeAccordion === group.id ? 'text-[#13b8a6]' : 'text-slate-600 dark:text-slate-400'}`}>{group.name}</h4>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${activeAccordion === group.id ? 'bg-teal-50 text-[#13b8a6] dark:bg-teal-500/20' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                                           {group.selectionType === 'single' ? 'Pick 1' : `Max ${group.max || 'any'}`}
                                        </span>
                                     </div>
                                     {activeAccordion !== group.id && selectedInGroup.length > 0 && (
                                         <span className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-wide truncate">
                                            {selectedInGroup.map(m => m.name).join(', ')}
                                         </span>
                                     )}
                                  </div>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeAccordion === group.id ? 'bg-teal-50 dark:bg-teal-500/10 text-[#13b8a6]' : isSatisfied ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                     {isSatisfied && activeAccordion !== group.id ? (
                                        <CheckCircle2 size={16} />
                                     ) : (
                                        <ChevronRight size={16} className={`transition-transform duration-300 ${activeAccordion === group.id ? 'rotate-90' : ''}`} />
                                     )}
                                  </div>
                              </button>
                              <AnimatePresence initial={false}>
                                {activeAccordion === group.id && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 pt-2">
                                        {group.modifiers.map(mod => {
                                            const isSelected = configModifiers.find(m => m.id === mod.id);
                                            return (
                                                <button key={mod.id} onClick={() => { 
                                                  toggleModifier(mod, group.id);
                                                if (group.selectionType === 'single' && configSize?.modifierGroups && idx < (configSize.modifierGroups.length || 1) - 1) {
                                                      setTimeout(() => setActiveAccordion(configSize.modifierGroups[idx + 1].id), 250);
                                                  }
                                                }} className={`px-4 py-2.5 rounded-xl border text-left flex flex-col justify-center transition-all duration-300 group ${isSelected ? 'bg-[#13b8a6] border-[#13b8a6] text-white shadow-md shadow-teal-500/10 scale-[1.02]' : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#13b8a6]/40`}`}>
                                                    <div className={`text-[12px] font-bold uppercase tracking-tight leading-tight line-clamp-1 mb-0.5 ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-[#13b8a6]'}`}>{mod.name}</div>
                                                    <div className={`text-[10px] font-bold ${isSelected ? 'text-teal-50' : 'text-[#13b8a6]'}`}>+PKR {mod.price}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                          </div>
                        );
                    })}
                </div>
                <div className={`p-8 ${theme.modalFooter} border-t flex items-center justify-between`}>
                    <div><span className={`text-[10px] font-black ${theme.textMuted} uppercase block mb-1`}>Total Upgrade</span><span className={`text-xl font-black ${theme.text}`}>RS {selectedProduct.price + (configSize?.price || 0) + configModifiers.reduce((acc, m) => acc + m.price, 0)}</span></div>
                    <button onClick={() => addToCart(selectedProduct, configSize, configModifiers)} className="px-10 py-5 bg-teal-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95">Add to Order</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Type/Details Modals */}
      <AnimatePresence>
        {showOrderTypeModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderTypeModal(false)} className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`${theme.modal} rounded-[3rem] w-full max-w-3xl border p-12 text-center relative z-10`}>
              <h2 className={`text-3xl font-black ${theme.text} uppercase tracking-tighter mb-2 italic`}>{(cart.length > 0 || customerDetails.name) ? 'Order Configuration' : 'Start New Order'}</h2>
              <p className={`${theme.textMuted} text-sm font-bold uppercase tracking-widest mb-12 opacity-60`}>{(cart.length > 0 || customerDetails.name) ? 'Review or modify service type' : 'Select service type to begin setup'}</p>
              <div className="grid grid-cols-3 gap-8">
                {[{ id: 'dinein', label: 'Dine-In', icon: Utensils, color: 'bg-emerald-500' }, { id: 'pickup', label: 'Store Pickup', icon: Store, color: 'bg-amber-500' }, { id: 'delivery', label: 'Home Delivery', icon: MapPin, color: 'bg-rose-500' }].map(type => (
                  <button key={type.id} onClick={() => { setOrderType(type.id as any); setShowOrderTypeModal(false); setShowOrderDetailsModal(true); }} className={`group flex flex-col items-center p-10 rounded-[3rem] border ${theme.input} hover:border-teal-500/50 transition-all`}>
                    <div className={`w-24 h-24 rounded-[2rem] ${type.color} flex items-center justify-center text-slate-950 mb-8`}><type.icon size={40} /></div>
                    <span className={`text-lg font-black ${theme.text} uppercase tracking-tight`}>{type.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        {showOrderDetailsModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderDetailsModal(false)} className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`${theme.modal} rounded-[3rem] w-full max-w-xl border flex flex-col relative z-10`}>
              <div className={`p-8 ${theme.modalHeader} flex items-center justify-between border-b`}>
                <div><h3 className={`text-xl font-black ${theme.text} uppercase italic`}>Order Information</h3><span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">{orderType} Details</span></div>
                <button onClick={() => setShowOrderDetailsModal(false)} className={`p-3 ${theme.input} rounded-2xl ${theme.text}`}><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</label>
                    <input type="text" value={customerDetails.name} onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})} className={`w-full px-6 py-5 ${theme.input} rounded-2xl text-sm ${theme.text} border outline-none font-bold`} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input type="text" value={customerDetails.phone} onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})} className={`w-full px-6 py-5 ${theme.input} rounded-2xl text-sm ${theme.text} border outline-none font-bold`} />
                  </div>
                </div>
                {orderType === 'delivery' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</label>
                    <textarea rows={3} value={customerDetails.address} onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})} className={`w-full px-6 py-5 ${theme.input} rounded-2xl text-sm ${theme.text} border outline-none font-bold resize-none`} />
                  </div>
                )}
                {orderType === 'dinein' && (
                  <div className="grid grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-dashed">
                    {['1', '2', '3', '4', '5', '6', '7', '8'].map(table => (
                      <button key={table} onClick={() => setSelectedTable(table)} className={`p-4 rounded-xl border text-center transition-all ${selectedTable === table ? 'bg-teal-500 text-slate-950' : `${theme.input} text-slate-500`}`}><span className="text-[10px] font-black">T-{table}</span></button>
                    ))}
                  </div>
                )}
              </div>
              <div className={`p-8 border-t`}>
                <button onClick={() => setShowOrderDetailsModal(false)} className="w-full py-6 bg-teal-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest">Confirm Configuration</button>
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
               className="bg-white rounded-[3rem] w-full max-w-md max-h-[90vh] overflow-hidden relative z-10 flex flex-col border shadow-2xl"
             >
                <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                    <div>
                       <h3 className="text-xl font-black text-slate-900 uppercase italic">Confirm Transaction</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Final Review</p>
                    </div>
                    <button onClick={() => setShowPrintPreview(false)} className="p-3 bg-white border rounded-2xl text-slate-900"><X size={20} /></button>
                </div>

                <div className="px-8 pt-6 pb-2">
                   <div className="p-1.5 bg-slate-100 rounded-2xl flex gap-1 border border-slate-200">
                      {[
                        { id: 'cash', label: 'Cash Payment', color: 'bg-emerald-500' },
                        { id: 'card', label: 'Card Payment', color: 'bg-blue-500' }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === method.id ? `${method.color} text-white shadow-lg` : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
                        >
                          {method.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                   <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner font-mono text-sm">
                      {/* Receipt Header */}
                      <div className="text-center space-y-1">
                         <h2 className="text-lg font-black tracking-tight text-slate-900">BROADWAY PIZZA</h2>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest">Digital Terminal Receipt</p>
                      </div>
                      
                      <div className="border-t border-dashed border-slate-200 pt-4 space-y-1 text-[10px] text-slate-600">
                         <div className="flex justify-between"><span>Type:</span> <span className="font-bold uppercase text-teal-600 tracking-widest">{orderType} Order</span></div>
                         {customerDetails.name && <div className="flex justify-between font-bold text-slate-900"><span>Customer:</span> <span>{customerDetails.name.toUpperCase()}</span></div>}
                         {customerDetails.phone && <div className="flex justify-between text-slate-900"><span>Phone:</span> <span>{customerDetails.phone}</span></div>}
                         {orderType === 'dinein' && selectedTable && <div className="flex justify-between font-black text-amber-600"><span>Table Selection:</span> <span>T-{selectedTable}</span></div>}
                         {orderType === 'delivery' && customerDetails.address && (
                            <div className="flex flex-col text-slate-900 pt-1">
                               <span className="font-bold">Delivery Address:</span>
                               <span className="text-[9px] uppercase leading-tight bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">{customerDetails.address}</span>
                            </div>
                         )}
                      </div>

                      <div className="border-t border-dashed border-slate-200 pt-4 space-y-3">
                         {cart.map((item) => (
                            <div key={item.cartId} className="space-y-0.5">
                               <div className="flex justify-between font-bold text-slate-900">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>RS {((item.basePrice + (item.size?.price || 0) + item.modifiers.reduce((acc, m) => acc + m.price, 0)) * item.quantity)}</span>
                               </div>
                               {item.size && <div className="text-[9px] text-slate-500 ml-4">- Size: {item.size.name}</div>}
                               {item.modifiers.map(m => <div key={m.id} className="text-[9px] text-slate-500 ml-4">- {m.name}</div>)}
                            </div>
                         ))}
                      </div>

                      <div className="border-t border-dashed border-slate-200 pt-4 space-y-1 font-bold text-slate-900">
                         <div className="flex justify-between text-slate-600"><span>SUBTOTAL</span> <span>RS {subtotal}</span></div>
                         <div className="flex justify-between text-slate-600"><span>TAX (15%)</span> <span>RS {tax}</span></div>
                         <div className="flex justify-between text-base pt-2 border-t border-slate-100 mt-2">
                            <span>TOTAL</span>
                            <span>RS {grandTotal}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-slate-100 flex gap-3">
                   <button 
                     onClick={() => setShowPrintPreview(false)}
                     className="flex-1 py-4 bg-white font-bold rounded-2xl border transition-all text-xs uppercase"
                   >
                     Back
                   </button>
                   <button 
                     onClick={confirmAndPrint}
                     disabled={orderSuccess}
                     className="flex-[2] py-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-2xl shadow-xl shadow-teal-500/20 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
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
