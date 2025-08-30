// notification-service/src/templates/emailTemplates.ts

export const emailTemplates = {

  ticketPayment: (movieTitle: string, seatCode: string, start: string, linkPayment: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Payment Ticket</h2>
      <p>Your ticket has been created for movie "<strong>${movieTitle}</strong>" on seat "<strong>${seatCode}</strong>" .</p>
      <p>is date start time on ${new Date(start).toLocaleDateString()}.</p>
      <p>Please pay your ticket it to avoid any late fees.</p>
      <br>
      <p>You can continue the payment here: <a href="${linkPayment}">Click Here</a></p>
      <p>or on this link ${linkPayment}</p>
    </div>
  `,

  ticketPayed: (movieTitle: string, seatCode: string, start: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Payment Ticket</h2>
      <p>Your ticket has been "<strong>payed</strong>"for movie "<strong>${movieTitle}</strong>" on seat "<strong>${seatCode}</strong>" .</p>
      <p>is movie start time on ${new Date(start).toLocaleDateString()}.</p>
      <p>Dont forget for the movie the ticket cant be return.</p>
      <br>
      <p>Thank you for using our movie reservation service!</p>
    </div>
  `,

  newBooksAvailable: (books: Array<{ title: string, author: string }>) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>New Books Available!</h2>
      <p>Check out our latest additions:</p>
      <ul>
        ${books.map(book => `
          <li><strong>${book.title}</strong> by ${book.author}</li>
        `).join('')}
      </ul>
      <br>
      <p>Visit our library to borrow these books today!</p>
    </div>
  `,

  test: () => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Test Notification</h2>
      <p>This is a test notification from the Digital Library system.</p>
      <p>If you received this email, the notification system is working correctly!</p>
      <br>
      <p>Time sent: ${new Date().toLocaleString()}</p>
    </div>
  `
}