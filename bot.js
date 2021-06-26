const fs = require("fs")
require("dotenv").config()
const Discord = require("discord.js")
const client = new Discord.Client({ws:{intents:["GUILDS", "GUILD_MESSAGES"]}})
client.commands = new Discord.Collection();

//Commands
let commandFiles = fs.readdirSync('./commands')
.filter(file => file.endsWith('.js')).filter(file => !file.split(".")[0].endsWith("_experiment"));;

for (let file of commandFiles) {
	let command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on("message", message => require("./commandHandler").execute(message))

client.on("ready", () => console.log("Ready!"))

client.login(process.env.TOKEN)