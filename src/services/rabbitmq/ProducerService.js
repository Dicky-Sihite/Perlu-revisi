const amqp = require('amqplib');
const config = require('../../utils/config');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(config.rabbitMq.server);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    await connection.close();
  },
};

module.exports = ProducerService;