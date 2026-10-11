import React, { useState } from 'react';
import { X, Bell, MessageSquare, Mail, Smartphone, Check } from 'lucide-react';

interface ReminderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTestNotification: (channel: 'whatsapp' | 'email' | 'in_app', timeBefore: string) => void;
}

export const ReminderConfigModal: React.FC<ReminderConfigModalProps> = ({
  isOpen, onClose, onSendTestNotification
}) => {
  const [timing, setTiming] = useState<'10_min' | '30_min' | 'custom'>('10_min');
  const [customMins, setCustomMins] = useState(15);
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableInApp, setEnableInApp] = useState(true);
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleTestDispatch = async () => {
    setTestSent(true);
    const chosenTiming = timing === 'custom' ? `${customMins} mins` : timing === '10_min' ? '10 mins' : '30 mins';
    onSendTestNotification(enableWhatsApp ? 'whatsapp' : 'email', chosenTiming);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Study Reminder Preferences</h2>
              <p className="text-xs text-slate-500">Omni-channel alerts for upcoming study slots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Timing Option */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Notification Timing:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTiming('10_min')}
                className={`py-2 px-2 rounded-xl border text-center font-semibold transition ${
                  timing === '10_min'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                10 mins before
              </button>
              <button
                type="button"
                onClick={() => setTiming('30_min')}
                className={`py-2 px-2 rounded-xl border text-center font-semibold transition ${
                  timing === '30_min'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                30 mins before
              </button>
              <button
                type="button"
                onClick={() => setTiming('custom')}
                className={`py-2 px-2 rounded-xl border text-center font-semibold transition ${
                  timing === 'custom'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Custom Alert
              </button>
            </div>

            {timing === 'custom' && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-slate-600 dark:text-slate-400">Trigger alert</span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={customMins}
                  onChange={e => setCustomMins(Number(e.target.value))}
                  className="w-16 p-1 rounded-lg border border-slate-300 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <span className="text-slate-600 dark:text-slate-400">minutes prior to scheduled slot</span>
              </div>
            )}
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Dispatch Channels:
            </label>
            <div className="space-y-2">
              
              {/* WhatsApp Toggle */}
              <div
                onClick={() => setEnableWhatsApp(!enableWhatsApp)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">WhatsApp Business API</p>
                    <p className="text-[10px] text-slate-400">Direct message alert with quick slot start link</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  enableWhatsApp ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {enableWhatsApp && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Email Toggle */}
              <div
                onClick={() => setEnableEmail(!enableEmail)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Institutional Email (SendGrid)</p>
                    <p className="text-[10px] text-slate-400">Detailed summary with study checklist</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  enableEmail ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {enableEmail && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* In-App Toggle */}
              <div
                onClick={() => setEnableInApp(!enableInApp)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:purple-950 text-purple-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">In-App Banner & Sound Alert</p>
                    <p className="text-[10px] text-slate-400">Desktop push and live navigation badge</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  enableInApp ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {enableInApp && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

            </div>
          </div>

          {/* Test Dispatch Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestDispatch}
              className="w-full py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center space-x-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
            >
              {testSent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Test Notification Dispatched via WhatsApp/Email!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Immediate Test Reminder via API</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              Save Reminder Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
