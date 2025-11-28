
import { Customer, Invoice, JobType, InvoiceStatus, FollowUp, Visit, CompanySettings, ReminderSettings, Payment } from './types';

export const DEFAULT_SETTINGS: CompanySettings = {
  name: "PrintPay Solutions",
  address: "123 Industrial Area, Okhla Phase III, New Delhi",
  email: "accounts@printpay.com",
  phone: "+91 98765 43210",
  currency: "INR",
  taxLabel: "GST"
};

export const DEFAULT_REMINDER_RULES: ReminderSettings = {
  daysBeforeDue: 3,
  remindOnDue: true,
  daysAfterDueRepeat: 7,
  enableWhatsApp: true,
  enableEmail: true,
  enableSMS: false
};

const pastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const generateMockData = () => {
  const customers: Customer[] = [];
  const invoices: Invoice[] = [];
  const followUps: FollowUp[] = [];
  const payments: Payment[] = [];
  const visits: Visit[] = [];

  const firstNames = ['Amit', 'Rahul', 'Priya', 'Suresh', 'Deepak', 'Anjali', 'Vikram', 'Neha', 'Rohan', 'Sneha', 'Karan', 'Manish', 'Pooja', 'Vivek', 'Arjun', 'Simran', 'Varun', 'Kavita', 'Sanjay', 'Rekha', 'Raj', 'Mohan', 'Sita', 'Gita', 'John', 'David', 'Sarah', 'Michael', 'Robert', 'William', 'Aditya', 'Meera', 'Kabir', 'Tara', 'Vihaan', 'Myra'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Mehta', 'Reddy', 'Nair', 'Joshi', 'Malhotra', 'Bhatia', 'Saxena', 'Iyer', 'Chopra', 'Desai', 'Jain', 'Agarwal', 'Mishra', 'Yadav', 'Khan', 'Ali', 'Das', 'Bose', 'Ray', 'Sarkar', 'Shah', 'Modi', 'Gandhi', 'Nehru', 'Kapoor', 'Khanna'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Noida', 'Gurgaon', 'Faridabad', 'Nasik'];
  const jobTypes = Object.values(JobType);
  const companySuffixes = ['Enterprises', 'Printers', 'Packaging', 'Solutions', 'Works', 'Graphics', 'Industries', 'Press', 'Media', 'Designs', 'Packers', 'Creations', 'Global', 'Techno', 'Impex'];

  // 1. Generate 100 Customers
  for (let i = 1; i <= 100; i++) {
     const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
     const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
     const city = cities[Math.floor(Math.random() * cities.length)];
     const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
     const companyName = `${fname} ${lname} ${suffix}`; // e.g. "Amit Sharma Packaging" OR could be generic like "Apex Printers"
     
     // Sometimes use a generic prefix
     const genericPrefixes = ['Apex', 'Zenith', 'Royal', 'Star', 'Super', 'Fine', 'Quick', 'Smart', 'Elite', 'Prime', 'Ultra', 'Max'];
     const finalCompanyName = Math.random() > 0.5 ? companyName : `${genericPrefixes[Math.floor(Math.random() * genericPrefixes.length)]} ${suffix}`;

     const customer: Customer = {
        id: `c${i}`,
        name: `${fname} ${lname}`,
        companyName: finalCompanyName,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@example.com`,
        mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        city: city,
        creditLimit: Math.floor(Math.random() * 20 + 1) * 25000,
        currency: 'INR',
        tags: [jobTypes[Math.floor(Math.random() * jobTypes.length)]],
        address: `${Math.floor(Math.random() * 100)}, Industrial Area, ${city}`,
        gst: `27${fname.toUpperCase().substring(0,1)}${lname.toUpperCase().substring(0,4)}${Math.floor(1000+Math.random()*9000)}A1Z${Math.floor(Math.random()*9)}`
     };
     customers.push(customer);

     // 2. Generate Invoices per Customer (0 to 8)
     const numInvoices = Math.floor(Math.random() * 9); 
     for (let j = 0; j < numInvoices; j++) {
        const invId = `inv-${i}-${j}`;
        // Amount between 1000 and 100,000
        const amount = Math.floor(Math.random() * 990) * 100 + 1000;
        
        // Date logic: Some old, some recent
        const daysAgo = Math.floor(Math.random() * 120); // 0 to 120 days ago
        const date = pastDate(daysAgo);
        const termDays = 30;
        const dueDateObj = new Date(date);
        dueDateObj.setDate(dueDateObj.getDate() + termDays);
        const dueDate = dueDateObj.toISOString().split('T')[0];
        
        // Determine Status
        let status = InvoiceStatus.Pending;
        let paidAmount = 0;
        const rand = Math.random();
        
        // 40% Paid, 20% Partial, 40% Unpaid (Pending/Overdue)
        if (rand < 0.4) {
            status = InvoiceStatus.Paid;
            paidAmount = amount;
        } else if (rand < 0.6) {
            status = InvoiceStatus.PartiallyPaid;
            paidAmount = Math.floor(amount * (0.1 + Math.random() * 0.8)); // 10% to 90% paid
        } else {
             // If today is past due date, it's overdue
             if (new Date() > dueDateObj) {
                 status = InvoiceStatus.Overdue;
             } else {
                 status = InvoiceStatus.Pending;
             }
        }

        const invoice: Invoice = {
            id: invId,
            invoiceNumber: `INV-${2023000 + (i * 100) + j}`,
            date: date,
            dueDate: dueDate,
            customerId: customer.id,
            jobName: `${['Brochure', 'Flyer', 'Business Cards', 'Packaging Box', 'Label', 'Banner', 'Poster', 'Booklet', 'Carton', 'Sticker'][Math.floor(Math.random()*10)]} Printing`,
            jobType: customer.tags[0],
            amount: amount,
            paidAmount: Math.floor(paidAmount),
            status: status,
            currency: 'INR',
            payments: []
        };

        // Generate payments if paid/partial
        if (paidAmount > 0) {
            const payId = `pay-${invId}`;
            // Payment date is random between invoice date and today/due date
            const payDaysAgo = Math.max(0, daysAgo - Math.floor(Math.random() * 20));
            
            const mode = ['NEFT', 'UPI', 'Cheque', 'Cash'][Math.floor(Math.random()*4)];
            const payment: Payment = {
                id: payId,
                invoiceId: invId,
                customerId: customer.id,
                date: pastDate(payDaysAgo),
                amount: Math.floor(paidAmount),
                mode: mode
            };
            
            if (mode === 'Cheque') {
                // Determine Cheque status
                let chqStatus: 'Cleared' | 'Bounced' | 'Pending' = 'Cleared';
                if (payDaysAgo < 2) chqStatus = 'Pending'; // Very recent
                else if (Math.random() > 0.9) chqStatus = 'Bounced'; // 10% chance bounce

                // Deposit date usually a few days after payment receipt
                const depDaysAgo = Math.max(0, payDaysAgo - 2);

                payment.chequeDetails = {
                    chequeNumber: `${Math.floor(Math.random() * 899999 + 100000)}`,
                    bankName: ['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB'][Math.floor(Math.random()*6)],
                    depositDate: pastDate(depDaysAgo),
                    status: chqStatus
                };
            }
            invoice.payments.push(payment);
            payments.push(payment);
        }

        invoices.push(invoice);
     }
     
     // 3. Generate FollowUps (Random interactions)
     if (Math.random() > 0.6) {
         const numFollowUps = Math.floor(Math.random() * 3) + 1;
         for(let k=0; k<numFollowUps; k++) {
             followUps.push({
                 id: `fu-${i}-${k}`,
                 customerId: customer.id,
                 date: pastDate(Math.floor(Math.random() * 30)),
                 mode: ['Call', 'WhatsApp', 'Email'][Math.floor(Math.random()*3)] as any,
                 status: ['Promised', 'No Answer', 'Will Pay', 'Sent'][Math.floor(Math.random()*4)] as any,
                 contactPerson: fname,
                 notes: 'Followed up regarding pending balance.',
                 userId: 'u1'
             });
         }
     }

     // 4. Generate Field Visits (Rare)
     if (Math.random() > 0.85) {
        visits.push({
            id: `v-${i}`,
            customerId: customer.id,
            date: pastDate(Math.floor(Math.random() * 60)),
            userId: 'u1',
            purpose: ['Payment Collection', 'New Order Discussion', 'Relationship Building'][Math.floor(Math.random()*3)],
            notes: 'Met with owner, positive response.',
            location: customer.city
        });
     }
  }

  return { customers, invoices, followUps, payments, visits };
};

const generatedData = generateMockData();

export const MOCK_CUSTOMERS = generatedData.customers;
export const MOCK_INVOICES = generatedData.invoices;
export const MOCK_FOLLOWUPS = generatedData.followUps;
export const MOCK_PAYMENTS = generatedData.payments;
export const MOCK_VISITS = generatedData.visits;

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    customers: "Customers",
    invoices: "Invoices",
    payments: "Payments",
    followups: "Follow-Ups",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    customers: "ग्राहक",
    invoices: "चालान",
    payments: "भुगतान",
    followups: "फालो-अप",
    reports: "रिपोर्ट",
    settings: "सेटिंग्स",
    logout: "लॉग आउट",
  }
};
