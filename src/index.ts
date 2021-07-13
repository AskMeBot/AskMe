import {readFileSync} from 'fs'
import {Client, MessageEmbed} from 'discord.js'
import configFile from '../config'
import fetch from 'node-fetch'
import {writeFileSync} from 'fs'

const config:Config = (configFile as Config);
const client = new Client({intents:[]})

async function updateTrivia(){
    console.log(`Fetching latest trivia data from '${config.dataEndpoint}'...`)
    const response = await fetch(config.dataEndpoint, {
        "method":"GET",
        "headers":{
            "authorization":config.dataEndpointAuthorizationHeader || undefined
        }
    })
    if(response.status != 200)
        return console.log(`Received ${response.status}. Not saving.`)
    const data = (await response.json() as TriviaConfig)
    writeFileSync("./trivia.json", JSON.stringify(data))
    console.log("Latest trivia data fetched")
}
updateTrivia()
setInterval(() => {
    updateTrivia()
}, 60 * 60 * 1000)

client.on("interaction", (interaction) => {

    //General Commands
    if(interaction.isCommand() && interaction.commandName == "invite"){
        return interaction.reply({
            "content":`**Invite**: Want to learn some facts in your own server? [Invite me](<https://discord.com/api/oauth2/authorize?client_id=811759493440471081&scope=applications.commands>) to your server!\n**Source**: You can view the source code related to me on [GitHub](https://github.com/AskMeBot).\n**Suggestions**: Have a suggestion for a question? Suggest it in our [Discord Server](https://discord.gg/AWVWbWYATe)`,
            "ephemeral":true
        })
        .catch(console.error)
    }

    //Trivia commands/events
    let triviaQuestions:TriviaConfig = JSON.parse(readFileSync("./trivia.json").toString())

    //Dev trivia (Debug)
    if(interaction.isCommand() && interaction.commandName == "devtrivia"){
        let footerContent = []
        const currentQuestionIndex = (interaction.options.first().value as number)
        const currentQuestion = triviaQuestions[currentQuestionIndex]
        if(!currentQuestion)
            return interaction.reply({embeds:[{"title":"😬 Uh oh, this is awkward", "description":`This server doesn't appear to have any trivia questions available. Try again later, or if you believe this is a mistake, contact the bot support server.`}], components:[{"type":1,"components":[{"type":2,"label":"Try again","style":"SECONDARY","customID":`play_again_dev`}]}], ephemeral:true}).catch(console.error)
        if(currentQuestion.guild_id && currentQuestion.guild_id == interaction.guildID)
            footerContent.push(`ℹ️ This is a server-specific question`)
        if(currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array))
            footerContent.push(`#️⃣ You need to select ${currentQuestion.answer.length} options`)
        return interaction.reply({embeds:[{
            "title":"Trivia",
            "description":`${currentQuestion.question}`,
            "footer":{
                "text":footerContent.join(" | ")
            }
        }],
        components:[{
            "type":"ACTION_ROW",
            "components":[{
                "type":"SELECT_MENU",
                "customID":"select_answer_dev",
                "placeholder":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?`Select ${currentQuestion.answer.length} answers`:`Select your answer`,
                "options":currentQuestion.choices.map(ta => {
                    return {"label":ta.title, "value":`answer_${currentQuestionIndex}//${ta.optionName}//${interaction.member?interaction.member.user.id:interaction.user.id}`}
                }),
                "minValues":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?currentQuestion.answer.length:undefined,
                "maxValues":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?currentQuestion.answer.length:undefined
            }]
        },
        {
            "type":1,
            "components":[
                {
                    "type":2,
                    "label":"Skip",
                    "style":"DANGER",
                    "customID":`play_again_dev`
                }
            ]
        }],
        ephemeral:false
        })
        .catch(console.error)
    }

    //Dev selected answer
    if(interaction.isSelectMenu() && interaction.customID == "select_answer_dev"){
        const selectedOptions = interaction.values
        if(!selectedOptions[0].startsWith("answer_"))
            return interaction.reply({"content":"Invalid interaction."})
        
        const originalCommandExecutor = selectedOptions[0].split("//")[2]
        if(originalCommandExecutor != (interaction.member?interaction.member.user.id:interaction.user.id))
            return interaction.reply({
                "ephemeral":true,
                "content":`You aren't the user who originally ran this command.`
            })
        const currentQuestion = triviaQuestions[(selectedOptions[0].split("//")[0].replace("answer_", "") as any as number)]
        let isAnswerCorrect = false

        //Multiple selections
        if(currentQuestion.answer instanceof Array && currentQuestion.requireAllAnswersSelected && selectedOptions.filter(v => currentQuestion.answer.includes(v.split("//")[1])).length == currentQuestion.answer.length)
            isAnswerCorrect = true;

        //Multiple answers, one selection
        if(currentQuestion.answer instanceof Array && !currentQuestion.requireAllAnswersSelected && currentQuestion.answer.includes(selectedOptions[0].split("//")[1]))
            isAnswerCorrect = true;
        
        if(typeof currentQuestion.answer == "string" && !currentQuestion.requireAllAnswersSelected && currentQuestion.answer == selectedOptions[0].split("//")[1])
            isAnswerCorrect = true;
        //currentQuestion.answer == selectedOption.split("//")[1]?`✅`:`❌`
        let newEmbed = new MessageEmbed()
        .setTitle("Trivia")
        .setDescription(currentQuestion.question)
        .addFields([
            {
                "name":"Values",
                "value":`[${selectedOptions.join(", ")}]`
            },
            {
                "name":"Correct",
                "value":`${currentQuestion.answer}`
            }
        ])
        .setFooter(`${isAnswerCorrect?`✅`:`❌`} ${isAnswerCorrect?`CORRECT`:`INCORRECT`}`);
        interaction.update({
            components:[
                {
                    "type":1,
                    "components":[
                        {
                            "type":2,
                            "label":"Continue",
                            "style":"PRIMARY",
                            "customID":`play_again_dev`
                        }
                    ]
                }
            ],
            embeds:[newEmbed]
        })
        .catch(console.error)
    }
    if(interaction.isButton() && interaction.customID == "play_again_dev"){
        let footerContent = [];
        const currentQuestionIndex = Math.floor(Math.random() * triviaQuestions.length)
        const currentQuestion = triviaQuestions[currentQuestionIndex]
        if(!currentQuestion)
            return interaction.update({embeds:[{"title":"😬 Uh oh, this is awkward", "description":`This server doesn't appear to have any trivia questions available. Try again later, or if you believe this is a mistake, contact the bot support server.`}], components:[{"type":1,"components":[{"type":2,"label":"Try again","style":"SECONDARY","customID":`play_again_dev`}]}]}).catch(console.error)
        if(currentQuestion.guild_id && currentQuestion.guild_id == interaction.guildID)
            footerContent.push(`ℹ️ This is a server-specific question`)
        if(currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array))
            footerContent.push(`#️⃣ You need to select ${currentQuestion.answer.length} options`)
        interaction.update({embeds:[
            {
                "title":"Trivia",
                "description":`${currentQuestion.question}`,
                footer:{
                    "text":footerContent.join(" | ")
                }
            }
        ], components:[
            {
                "type":"ACTION_ROW",
                "components":[
                    {
                        "type":"SELECT_MENU",
                        "customID":"select_answer_dev",
                        "placeholder":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?`Select ${currentQuestion.answer.length} answers`:`Select your answer`,
                        "options":currentQuestion.choices.map(ta => {
                            return {"label":ta.title, "value":`answer_${currentQuestionIndex}//${ta.optionName}//${interaction.member?interaction.member.user.id:interaction.user.id}`}
                        }),
                        "minValues":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?currentQuestion.answer.length:undefined,
                        "maxValues":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?currentQuestion.answer.length:undefined
                    }
                ]
            },
            {
                "type":1,
                "components":[
                    {
                        "type":2,
                        "label":"Skip",
                        "style":"DANGER",
                        "customID":`play_again_dev`
                    }
                ]
            }
        ]})
        .catch(console.error)
    }

    //Normal usage
    triviaQuestions = triviaQuestions.filter(tq => {
        return tq && (!tq.guild_id || tq.guild_id == interaction.guildID)
    });


    if(interaction.isCommand() && interaction.commandName == "trivia"){
        let footerContent = []
        const currentQuestionIndex = Math.floor(Math.random() * triviaQuestions.length)
        const currentQuestion = triviaQuestions[currentQuestionIndex]
        if(!currentQuestion)
            return interaction.reply({embeds:[{"title":"😬 Uh oh, this is awkward", "description":`This server doesn't appear to have any trivia questions available. Try again later, or if you believe this is a mistake, contact the bot support server.`}], components:[{"type":1,"components":[{"type":2,"label":"Try again","style":"SECONDARY","customID":`play_again`}]}], ephemeral:true}).catch(console.error)
        if(currentQuestion.guild_id && currentQuestion.guild_id == interaction.guildID)
            footerContent.push(`ℹ️ This is a server-specific question`)
        if(currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array))
            footerContent.push(`#️⃣ You need to select ${currentQuestion.answer.length} options`)
        return interaction.reply({embeds:[{
            "title":"Trivia",
            "description":`${currentQuestion.question}`,
            "footer":{
                "text":footerContent.join(" | ")
            }
        }],
        components:[{
            "type":"ACTION_ROW",
            "components":[{
                "type":"SELECT_MENU",
                "customID":"select_answer",
                "placeholder":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?`Select ${currentQuestion.answer.length} answers`:`Select your answer`,
                "options":currentQuestion.choices.map(ta => {
                    return {"label":ta.title, "value":`answer_${currentQuestionIndex}//${ta.optionName}//${interaction.member?interaction.member.user.id:interaction.user.id}`}
                }),
                "minValues":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?currentQuestion.answer.length:undefined,
                "maxValues":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?currentQuestion.answer.length:undefined
            }]
        },
        {
            "type":1,
            "components":[
                {
                    "type":2,
                    "label":"Skip",
                    "style":"DANGER",
                    "customID":`play_again`
                }
            ]
        }],
        ephemeral:true
        })
        .catch(console.error)
    }

    if(interaction.isSelectMenu() && interaction.customID == "select_answer"){
        const selectedOptions = interaction.values
        if(!selectedOptions[0].startsWith("answer_"))
            return interaction.reply({"content":"Invalid interaction."})
        const currentQuestion = triviaQuestions[(selectedOptions[0].split("//")[0].replace("answer_", "") as any as number)]
        let isAnswerCorrect = false

        //Multiple selections
        if(currentQuestion.answer instanceof Array && currentQuestion.requireAllAnswersSelected && selectedOptions.filter(v => currentQuestion.answer.includes(v.split("//")[1])).length == currentQuestion.answer.length)
            isAnswerCorrect = true;

        //Multiple answers, one selection
        if(currentQuestion.answer instanceof Array && !currentQuestion.requireAllAnswersSelected && currentQuestion.answer.includes(selectedOptions[0].split("//")[1]))
            isAnswerCorrect = true;
        
        if(typeof currentQuestion.answer == "string" && !currentQuestion.requireAllAnswersSelected && currentQuestion.answer == selectedOptions[0].split("//")[1])
            isAnswerCorrect = true;
        //currentQuestion.answer == selectedOption.split("//")[1]?`✅`:`❌`
        let newEmbed = new MessageEmbed()
        .setTitle("Trivia")
        .setDescription(currentQuestion.question)
        .setFooter(`${isAnswerCorrect?`✅`:`❌`} You answered the question ${isAnswerCorrect?`correctly!`:`incorrectly. However, trivia wouldn't be as fun if you knew all the answers! Good luck next time! :)`}`);
        interaction.update({
            components:[
                {
                    "type":1,
                    "components":[
                        {
                            "type":2,
                            "label":"Continue",
                            "style":"PRIMARY",
                            "customID":`play_again`
                        }
                    ]
                }
            ],
            embeds:[newEmbed]
        })
        .catch(console.error)
    }

    if(interaction.isButton() && interaction.customID == "play_again"){
        let footerContent = [];
        const currentQuestionIndex = Math.floor(Math.random() * triviaQuestions.length)
        const currentQuestion = triviaQuestions[currentQuestionIndex]
        if(!currentQuestion)
            return interaction.update({embeds:[{"title":"😬 Uh oh, this is awkward", "description":`This server doesn't appear to have any trivia questions available. Try again later, or if you believe this is a mistake, contact the bot support server.`}], components:[{"type":1,"components":[{"type":2,"label":"Try again","style":"SECONDARY","customID":`play_again`}]}]}).catch(console.error)
        if(currentQuestion.guild_id && currentQuestion.guild_id == interaction.guildID)
            footerContent.push(`ℹ️ This is a server-specific question`)
        if(currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array))
            footerContent.push(`#️⃣ You need to select ${currentQuestion.answer.length} options`)
        interaction.update({embeds:[
            {
                "title":"Trivia",
                "description":`${currentQuestion.question}`,
                footer:{
                    "text":footerContent.join(" | ")
                }
            }
        ], components:[
            {
                "type":"ACTION_ROW",
                "components":[
                    {
                        "type":"SELECT_MENU",
                        "customID":"select_answer",
                        "placeholder":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?`Select ${currentQuestion.answer.length} answers`:`Select your answer`,
                        "options":currentQuestion.choices.map(ta => {
                            return {"label":ta.title, "value":`answer_${currentQuestionIndex}//${ta.optionName}//${interaction.member?interaction.member.user.id:interaction.user.id}`}
                        }),
                        "minValues":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?currentQuestion.answer.length:undefined,
                        "maxValues":currentQuestion.requireAllAnswersSelected && (currentQuestion.answer instanceof Array)?currentQuestion.answer.length:undefined
                    }
                ]
            },
            {
                "type":1,
                "components":[
                    {
                        "type":2,
                        "label":"Skip",
                        "style":"DANGER",
                        "customID":`play_again`
                    }
                ]
            }
        ]})
        .catch(console.error)
    }
})

client.login(config.token)