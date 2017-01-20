# kaiwa
Chatbot test helper

## Usage with lab
```javascript
'use strict'
const Kaiwa = require('kaiwa')
const Lab = require('lab')
const lab = exports.lab = Lab.script();
const Code = require('code')
const expect = Code.expect

lab.experiment('conversation', () => {
  const kaiwaOptions = {
    webHookURL: 'http://localhost:3000',
    testingPort: 3001
  }

  const tester = new Kaiwa.Tester(kaiwaOptions)

  tester.startListening((error) => {
    if (error) {
      throw error
    }
  })

  lab.test('send request and validate the response', (done) => {

    const messageToSend = {
      object: 'page',
      entry: [
      {
        messaging: [
          {
            sender: { id: 1 },
            message: { text: 'ping' }
          }
        ]
      }]
    }
        
    const expectedMessage = {
        recipient: { id: 1 },
        message: { text: 'Hola ping' }
    }
        
    tester.runScript(messageToSend, expectedMessage).then((result) => {
      expect(result).to.be.true()
      done()
    }).catch((error) => {
      throw error
      done()
    })
  })
  
})
```
