const Hapi = require('hapi')
const Wreck = require('wreck')
const Promise = require('bluebird')
const Kaiwa = require('../')

const kaiwaOptions = {
  webHookURL: 'http://localhost:3002',
  testingPort: 3001,
}

const tester = new Kaiwa.Tester(kaiwaOptions)
const server = new Hapi.Server()

beforeAll(() => new Promise((resolve, reject) => {
  server.connection({ port: 3002 })
  server.route({
    method: 'POST',
    path: '/',
    handler: (request, reply) => {
      Wreck.post('http://localhost:3001/bots/tester', { payload: { text: 'pong' } }, () => {
        Wreck.post('http://localhost:3001/bots/tester', { payload: { text: 'pang' } }, () => { })
      })
      return reply({ status: 'OK' })
    },
  })
  server.start((err) => {
    if (err) {
      return reject(err)
    }
    console.log(`Server running at ${server.info.uri}`)
    // Start kaiwa server
    tester.startListening((error) => {
      if (error) {
        return reject(error)
      }
      return resolve()
    })
    return resolve()
  })
}))

test('send request and validate the response', (done) => {
  const messageToSend = { text: 'ping' }
  const expectedMessage = [{ text: 'pong' }, { text: 'pang' }]
  tester.runScript(messageToSend, { responses: expectedMessage.length }).then((result) => {
    expect(result).toEqual(expectedMessage)
    done()
  })
})

afterAll(() => new Promise((resolve, reject) => {
  server.stop((serverError) => {
    if (serverError) {
      console.log(serverError)
      return reject()
    }
    tester.stopListening((err) => {
      if (err) {
        console.log(err)
        return reject()
      }
      return resolve()
    })
    return resolve()
  })
}))
