export const getBillingEmailTemplate = (customerName: string, month: string, amount: number, dueDate: string) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h2 style="color: #1a1a1a; margin-top: 0;">Water Jar Delivery Invoice</h2>
      <p>Dear ${customerName},</p>
      <p>Your monthly billing invoice for the month of <strong>${month}</strong> has been generated.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f9f9f9;">
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Description</th>
          <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">Water Jar Deliveries for ${month}</td>
          <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">₹${amount.toFixed(2)}</td>
        </tr>
        <tr style="font-weight: bold;">
          <td style="padding: 8px;">Total Due</td>
          <td style="text-align: right; padding: 8px;">₹${amount.toFixed(2)}</td>
        </tr>
      </table>
      <p><strong>Payment Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">This is a system generated billing email. If you have questions, please contact your vendor.</p>
    </div>
  `
}
