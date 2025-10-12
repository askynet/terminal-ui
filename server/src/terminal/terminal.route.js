const { getSSHToken } = require("./terminal.controller")

module.exports = app => {
    app.post('/api/generate-ssh-token', getSSHToken)
}