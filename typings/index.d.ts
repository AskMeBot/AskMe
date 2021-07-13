type TriviaAnswerOptionName = "A" | "B" | "C" | "D" | string

interface TriviaAnswer {
    title:string,
    optionName:TriviaAnswerOptionName,
    skipCheck?:boolean
}

interface TriviaQuestion {
    question:string,
    choices:Array<TriviaAnswer>,
    answer:string | Array<string>,
    guild_id?:string,
    requireAllAnswersSelected?:boolean
}

interface TriviaConfig extends Array<TriviaQuestion> {}

interface Config {
    token:string,
    /** Where bot fetches the latest trivia information */
    dataEndpoint:string,
    dataEndpointAuthorizationHeader?:string
}