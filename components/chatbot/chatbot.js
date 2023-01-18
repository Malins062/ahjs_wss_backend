export default class ChatBot {
  constructor(fileMessages = 'messages.txt') {
    this.messages = [];
  }

  getMessage() {
    const index = Math.floor(Math.random() * this.messages.length);

    return this.messages[index];
  }
}
