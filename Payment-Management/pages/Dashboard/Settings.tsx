
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button, InputGroup } from '../../components/UI';

export const Settings = () => {
  const { settings, updateSettings, reminderRules, updateReminderRules } = useApp();

  const handleCompanyChange = (field: string, value: string) => {
    updateSettings({ ...settings, [field]: value });
  };

  const handleRuleChange = (field: string, value: any) => {
    updateReminderRules({ ...reminderRules, [field]: value });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>

      {/* Company Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="text-lg font-semibold mb-4 border-b pb-2">Company Profile</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Company Name" value={settings.name} onChange={(e:any) => handleCompanyChange('name', e.target.value)} />
            <InputGroup label="Tax Label (GST/VAT)" value={settings.taxLabel} onChange={(e:any) => handleCompanyChange('taxLabel', e.target.value)} />
            <InputGroup label="Address" value={settings.address} onChange={(e:any) => handleCompanyChange('address', e.target.value)} />
            <InputGroup label="Currency Symbol" value={settings.currency} onChange={(e:any) => handleCompanyChange('currency', e.target.value)} />
            <InputGroup label="Email" value={settings.email} onChange={(e:any) => handleCompanyChange('email', e.target.value)} />
            <InputGroup label="Phone" value={settings.phone} onChange={(e:any) => handleCompanyChange('phone', e.target.value)} />
         </div>
      </div>

      {/* Automated Reminder Rules */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="text-lg font-semibold mb-4 border-b pb-2">Automated Reminder Rules</h3>
         <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
               <label className="text-sm font-medium">Send reminder X days BEFORE due date</label>
               <input 
                  type="number" className="border rounded w-20 p-1" 
                  value={reminderRules.daysBeforeDue} 
                  onChange={(e) => handleRuleChange('daysBeforeDue', Number(e.target.value))}
               />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
               <label className="text-sm font-medium">Send reminder ON due date</label>
               <input 
                  type="checkbox" className="h-5 w-5"
                  checked={reminderRules.remindOnDue} 
                  onChange={(e) => handleRuleChange('remindOnDue', e.target.checked)}
               />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
               <label className="text-sm font-medium">Repeat overdue reminder every X days</label>
               <input 
                  type="number" className="border rounded w-20 p-1" 
                  value={reminderRules.daysAfterDueRepeat} 
                  onChange={(e) => handleRuleChange('daysAfterDueRepeat', Number(e.target.value))}
               />
            </div>

            <div className="mt-4">
               <h4 className="font-medium text-sm mb-2">Enabled Channels</h4>
               <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                     <input type="checkbox" checked={reminderRules.enableWhatsApp} onChange={(e) => handleRuleChange('enableWhatsApp', e.target.checked)} />
                     WhatsApp
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                     <input type="checkbox" checked={reminderRules.enableEmail} onChange={(e) => handleRuleChange('enableEmail', e.target.checked)} />
                     Email
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                     <input type="checkbox" checked={reminderRules.enableSMS} onChange={(e) => handleRuleChange('enableSMS', e.target.checked)} />
                     SMS
                  </label>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
