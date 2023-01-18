const fs = require('fs');

export default class ChatBot {
  constructor(fileName = 'messages.txt') {
    this.messages = ChatBot.readMessages(fileName);
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
