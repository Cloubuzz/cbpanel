import React, { useState } from 'react';
import { GripVertical, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ModifierGroup } from '../types';

interface SortableModifierItemProps {
  group: ModifierGroup & { options?: { id: number; name: string; price: number }[] };
  onDelete: () => void;
}

export const SortableModifierItem: React.FC<SortableModifierItemProps> = ({ group, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id });
  const [isExpanded, setIsExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : ('auto' as const),
    opacity: isDragging ? 0.5 : 1,
  };

  const hasOptions = Array.isArray(group.options) && group.options.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 group/mod-item transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-teal-500/20' : ''
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <GripVertical size={16} />
          </button>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{group.name}</p>
              <span className="flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-md uppercase tracking-wider">
                <CheckCircle2 size={10} /> Saved Modifier
              </span>
            </div>
            <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold mt-0.5">
              Selection: {group.minSelection}-{group.maxSelection} {hasOptions ? `• ${group.options!.length} Options` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasOptions && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-teal-500 transition-all rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
              title="Toggle options"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover/mod-item:opacity-100"
            title="Remove modifier"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {hasOptions && isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 rounded-b-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Options in this group:</p>
          <div className="grid grid-cols-2 gap-2">
            {group.options!.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center justify-between px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{opt.name}</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 ml-2">
                  {opt.price > 0 ? `+RS ${opt.price}` : 'Free'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
