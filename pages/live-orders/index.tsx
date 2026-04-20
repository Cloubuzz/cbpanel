import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setActiveTab,
  setSelectedOrderId,
  invalidateTab,
  loadTabOrders,
  loadOrderDetail,
  loadOutlets,
  processOrderAction,
} from '../../store/slices/ordersSlice';
import {
  selectActiveTab,
  selectSelectedOrderId,
  selectCurrentTabOrders,
  selectCurrentTabLoading,
  selectCurrentTabError,
  selectTabData,
  selectOrderDetail,
  selectOrderLogs,
  selectPaymentLogs,
  selectDetailLoading,
  selectDetailError,
  selectOutlets,
  selectOutletsLoading,
  selectOutletsError,
  selectProcessing,
} from '../../store/selectors/ordersSelectors';
import type { OrderTab, Outlet, ProcessOrderPayload } from '../../services/ordersApi';
import { StatusRail } from './components/StatusRail';
import { OrderListPanel } from './components/OrderListPanel';
import { OrderDetailHeader } from './components/OrderDetailHeader';
import { OrderInfoGrid } from './components/OrderInfoGrid';
import { OrderItemsTable } from './components/OrderItemsTable';
import { OutletInfoCard } from './components/OutletInfoCard';
import { OrderActivityLogs } from './components/OrderActivityLogs';
import { PaymentTransactionLogs } from './components/PaymentTransactionLogs';
import { SwitchOutletModal } from './components/SwitchOutletModal';
import { ConfirmActionModal } from './components/ConfirmActionModal';

