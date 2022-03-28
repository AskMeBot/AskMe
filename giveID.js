const { writeFileSync } = require("fs");
let json = require("./trivia.json")
for (const triviaQuestion of json) {
    if(triviaQuestion){
        triviaQuestion.id = (Math.random() * new Date().getSeconds()).toString(36).substring(2, 15) + (Math.random() * new Date().getSeconds()).toString(36).substring(2, 15);
    }
}
console.log(json)
writeFileSync("new_trivia_withid.json", JSON.stringify(json, undefined, 2))