const SmeeClient = require('smee-client')

const smee = new SmeeClient({
  source: 'https://smee.io/devboard-demo-channel',
  target: 'http://localhost:3005/api/webhooks/github',
  logger: console
})

const events = smee.start()
console.log('Webhook proxy started.')
console.log('Use https://smee.io/devboard-demo-channel in your GitHub Webhook settings.')
