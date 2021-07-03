type TriviaAnswerOptionName = "A" | "B" | "C" | "D" | string

interface TriviaAnswer {
    title:string,
    optionName:TriviaAnswerOptionName
}

interface TriviaQuestion {
    question:string,
    choices:Array<TriviaAnswer>,
    answer:string
}

interface TriviaConfig extends Array<TriviaQuestion> {}

interface Config {
    token:string
}