require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Telegram Bot Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const bot = new TelegramBot(
    process.env.BOT_TOKEN,
    {
        polling: true
    }
);

console.log("Bot is running...");

const TOPICS = {
    4: "arrays",
    6: "strings",
    7: "linkedlist",
    8: "stackandqueue",
    9: "trees",
    10: "graphs",
    11: "dynamic-programming"
};

bot.on('message', async (msg) => {

    try {
        const text = msg.text || "";
        if (!text) return;

        const topicName =
            TOPICS[msg.message_thread_id];

        if (!topicName) return;

        const hashtags =
            text.match(/#\w+/g) || [];

        const links =
            text.match(/https?:\/\/\S+/g) || [];

        const resourceType =
            hashtags[0]?.replace('#', '') || "unknown";

        const lines = text
            .split('\n')
            .filter(line => line.trim() !== "");

        const title =
            lines[1] || "Untitled";

        const link =
            links[0] || null;

        const { data, error } = await supabase
            .from('resources')
            .insert([
                {
                    topic: topicName,
                    resource_type: resourceType,
                    title: title,
                    link: link,
                    message: text,
                    telegram_message_id:msg.message_id,
                    telegram_topic_id:msg.message_thread_id
                }
            ]);
        if (error) {
            console.log("SUPABASE ERROR:");
            console.log(error);
        } else {
            console.log("RESOURCE SAVED");
            console.log({
                topic: topicName,
                resource_type: resourceType,
                title: title,
                link: link
            });
        }
    } catch (err) {
        console.log("SERVER ERROR:");
        console.log(err);
    }
});