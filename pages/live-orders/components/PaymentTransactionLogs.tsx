import React from 'react';
import { CreditCard } from 'lucide-react';
import type { PaymentLog } from '../../../services/ordersApi';

interface Props {
  paymentLogs: PaymentLog[];
}

export const PaymentTransactionLogs: React.FC<Props> = ({ paymentLogs }) => (
  <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
        <CreditCard size={16} className="text-teal-500" />
        Payment Transaction
      </h3>
      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
        {paymentLogs.length} Record{paymentLogs.length > 1 ? 's' : ''}
      </span>
    </div>

    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {paymentLogs.map((log) => (
        <div key={log.ID} className="p-5 space-y-4">
          {/* Decision + Signature */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                log.decision === 'ACCEPT'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              }`}>
                {log.decision}
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                log.signatureresult === 'Match'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}>
                Sig: {log.signatureresult}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">
              {new Date(log.Created).toLocaleString()}
            </span>
          </div>

          {/* Card Details */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Card Number</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{log.req_card_number}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Exp: {log.req_card_expiry_date}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scheme / Issuer</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.score_card_scheme}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{log.score_card_issuer}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Auth Amount</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {log.req_currency} {Number(log.auth_amount).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Code: {log.auth_code}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Auth Time</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.auth_time.replace('T', ' ')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Response: {log.auth_response}</p>
            </div>
          </div>

          {/* Transaction ID + Message */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
              <p className="text-[10px] font-mono text-slate-700 dark:text-slate-300 break-all">{log.transaction_id}</p>
            </div>
            <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gateway Message</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">{log.message}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Reason: {log.reason_code}</p>
            </div>
          </div>

          {/* Fraud Score + Billing */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:w-40 shrink-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fraud Score</p>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-black leading-none ${
                  Number(log.score_score_result) <= 30 ? 'text-emerald-500'
                  : Number(log.score_score_result) <= 60 ? 'text-amber-500'
                  : 'text-rose-500'
                }`}>
                  {log.score_score_result}
                </span>
                <span className="text-[10px] text-slate-400 pb-0.5">/ 100</span>
              </div>
              {log.score_suspicious_info && (
                <p className="text-[9px] text-amber-500 font-bold mt-1 break-all">{log.score_suspicious_info}</p>
              )}
            </div>
            <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billing Info</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {log.req_bill_to_forename} {log.req_bill_to_surname}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{log.req_bill_to_email}</p>
              <p className="text-[10px] text-slate-400">{log.req_bill_to_address_city}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
