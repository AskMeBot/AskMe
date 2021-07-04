import {readFileSync} from 'fs'
import {Client, MessageEmbed} from 'discord.js'
import config from '../config'

const client = new Client({intents:[]})

client.on('ready', () => {
    console.log(`${client.user.tag} is ready!`)
})

client.on("interaction", (interaction) => {

    //General Commands
    if(interaction.isCommand() && interaction.commandName == "invite"){
        return interaction.reply({
            "content":`Want to learn some facts in your own server? [Invite me](<https://discord.com/api/oauth2/authorize?client_id=811759493440471081&scope=applications.commands>) to your server!`,
            "ephemeral":true
        })
    }

    //Trivia commands/events
    let triviaQuestions:TriviaConfig = JSON.parse(readFileSync("./trivia.json").toString())
    if(interaction.isCommand() && interaction.commandName == "trivia"){
        const currentQuestionIndex = Math.floor(Math.random() * triviaQuestions.length)
        const currentQuestion = triviaQuestions[currentQuestionIndex]

        return interaction.reply({embeds:[{
            "title":"Trivia",
            "description":`${currentQuestion.question}`
        }],
        components:[{
            "type":"ACTION_ROW",
            "components":[{
                "type":"SELECT_MENU",
                "customID":"select_answer",
                "options":currentQuestion.choices.map(ta => {
                    return {"label":ta.title, "value":`answer_${currentQuestionIndex}//${ta.optionName}//${interaction.member?interaction.member.user.id:interaction.user.id}`}
                })
            }]
        },
        {
            "type":1,
            "components":[
                {
                    "type":2,
                    "label":"Skip question",
                    "style":"DANGER",
                    "customID":`play_again`
                }
            ]
        }],
        ephemeral:true
        })
    }
    if(interaction.isSelectMenu() && interaction.customID == "select_answer"){
        const selectedOption = interaction.values[0]
        if(!selectedOption.startsWith("answer_"))
            return interaction.reply({"content":"Invalid interaction."})
        const currentQuestion = triviaQuestions[(selectedOption.split("//")[0].replace("answer_", "") as any as number)]
        const originalCommandExecutor = selectedOption.split("//")[2]
        if(originalCommandExecutor != (interaction.member?interaction.member.user.id:interaction.user.id))
            return interaction.reply({
                "ephemeral":true,
                "content":`You aren't the user who originally ran this command. Play the game yourself using \`!!test\`!`
            })
        //"content":`${selectedOption}\n**Question ID**: ${selectedOption.split("//")[0].replace("answer_", "")}\n**Selected option**: ${selectedOption.split("//")[1]}`
        let newEmbed = new MessageEmbed()
        .setTitle("Trivia")
        .setDescription(currentQuestion.question)
        .setFooter(`${currentQuestion.answer == selectedOption.split("//")[1]?`✅`:`❌`} You answered the question ${currentQuestion.answer == selectedOption.split("//")[1]?`correctly!`:`incorrectly. However, Trivia wouldn't be fun if you knew all the answers. Good luck next time! :)`}`);
        interaction.update({
            components:[
                {
                    "type":1,
                    "components":[
                        {
                            "type":2,
                            "label":"Next one!",
                            "style":"PRIMARY",
                            "customID":`play_again`
                        }
                    ]
                }
            ],
            embeds:[newEmbed]
        })
    }
    if(interaction.isButton() && interaction.customID == "play_again"){
        const currentQuestionIndex = Math.floor(Math.random() * triviaQuestions.length)
        const currentQuestion = triviaQuestions[currentQuestionIndex]
        interaction.update({embeds:[
            {
                "title":"Trivia",
                "description":`${currentQuestion.question}`
            }
        ], components:[
            {
                "type":"ACTION_ROW",
                "components":[
                    {
                        "type":"SELECT_MENU",
                        "customID":"select_answer",
                        "options":currentQuestion.choices.map(ta => {
                            return {"label":ta.title, "value":`answer_${currentQuestionIndex}//${ta.optionName}//${interaction.member?interaction.member.user.id:interaction.user.id}`}
                        })
                    }
                ]
            },
            {
                "type":1,
                "components":[
                    {
                        "type":2,
                        "label":"Skip question",
                        "style":"DANGER",
                        "customID":`play_again`
                    }
                ]
            }
        ]})
    }
})

client.login(config.token)