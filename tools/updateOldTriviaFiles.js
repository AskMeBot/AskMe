const { writeFileSync } = require("fs")
let old = require("../quiz.json")

let newTrivia = old.map((q, i) => {
    let newLayout = {
        question:"",
        choices:[],
        answer:""
    }
    let choices = Object.keys(q).filter(s => s.startsWith("choice"))
    newLayout.question = old[i].question;
    newLayout.choices = choices.map((c, ci) => {
        let choice = old[i][choices[ci]]
        return {
            title:`${choice.split(". ")[1]}`,
            optionName:`${choice.split(". ")[0]}`
        }
    })
    if(old[i].answer instanceof Array)
        console.log(old[i].qid)
    if(typeof old[i].answer == "string"){
        newLayout.answer = old[i].answer.toUpperCase()
        return newLayout        
    }

})

//console.log(JSON.stringify(newTrivia, undefined, 2))
writeFileSync("new_trivia.json", JSON.stringify(newTrivia, undefined, 2))