export const LiveOrders: React.FC = () => {
  const dispatch = useAppDispatch();

  const activeTab       = useAppSelector(selectActiveTab);
  const selectedOrderId = useAppSelector(selectSelectedOrderId);
  const currentOrders   = useAppSelector(selectCurrentTabOrders);
  const isLoading       = useAppSelector(selectCurrentTabLoading);
  const currentError    = useAppSelector(selectCurrentTabError);
  const tabData         = useAppSelector(selectTabData);
  const orderDetail     = useAppSelector(selectOrderDetail);
  const orderLogs       = useAppSelector(selectOrderLogs);
  const paymentLogs     = useAppSelector(selectPaymentLogs);
  const detailLoading   = useAppSelector(selectDetailLoading);
  const detailError     = useAppSelector(selectDetailError);
  const outlets         = useAppSelector(selectOutlets);
  const outletsLoading  = useAppSelector(selectOutletsLoading);
  const outletsError    = useAppSelector(selectOutletsError);
  const isProcessing    = useAppSelector(selectProcessing);

  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<{ show: boolean; type: 'Accept' | 'Reject' | null }>({ show: false, type: null });
  const [paymentType, setPaymentType] = useState('CreditCard');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [remarks, setRemarks] = useState('');
  const [notes, setNotes] = useState('');
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [outletSearch, setOutletSearch] = useState('');

  useEffect(() => {
    if (!tabData[activeTab]) {
      dispatch(loadTabOrders(activeTab));
    } else {
      const cached = tabData[activeTab]!;
      if (cached.orders.length > 0 && !selectedOrderId) {
        dispatch(setSelectedOrderId(cached.orders[0].ID));
      }
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedOrderId) return;
    dispatch(loadOrderDetail(selectedOrderId));
  }, [selectedOrderId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (orderDetail) {
      setPaymentType(orderDetail.payment.Type);
      setRemarks(orderDetail.order.Remarks ?? '');
      setDeliveryAddress(
        orderDetail.order.Address
          ? `${orderDetail.order.Address}${orderDetail.order.Area ? `, ${orderDetail.order.Area}` : ''}`
          : ''
      );
    }
  }, [orderDetail]);

  const filteredOrders = currentOrders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.CustomerName.toLowerCase().includes(q) ||
      String(order.ID).includes(q) ||
      order.CustomerMobile.includes(q)
    );
  });

  const selectedOrder = currentOrders.find((o) => o.ID === selectedOrderId) ?? currentOrders[0] ?? null;

  const buildPayload = useCallback((overrides: Partial<ProcessOrderPayload>): ProcessOrderPayload => ({
    orderID: selectedOrder?.ID ?? 0,
    status: selectedOrder?.Status ?? '',
    rejectReason: '',
    notes,
    remarks,
    outletID: String(selectedOrder?.outletid ?? ''),
    paymentType,
    outletName: orderDetail?.order.OutletName ?? '',
    deliveryAddress,
    ipAddress: '',
    isFinalAction: false,
    ...overrides,
  }), [selectedOrder, notes, remarks, paymentType, orderDetail, deliveryAddress]);

  const handleAccept = useCallback(() => {
    const payload = buildPayload({ status: 'Confirmed', isFinalAction: true });
    dispatch(processOrderAction(payload)).unwrap().then(() => {
      setShowConfirmModal({ show: false, type: null });
      dispatch(invalidateTab(activeTab));
      dispatch(loadTabOrders(activeTab));
    }).catch(() => {/* error visible in store */});
  }, [dispatch, buildPayload, activeTab]);

  const handleReject = useCallback((rejectReason: string) => {
    const payload = buildPayload({ status: 'Rejected', rejectReason, isFinalAction: true });
    dispatch(processOrderAction(payload)).unwrap().then(() => {
      setShowConfirmModal({ show: false, type: null });
      dispatch(invalidateTab(activeTab));
      dispatch(loadTabOrders(activeTab));
    }).catch(() => {/* error visible in store */});
  }, [dispatch, buildPayload, activeTab]);

  const handleConfirmAction = useCallback((rejectReason: string) => {
    if (showConfirmModal.type === 'Accept') handleAccept();
    else if (showConfirmModal.type === 'Reject') handleReject(rejectReason);
  }, [showConfirmModal.type, handleAccept, handleReject]);

  const reloadDetail = useCallback(() => {
    if (selectedOrder) dispatch(loadOrderDetail(selectedOrder.ID));
  }, [dispatch, selectedOrder]);

  const handleSaveAddress = useCallback(() => {
    dispatch(processOrderAction(buildPayload({ deliveryAddress }))).unwrap().then(reloadDetail).catch(() => {});
  }, [dispatch, buildPayload, deliveryAddress, reloadDetail]);

  const handleSaveRemarks = useCallback(() => {
    dispatch(processOrderAction(buildPayload({ remarks }))).unwrap().then(reloadDetail).catch(() => {});
  }, [dispatch, buildPayload, remarks, reloadDetail]);

  const handleSaveNotes = useCallback(() => {
    dispatch(processOrderAction(buildPayload({ notes }))).unwrap().then(reloadDetail).catch(() => {});
  }, [dispatch, buildPayload, notes, reloadDetail]);

  const handleChangePaymentType = useCallback(() => {
    dispatch(processOrderAction(buildPayload({ paymentType }))).unwrap().then(reloadDetail).catch(() => {});
  }, [dispatch, buildPayload, paymentType, reloadDetail]);

  const handleSwitchOutlet = () => {
    setShowOutletModal(true);
    if (outlets.length === 0 && orderDetail?.order.City) {
      dispatch(loadOutlets(orderDetail.order.City));
    }
  };

  const handleOutletSelect = (_outlet: Outlet) => {
    setShowOutletModal(false);
    setOutletSearch('');
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      <StatusRail
        activeTab={activeTab}
        tabData={tabData}
        onTabChange={(tab: OrderTab) => dispatch(setActiveTab(tab))}
      />

      <OrderListPanel
        activeTab={activeTab}
        isLoading={isLoading}
        currentError={currentError}
        filteredOrders={filteredOrders}
        selectedOrderId={selectedOrderId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => {
          dispatch(invalidateTab(activeTab));
          dispatch(loadTabOrders(activeTab));
        }}
        onSelectOrder={(id) => dispatch(setSelectedOrderId(id))}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
        {!selectedOrder ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-600 flex-col gap-3">
            <ShoppingBag size={40} />
            <p className="text-sm">Select an order to view details</p>
          </div>
        ) : (
          <>
            <OrderDetailHeader
              selectedOrder={selectedOrder}
              orderDetail={orderDetail}
              onReject={() => setShowConfirmModal({ show: true, type: 'Reject' })}
              onAccept={() => setShowConfirmModal({ show: true, type: 'Accept' })}
            />

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <RefreshCw className="animate-spin text-teal-500" size={28} />
                  <p className="text-slate-400 text-sm">Loading order details…</p>
                </div>
              ) : detailError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertCircle className="mx-auto text-rose-400" size={28} />
                  <p className="text-slate-500 text-sm">{detailError}</p>
                </div>
              ) : orderDetail ? (
                <>
                  <OrderInfoGrid orderDetail={orderDetail} />
                  <OrderItemsTable
                    orderDetail={orderDetail}
                    paymentType={paymentType}
                    notes={notes}
                    remarks={remarks}
                    deliveryAddress={deliveryAddress}
                    isProcessing={isProcessing}
                    onPaymentTypeChange={setPaymentType}
                    onNotesChange={setNotes}
                    onRemarksChange={setRemarks}
                    onDeliveryAddressChange={setDeliveryAddress}
                    onSaveAddress={handleSaveAddress}
                    onSaveNotes={handleSaveNotes}
                    onSaveRemarks={handleSaveRemarks}
                    onChangePaymentType={handleChangePaymentType}
                  />
                  <OutletInfoCard orderDetail={orderDetail} onSwitchOutlet={handleSwitchOutlet} />
                  {orderLogs && <OrderActivityLogs orderLogs={orderLogs} />}
                  {paymentLogs.length > 0 && <PaymentTransactionLogs paymentLogs={paymentLogs} />}
                </>
              ) : null}
            </div>
          </>
        )}
      </div>

      {showOutletModal && (
        <SwitchOutletModal
          selectedOrderId={selectedOrder?.ID}
          outlets={outlets}
          outletsLoading={outletsLoading}
          outletsError={outletsError}
          currentOutletName={orderDetail?.order.OutletName ?? ''}
          outletSearch={outletSearch}
          onSearchChange={setOutletSearch}
          onClose={() => { setShowOutletModal(false); setOutletSearch(''); }}
          onSelect={handleOutletSelect}
          onRetry={() => orderDetail?.order.City && dispatch(loadOutlets(orderDetail.order.City))}
        />
      )}

      {showConfirmModal.show && showConfirmModal.type && (
        <ConfirmActionModal
          type={showConfirmModal.type}
          orderId={selectedOrder?.ID}
          isProcessing={isProcessing}
          onConfirm={handleConfirmAction}
          onCancel={() => setShowConfirmModal({ show: false, type: null })}
        />
      )}
    </div>
  );
};
