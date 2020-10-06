const axios = require('axios')

async function new_issue(data){
    const active_sprint = await axios.get(`https://jira.hq.bc//rest/agile/1.0/board/${process.env.JIRA_BOARD_ID}/sprint?state=active`, {
        auth: {
            username: process.env.JIRA_USER,
            password: process.env.JIRA_PASS
        }
    })

    const result = await axios.post("https://jira.hq.bc/rest/api/2/issue/", {
        "fields": {
            "project": {
                "key": process.env.JIRA_PROJECT_ID
            },
            "summary": "New error",
            "description": data.annotations.description,
            "issuetype": {
                "id": 1
            },
            "customfield_10004": parseInt(active_sprint.data.values.filter(o => o.originBoardId == process.env.JIRA_BOARD_ID)[0].id),
            "assignee": {
                "name": process.env.ASSIGNEE_USER
            }
        }
    }, {
        auth: {
            username: process.env.JIRA_USER,
            password: process.env.JIRA_PASS
        }
    })

    return result.data.id
}

async function close_issue(id) {
    const end_code = 31
    const renew_code = 41

    while(true) {
        const get_transitions = await axios.get(`https://jira.hq.bc/rest/api/2/issue/${id}/transitions?expand=transitions.fields`, {
            auth: {
                username: process.env.JIRA_USER,
                password: process.env.JIRA_PASS
            }
        })

        if (get_transitions.data.transitions[0].id == end_code) {
            await axios.post(`https://jira.hq.bc/rest/api/2/issue/${id}/transitions`, {
                "transition": {
                    "id": get_transitions.data.transitions[0].id
                },
                "fields": {
                    "customfield_10700": "error fixed",
                    "timetracking": {
                        "remainingEstimate": "0",
                        "originalEstimate": "0"
                    }
                }
            }, {
                auth: {
                    username: process.env.JIRA_USER,
                    password: process.env.JIRA_PASS
                }
            })
        } else if (get_transitions.data.transitions[0].id == renew_code) {
            break
        } else {
            await axios.post(`https://jira.hq.bc/rest/api/2/issue/${id}/transitions`, {
                "transition": {
                    "id": get_transitions.data.transitions[0].id
                }
            }, {
                auth: {
                    username: process.env.JIRA_USER,
                    password: process.env.JIRA_PASS
                }
            })
            continue
        }
    }
}

module.exports.new_issue = new_issue
module.exports.close_issue = close_issue