let allViolations = {
    danger:[],
    warning:[]
};
let allInfo = [];
function info(reason){
    allInfo.push(reason)
    console.log(`ℹ️ INFO: ${reason}\n\n`)
}

function warn(reason, type){
    allViolations.warning.push(reason)
    console.log(`🚩 WARNING (${type}): ${reason}\n\n`)
}

function danger(reason, type){
    allViolations.danger.push(reason)
    console.log(`🛑 DANGER (${type}): ${reason}\n\n`)
}
console.log("\n\n")
let json = require("./trivia.json")
for (const triviaQuestion of json) {
    if(triviaQuestion){
        //Check for >25 characters for choices/answers
        triviaQuestion.choices.forEach(c => {
            if(c.title.length > 25)
                danger(`Choice ${c.optionName} ('${c.title}') in '${triviaQuestion.question}' is longer than 25 characters, and will cause the bot to fail to display the question.`, "MAX_CHARACTERS_EXCEEDED")
            if(c.title.includes("undefined") && !c.skipCheck)
                warn(`Choice ${c.optionName} in  '${triviaQuestion.question}' content includes 'undefined' If this was intended, ignore this message or add 'skipCheck' as true on the answer. This has no effect on the bot.`, "ANSWER_TITLE_UNDEFINED")
            //if(c.title.length < 25 && c.title.length > 20)
                //info(`Choice ${c.optionName} ('${c.title}') in '${triviaQuestion.question}' is nearing 25 characters. If reached, it will cause the bot to fail to display the question.`)
            
        })

        //Check to see if answer is valid
        if(!triviaQuestion.choices.find(c => triviaQuestion.answer instanceof Array?triviaQuestion.answer.includes(c.optionName):c.optionName == triviaQuestion.answer))
            warn(`'${triviaQuestion.question}' does not have a choice with an 'optionName' that matches 'answer'. The question will display successfully, but any answer will be marked as incorrect.`, "NO_ANSWER_PROVIDED")
        
    }
}

console.log(`Ended with ${allViolations.danger.length+allViolations.warning.length} total violations.\nDangers: ${allViolations.danger.length}\nWarnings: ${allViolations.warning.length}`)