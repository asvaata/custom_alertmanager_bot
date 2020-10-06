const bot = require('./telegram_bot')
const Alerts = require('../models/alerts')
const moment = require('moment')

async function send_to_telegram(text, chat_id){
    for (const i in chat_id) {
        bot.telegram.sendMessage(chat_id[i], text.join("\n"), { parse_mode: "Markdown" })
    }
}

async function make_text() {
    const all_active_alerts = await Alerts.find({ $or: [{ fire_sended: false }, { resolve_sended: false }] })

    for (const i in all_active_alerts){
        const alert_status = (all_active_alerts[i].active == true) ? "FIRING 🔥" : "RESOLVED ✅"
        const text = [`Status: ***${alert_status}***`,
                    `Alert: ${all_active_alerts[i].data.labels.alertname.replace(/(\_)/g, '\\$1')}`,
                    `Active from: ${moment(all_active_alerts[i].start_date).format("MM/DD/YYYY HH:mm:ss")}`
                    ]

        if (all_active_alerts[i].active == false) {
            text.push(`Ends at: ${moment(all_active_alerts[i].end_date).format("MM/DD/YYYY HH:mm:ss")}`)
        }

        text.push(`description: ${all_active_alerts[i].data.annotations.description.replace(/(\_)/g, '\\$1')}`)

        if (all_active_alerts[i].fire_sended == false && all_active_alerts[i].active == true){
            send_to_telegram(text, all_active_alerts[i].chat_id)
            all_active_alerts[i].fire_sended = true
        } else if (all_active_alerts[i].resolve_sended == false && all_active_alerts[i].active == false) {
            send_to_telegram(text, all_active_alerts[i].chat_id)
            all_active_alerts[i].resolve_sended = true
        }

        await all_active_alerts[i].save()
    }

    await Alerts.deleteMany({ fire_sended: true, resolve_sended: true, active: false })
}

module.exports = make_text