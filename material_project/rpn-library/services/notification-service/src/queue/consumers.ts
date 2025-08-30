// src/queue/consumers.ts
import { connectQueue } from '../config/amqp'
import { NotificationService } from '../services/notificationService'

const notificationService = new NotificationService()

export const setupConsumers = async () => {
    try {
        const channel = await connectQueue()

        // Loan due consumer
        channel.consume('loan.due', async (msg) => {
            if (msg) {
                try {
                    const { userId, bookId, dueDate } = JSON.parse(msg.content.toString())
                    await notificationService.handleLoanDueNotification(userId, bookId, dueDate)
                    channel.ack(msg)
                } catch (error) {
                    console.error('Error processing loan.due:', error)
                    channel.nack(msg)
                }
            }
        })

        // Book returned consumer
        channel.consume('book.returned', async (msg) => {
            if (msg) {
                try {
                    const { userId, bookId } = JSON.parse(msg.content.toString())
                    await notificationService.handleBookReturnedNotification(userId, bookId)
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