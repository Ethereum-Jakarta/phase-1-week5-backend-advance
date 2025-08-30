// notification-service/src/templates/emailTemplates.ts
export const emailTemplates = {
  loanDue: (bookTitle: string, dueDate: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Book Due Reminder</h2>
      <p>Your book "<strong>${bookTitle}</strong>" is due on ${new Date(dueDate).toLocaleDateString()}.</p>
      <p>Please return it to avoid any late fees.</p>
      <br>
      <p>Thank you for using our library service!</p>
    </div>
  `,

  bookReturned: (bookTitle: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Book Returned Successfully</h2>
      <p>Thank you for returning "<strong>${bookTitle}</strong>".</p>
      <p>We hope you enjoyed reading it!</p>
      <br>
      <p>Feel free to browse our catalog for more books.</p>
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