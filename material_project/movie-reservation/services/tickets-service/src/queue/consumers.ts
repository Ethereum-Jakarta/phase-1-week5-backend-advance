// src/queue/consumers.ts
import { connectQueue } from '../config/amqp'
import { TicketsServices } from '../services/tickets.services'

const ticketsService = new TicketsServices()

export const setupConsumers = async () => {
  try {
    const channel = await connectQueue()

    // Payment ticket consumer
    channel.consume('payment.ticket', async (msg) => {
      if (msg) {
        try {
          const { userId, bookId, dueDate } = JSON.parse(msg.content.toString())
          await ticketsService.handlePaymentTicket(userId, bookId, dueDate)
          channel.ack(msg)
        } catch (error) {
          console.error('Error processing payment.ticket:', error)
          channel.nack(msg)
        }
      }
    })

    // Book returned consumer
    channel.consume('book.returned', async (msg) => {
      if (msg) {
        try {
          const { userId, bookId } = JSON.parse(msg.content.toString())
          await ticketsService.handleBookReturnedNotification(userId, bookId)
          channel.ack(msg)
        } catch (error) {
          console.error('Error processing book.returned:', error)
          channel.nack(msg)
        }
      }
    })

    console.log('RabbitMQ consumers setup completed')
  } catch (error) {
    console.error('Error setting up RabbitMQ consumers:', error)
  }
}