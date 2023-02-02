const WS = require('ws');
const { v4: uuid } = require('uuid');
const { ChatBot } = require('./components/chatbot/chatbot');

const SERVER_BOT = 'Серверный бот';
const START_MESSAGE = 'Добро пожаловать в чат!';

const clients = new Set();
const userNames = [SERVER_BOT];
const messages = [START_MESSAGE];

const port = process.env.PORT || 7070;
const wsServer = new WS.Server({ port });
console.log(`Starting WebSocket Server on port ${port}, listening connections...`);  // eslint-disable-line no-console

wsServer.on('connection', (ws) => {
  const id = uuid();
  clients[id] = ws;
  console.log(`New client connected - id #${id}`); // eslint-disable-line no-console

  // Отправление всех подключенных пользователей новому клиенту
  ws.send(JSON.stringify({ renderUsers: true, names: userNames }));

  // Отправление всех сообщений новому клиенту
  if (messages.length !== 0) {
    ws.send(JSON.stringify({ renderMessages: true, messages }));
  }

  // При получении сообщения от пользователя
  ws.on('message', (rawMessage) => {
    const message = JSON.parse(rawMessage);

    if (message.chooseUserName) {
      if (userNames.every((name) => name !== message.userName)) {
        userNames.push(message.userName);
        clients[id].userName = message.userName;
        const name = clients[id].userName;

        for (const idClient in clients) {
          if (clients[idClient].userName === name) {
            clients[idClient].send(
              JSON.stringify({ nameIsFree: true, name: message.userName }),
            );
          } else {
            clients[idClient].send(
              JSON.stringify({ renderName: true, name: message.userName }),
            );
          }
        }
        return;
      }
      clients[id].send(JSON.stringify({ nameIsFree: false }));
      return;
    }

    if (message.chatMessage) {
      const date = new Date().getTime();
      const name = clients[id].username;

      messages.push({
        name,
        message: message.messageText,
        date,
      });

      for (const idClient in clients) {
        if (clients[idClient].username === name) {
          clients[idClient].send(
            JSON.stringify({
              renderOwnMessage: true,
              name: 'You',
              message: message.messageText,
              date,
            }),
          );
        } else {
          clients[idClient].send(
            JSON.stringify({
              renderMessage: true,
              name,
              message: message.messageText,
              date,
            }),
          );
        }
      }
    }

    if (message.chatMessage) {
      const date = new Date().getTime();
      const name = SERVER_BOT;

      const bot = new ChatBot();
      const botMsg = bot.getBotText();
      const delay = Math.floor(Math.random() * (botMsg.length * 10));
      setTimeout(() => {
        messages.push({
          name,
          message: botMsg,
          date,
        });
        ws.send(
          JSON.stringify({
            renderMessage: true,
            name,
            message: botMsg,
            date,
          }),
        );
      }, delay);
    }
  });

  ws.on('close', () => {
    usernames = usernames.filter((name) => name !== clients[id].username);
    // for (const idClient in clients) {
    //   clients[idClient].send(
    //     JSON.stringify({ closeUser: true, name: clients[id].username }),
    //   );
    // }
    console.log(usernames); // eslint-disable-line no-console
    delete clients[id];
  });
});
