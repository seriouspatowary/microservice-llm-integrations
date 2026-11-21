import amqp from "amqplib";

const QUEUE = "expense.categorization";

export async function publishExpenseCreated(
  expense: { id: string; title: string }
) {
  const url = process.env.RABBITMQ_URL;

  if (!url) {
    throw new Error("RABBITMQ_URL is not configured");
  }

  const connection = await amqp.connect(url);
  const channel = await connection.createConfirmChannel();

  try {
    await channel.assertQueue(QUEUE, {
      durable: true
    });

    channel.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify({
        expenseId: expense.id,
        title: expense.title
      })),
      {
        persistent: true,
        contentType: "application/json"
      }
    );

    await channel.waitForConfirms();

    console.log("Expense categorization job published:", expense.id);
  } finally {
    await channel.close();
    await connection.close();
  }
}