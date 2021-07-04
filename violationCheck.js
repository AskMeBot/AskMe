let allViolations = {
    danger:[],
    warning:[]
};
let allInfo = [];
function info(reason){
    allInfo.push(reason)
    console.log(`ℹ️ INFO: ${reason}\n\n`)
}

function warn(reason){
    allViolations.warning.push(reason)
    console.log(`🚩 WARNING: ${reason}\n\n`)
}

function danger(reason){
    allViolations.danger.push(reason)
    console.log(`🛑 DANGER: ${reason}\n\n`)
}

let json = require("./trivia.json")
for (const triviaQuestion of json) {
    if(triviaQuestion){
        //Check for >25 characters for choices/answers
        triviaQuestion.choices.forEach(c => {
            if(c.title.length > 25)
                danger(`'${c.title}' choice (${c.optionName}) in '${triviaQuestion.question}' is longer than 25 characters, and will cause the bot to fail to display the question.`)
        })

        //Check to see if answer is valid
        if(!triviaQuestion.choices.find(c => triviaQuestion.answer instanceof Array?triviaQuestion.answer.includes(c.optionName):c.optionName == triviaQuestion.answer))
            warn(`'${triviaQuestion.question}' does not have a choice with an 'optionName' that matches 'answer'`)
        
    }
}

console.log(`Ended with ${allViolations.danger.length+allViolations.warning.length} total violations.\nDangers: ${allViolations.danger.length}\nWarnings: ${allViolations.warning.length}`)