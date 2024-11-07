require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const token = process.env.WHATSAPP_API_TOKEN;
const verifyToken = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());

// Webhook endpoint to receive messages from WhatsApp
app.post('/webhook', (req, res) => {
    const message = req.body;
    console.log('Received message:', JSON.stringify(message, null, 2));

    if (message && message.entry && message.entry[0].changes[0].value.messages) {
        const from = message.entry[0].changes[0].value.messages[0].from;
        const text = message.entry[0].changes[0].value.messages[0].text.body;
        console.log(`Message from ${from}: ${text}`);

        sendWhatsAppMessage(from, 'Hello! This is your WhatsApp bot.', 'Button 1', 'Button 2', 'Button 3');
    }

    res.sendStatus(200);
});

// Function to send a message using the WhatsApp API
function sendWhatsAppMessage(to, text, buttonText1, buttonText2, buttonText3) {
    const url = 'https://graph.facebook.com/v21.0/421751121030685/messages';
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'button',
            header: {
                type: 'text',
                text: text  // Main message text
            },
            body: {
                text: 'Click below to proceed'  // Body text
            },
            footer: {
                text: 'Footer message'  // Optional footer text
            },
            action: {
                buttons: [
                    {
                        type: 'reply',  // Correct button type
                        reply: {
                            id: 'unique-button-id-1',  // This should be a unique identifier
                            title: buttonText1  // Button 1 text
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'unique-button-id-2',  // Unique identifier for the second button
                            title: buttonText2  // Button 2 text
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'unique-button-id-3',  // Unique identifier for the third button
                            title: buttonText3  // Button 3 text
                        }
                    }
                ]
            }
        }
    };

    axios.post(url, data, { headers })
        .then(response => {
            console.log('Message sent:', response.data);
        })
        .catch(error => {
            console.error('Error sending message:', error.response ? error.response.data : error.message);
        });
}

// Send message with 3 buttons
sendWhatsAppMessage(
    '+917994107442',  // Recipient's phone number
    'Welcome to our service!',  // Main message text
    'Get Started',  // Button 1 text
    'Learn More',  // Button 2 text
    'Contact Us'  // Button 3 text
);

// Verify Webhook Endpoint (for Facebook Webhook Verification)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified');
        res.status(200).send(challenge);
    } else {
        console.log('Webhook verification failed');
        res.sendStatus(403);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
