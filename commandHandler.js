
const fs = require("fs")
const Discord = require("discord.js")
const cooldowns = new Discord.Collection();

//Temp

        error = function(){}
		//Response Embed
		reply = function(title, content, footer, destination, color){
			try{
			var RespondEmbed = new Discord.MessageEmbed()
				RespondEmbed.setTitle(title)
				RespondEmbed.setDescription(content)
				if(!destination || destination == '' ){
					throw `Invalid Arguments.`
				}else{
					if(color && !color == ''){
						RespondEmbed.setColor(color)
					}
					destination.send(RespondEmbed).then(message =>{
						return message //Returns the message object
					})
				} 
			}catch(err){
				throw err
			}
			
		}


		//Respond function backwards compatibility
		respond = function (title, content, sendto, color, footer){
			console.log(`=================================================================`);
			console.log(`WARNING: You are currently using old functions. (respond)`);
			console.log(`WARNING: Please update your code to use the new function. (reply)`);
			console.log(`WARNING: This backward compatibility will be removed eventually.`);
			console.log(`=================================================================`);
			if(!color){
				var color = ''
			}
			if(!footer){
				var footer = ''
			}
			reply(title, content, footer, sendto, color)
		}

/**
 * 
 * @param {Discord.Message} message 
 */
module.exports.execute = (message) => {
    const client = message.client
    if(message.author.bot) return;
    let commandPrefix = process.env.PREFIX
    let args = message.content.slice(commandPrefix.length).split(/ +/);
    let commandName = args.shift().toLowerCase();
    if (!message.content.startsWith(commandPrefix) || message.author.bot) return;
        let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
        if (!command) {
            return;
        }
        //Check if command allowed in DMs
        if(message.channel.type == "dm" && (!command.dm || command.dm === false))
            return message.channel.send("This command is currently unavailable in Direct Messages.")

        //Cooldowns
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }
    
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
    
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.channel.send(`⏱ Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            }
        }
    
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        //Permission check
        command.execute(message, args)
}