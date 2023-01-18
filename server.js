const WS = require('ws');
const { v4: uuid } = require('uuid');
const { ChatBot } = require('./components/chatbot/chatbot');

const SERVER_BOT = 'Серверный бот';

const clients = {};
let usernames = [SERVER_BOT];
const messages = [];

const port = process.env.PORT || 7070;
const wss = new WS.Server({ port });

wss.on('connection', (ws) => {
  const id = uuid();
  clients[id] = ws;
  console.log(`New client connected - id #${id}`); // eslint-disable-line no-console

  ws.send(JSON.stringify({ renderUsers: true, names: usernames }));
  if (messages.length !== 0) {
    ws.send(JSON.stringify({ renderMessages: true, messages }));
  }

  ws.on('message', (rawMessage) => {
    const message = JSON.parse(rawMessage);

    if (message.chooseUsername) {
      if (usernames.every((name) => name !== message.username)) {
        usernames.push(message.username);
        clients[id].username = message.username;
        const name = clients[id].username;

        for (const idClient in clients) {
          if (clients[idClient].username === name) {
            clients[idClient].send(
              JSON.stringify({ nameIsFree: true, name: message.username }),
            );
          } else {
            clients[idClient].send(
              JSON.stringify({ renderNames: true, name: message.username }),
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
