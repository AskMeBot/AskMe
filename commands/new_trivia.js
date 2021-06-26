const fs = require('fs');
const Discord = require('discord.js')
const classes = require("../modules/classes")
module.exports = {
  name: 'newtrivia',
  description: 'Learn something new!',
	execute(message, args, client) {
    const quiz = require('../resources/quiz.json');
    let item = quiz[Math.floor(Math.random() * quiz.length)];
    while (item.ignore) {
      item = quiz[Math.floor(Math.random() * quiz.length)];
    }
    let userInteractionModule = require('../modules/userInteractionModule')
    const options = new classes.awaitResponseOptions()
    .setTitle("Trivia")
    .setDescription(`Question: **${item.question}**\n\n`)
    userInteractionModule.newAwaitResponse(options)
    return;
    userInteractionModule.awaitResponse(message, client, responseReceived, {
      content:"What is your answer? (A, B, C, D)",
      footer:`Waiting for response from ${message.author.tag}`
    })
  }
}