const fs = require('fs');

const FILE_NAME = __dirname + '/messages.txt';

class Bot {
  constructor(fileName = FILE_NAME) {
    this.messages = Bot.readMessages(fileName);
  }

  static readMessages(fileName) {
    let data = [];
    try {
      data = fs.readFileSync(fileName).toString().split('\n');
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
    return data;
  }

  getMessage() {
    const index = Math.floor(Math.random() * this.messages.length);

    return this.messages[index];
  }
}

const ChatBot = new Bot();

module.exports = ChatBot;