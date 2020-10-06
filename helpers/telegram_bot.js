const Telegraf = require('telegraf')
const HttpsProxyAgent = require('https-proxy-agent')

const bot = new Telegraf(process.env.TELEGRAM_TOKEN, {
    telegram: {
        agent: new HttpsProxyAgent('http://proxy-tech.hq.bc:8080')
    }
})

// const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

module.exports = bot