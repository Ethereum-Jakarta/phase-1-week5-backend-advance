// src/config/amqp.ts
import amqp from 'amqplib'

export const connectQueue = async () => {
    try {
        const connection = await amqp.connect(process.env.CLOUDAMQP_URL!)
        const channel = await connection.createChannel()
        
        // Declare queues
        await channel.assertQueue('loan.due')
        await channel.assertQueue('book.returned')

        console.log('Connected to CloudAMQP')
        
        return channel
    } catch (error) {
        console.error('Error connecting to CloudAMQP:', error)
        throw error
    }
}