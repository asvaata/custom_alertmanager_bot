const mongoose = require('mongoose')

const Schema = mongoose.Schema

const alertsSchema = new Schema({
    alert_hash: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    chat_id: {
        type: Array
    },
    jira_id: {
        type: String
    },
    fire_sended: {
        type: Boolean,
        default: false
    },
    resolve_sended: {
        type: Boolean,
        default: false
    },
    start_date: {
        type: Date
    },
    end_date: {
        type: Date,
        default: null
    },
    data: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Alerts', alertsSchema);