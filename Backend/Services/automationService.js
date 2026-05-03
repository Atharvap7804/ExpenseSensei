
import cron from 'node-cron';
import User from '../models/User.js'; // Ensure you include the .js extension
import Transaction from '../models/Transaction.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const startMonthlyAutomation = () => {
 
  cron.schedule('0 0 * * *', async () => {
    console.log("Running Daily Financial Audit Check...");
    try {
      const users = await User.find({});
      const today = new Date();

      for (const user of users) {
        const lastReset = user.lastResetDate ? new Date(user.lastResetDate) : new Date(user.createdAt);
        const diffTime = Math.abs(today - lastReset);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

       
        if (diffDays >= 30) {
          console.log(`Processing 30-day reset for: ${user.email}`);
          
         
          const transactions = await Transaction.find({ 
            user: user._id,
            date: { $gte: lastReset } 
          });

      
          const csvHeader = "Date,Category,Type,Amount,Note\n";
          const csvRows = transactions.map(t => 
            `${new Date(t.date).toLocaleDateString()},${t.category},${t.type},${t.amount},"${t.note || ''}"`
          ).join("\n");
          const csvContent = csvHeader + csvRows;

          
          await transporter.sendMail({
            from: `"ExpenseSensei Audit" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Monthly Financial Audit Report 📊",
            text: `Hello ${user.name}, your 30-day financial cycle has ended. Attached is your expense audit.`,
            attachments: [{ filename: `Audit_${user.name}.csv`, content: csvContent }]
          });

         
          const remainingBudget = (user.limit || 0) - (user.currentMonthExpenses || 0);
          
         
          if (remainingBudget > 0) {
            user.savings = (user.savings || 0) + remainingBudget;
          }

         
          user.currentMonthExpenses = 0;
          user.income = 0;
          user.lastResetDate = today;
          
          await user.save();
          console.log(`Reset successful for ${user.email}. Savings updated.`);
        }
      }
    } catch (error) {
      console.error("Automation Error:", error);
    }
  });
};