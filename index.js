const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const crypto = require('crypto')
const mongoose = require('mongoose')
const Alerts = require('./models/alerts')
const jira = require('./helpers/jira')
const send_to_telegram = require('./helpers/mailing')

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:27017/alerts?authSource=admin`, {
  useNewUrlParser: true,
})

mongoose.connection.on('error', err => {
  console.log("Something wrong with db", err)
  process.exit(1);
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/alerts/', async function(req, res) {
    const alert = req.body.alerts

    for(const i in alert){
        const data = alert[i]
        const error_regexp = /new_error*/
        const chat_id = req.query.chat_id
        const start_date = new Date(alert[i].startsAt)
        const end_date = new Date(alert[i].endsAt)
        const description = alert[i].annotations.description
        const alert_hash = crypto.createHash('sha1').update(start_date + description).digest('hex')
        const active = (end_date > start_date) ? false : true
        const alert_in_base = await Alerts.findOne({ alert_hash })

        if(!alert_in_base && active == true) {
            const new_alert = new Alerts({
                alert_hash,
                chat_id,
                start_date,
                data
            })

            if (error_regexp.test(data.labels.alertname)) {
                const id = await jira.new_issue(data)
                new_alert.jira_id = id
            }

            await new_alert.save()
        } 

        if (alert_in_base && active != alert_in_base.active && active == false) {
            alert_in_base.active = active
            alert_in_base.end_date = end_date
            await alert_in_base.save()
            await jira.close_issue(alert_in_base.jira_id)
        }

    }
    await send_to_telegram()

    res.sendStatus(200)
})

app.listen(9090, function(){
    console.log('Server is started')
})