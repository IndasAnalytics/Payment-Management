
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InvoiceStatus } from '../../types';

export const CalendarView = () => {
  const { invoices, followUps, customers } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border-r border-b"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const dayInvoices = invoices.filter(i => i.dueDate === dateStr && (i.amount - i.paidAmount) > 0);
      const dayFollowUps = followUps.filter(f => f.nextFollowUpDate === dateStr);

      days.push(
        <div key={day} className="h-32 border-r border-b p-2 overflow-y-auto bg-white hover:bg-gray-50 transition-colors">
          <div className="font-semibold text-gray-700 mb-1">{day}</div>
          
          {/* Invoices Due */}
          {dayInvoices.map(inv => (
             <div key={inv.id} className="mb-1 text-xs p-1 bg-red-50 text-red-700 rounded border border-red-100 truncate" title={`Due: ${inv.invoiceNumber} - ₹${(inv.amount - inv.paidAmount)}`}>
                <span className="font-bold">Due:</span> ₹{(inv.amount - inv.paidAmount).toLocaleString()}
             </div>
          ))}

          {/* Follow Ups */}
          {dayFollowUps.map(fu => {
             const cust = customers.find(c => c.id === fu.customerId);
             return (
               <div key={fu.id} className="mb-1 text-xs p-1 bg-blue-50 text-blue-700 rounded border border-blue-100 truncate" title={`Call: ${cust?.companyName}`}>
                  <Phone className="h-3 w-3 inline mr-1" />{cust?.companyName?.substring(0, 10)}..
               </div>
             )
          })}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold text-gray-900">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 border-l border-t flex-1">
        {renderCalendar()}
      </div>

      <div className="p-4 border-t bg-gray-50 text-xs flex gap-4">
         <div className="flex items-center"><div className="w-3 h-3 bg-red-100 border border-red-200 mr-2"></div> Invoice Due</div>
         <div className="flex items-center"><div className="w-3 h-3 bg-blue-100 border border-blue-200 mr-2"></div> Follow Up Call</div>
      </div>
    </div>
  );
};
