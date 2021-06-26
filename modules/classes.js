const Discord = require("discord.js")
class awaitResponseOptions {
    /**
     * 
     * @param {String} title 
     */
    setTitle(title){
        this.title = title;
        return this;
    };
    /**
     * 
     * @param {String} desc 
     */
    setDescription(desc){
        this.description = desc;
        return this;
    };
    /**
     * 
     * @param {String} footer 
     */
    setFooter(footer){
        this.footer = footer;
        return this;
    };
    /**
     * 
     * @param {Number} waitFor 
     */
    setWaitFor(waitFor){
        this.waitFor = waitFor;
        return this;
    }
    /**
     * 
     * @param {Discord.UserResolvable} user 
     */
    setUserWaitFor(user){
        this.userToWaitFor = user;
        return this;
    }
    
    IntentsString = ['GUILDS', 'idk']

    setMessageType(type){
        new Discord.Intents([])
    }
};
module.exports.awaitResponseOptions = awaitResponseOptions;