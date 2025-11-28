
import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Tabs, Button } from '../../components/UI';
import { Download, Printer } from 'lucide-react';

export const Reports = () => {
  const { invoices, customers, payments, calculateClientScore, settings } = useApp();
  const [activeTab, setActiveTab] = React.useState('Collection');

  // --- Collection Data (Last 6 Months) ---
  const getCollectionData = () => {
     const months = [];
     for(let i=5; i>=0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        const total = payments.filter(p => {
           const pd = new Date(p.date);
           return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        }).reduce((sum, p) => sum + p.amount, 0);

        months.push({ name: key, Amount: total });
     }
     return months;
  };

  // --- Ageing Data ---
  const getAgeingData = () => {
     let b1=0, b2=0, b3=0, b4=0; // 0-30, 31-60, 61-90, 90+
     const today = new Date();

     invoices.forEach(inv => {
        const balance = inv.amount - inv.paidAmount;
        if(balance <= 0) return;
        const due = new Date(inv.dueDate);
        if(due >= today) { b1 += balance; return; } 

        const days = Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
        if(days <= 30) b1 += balance;
        else if(days <= 60) b2 += balance;
        else if(days <= 90) b3 += balance;
        else b4 += balance;
     });

     return [
        { name: 'Current/0-30', value: b1 },
        { name: '31-60 Days', value: b2 },
        { name: '61-90 Days', value: b3 },
        { name: '90+ Days', value: b4 },
     ];
  };

  const downloadCSV = () => {
    let headers = [];
    let rows: any[] = [];
    let filename = 'report.csv';

    if (activeTab === 'Collection') {
        headers = ['Month', 'Collection Amount'];
        rows = getCollectionData().map(d => [d.name, d.Amount]);
        filename = 'collection_report.csv';
    } else if (activeTab === 'Ageing Analysis') {
        headers = ['Bucket', 'Outstanding Amount'];
        rows = getAgeingData().map(d => [d.name, d.value]);
        filename = 'ageing_report.csv';
    } else if (activeTab === 'Risk Report') {
        headers = ['Customer', 'Risk Score', 'Risk Label'];
        rows = customers.map(c => {
            const risk = calculateClientScore(c.id);
            return [c.companyName, risk.score.toFixed(1), risk.label];
        });
        filename = 'risk_report.csv';
    }

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-gray-900">Business Reports</h2>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Print PDF
            </Button>
            <Button variant="primary" onClick={downloadCSV}>
                <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
        </div>
      </div>
      
      <div className="print:hidden">
        <Tabs tabs={['Collection', 'Ageing Analysis', 'Risk Report']} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === 'Collection' && (
         <div className="bg-white p-6 rounded-lg shadow print:shadow-none">
            <h3 className="text-lg font-semibold mb-6">Monthly Collection Trend</h3>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getCollectionData()}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip formatter={(val: number) => `${settings.currency} ${val.toLocaleString()}`} />
                     <Line type="monotone" dataKey="Amount" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-8 hidden print:block">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Month</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getCollectionData().map((d, i) => (
                            <tr key={i} className="border-t">
                                <td className="px-4 py-2">{d.name}</td>
                                <td className="px-4 py-2 text-right">{settings.currency} {d.Amount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
      )}

      {activeTab === 'Ageing Analysis' && (
         <div className="bg-white p-6 rounded-lg shadow print:shadow-none">
            <h3 className="text-lg font-semibold mb-6">Outstanding Ageing Analysis</h3>
            <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getAgeingData()}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip formatter={(val: number) => `${settings.currency} ${val.toLocaleString()}`} />
                     <Bar dataKey="value" fill="#3B82F6" barSize={60} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-8 hidden print:block">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Bucket</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getAgeingData().map((d, i) => (
                            <tr key={i} className="border-t">
                                <td className="px-4 py-2">{d.name}</td>
                                <td className="px-4 py-2 text-right">{settings.currency} {d.value.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
      )}

      {activeTab === 'Risk Report' && (
         <div className="bg-white shadow rounded-lg overflow-hidden print:shadow-none print:border">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                  {customers.map(c => {
                     const risk = calculateClientScore(c.id);
                     return (
                        <tr key={c.id}>
                           <td className="px-6 py-4 font-medium">{c.companyName}</td>
                           <td className="px-6 py-4">{risk.score.toFixed(1)} / 5.0</td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                 risk.color === 'red' ? 'bg-red-100 text-red-800' : 
                                 risk.color === 'orange' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                              }`}>{risk.label}</span>
                           </td>
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      )}
    </div>
  );
};
