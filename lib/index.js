// Load modules
const _ = require('lodash')
const Hapi = require('hapi')
const Promise = require('bluebird')
const Wreck = require('wreck')

const responses = []

// Declare internals
const deferPromises = (count) => {
  const promises = []
  for (let i = 1; i <= count; i += 1) {
    let deferResolve
    promises.push(new Promise((resolve) => {
      deferResolve = resolve
    }))
    responses.push(deferResolve)
  }
  return Promise.all(promises)
}

class Tester {
  constructor(options) {
    this.port = options.testingPort
    this.webHookURL = options.webHookURL

    this.internalServer = new Hapi.Server()
    this.internalServer.connection({
      port: this.port,
    })
    this.internalServer.route({
      method: 'POST',
      path: '/bots/{botSlug}',
      handler: (request, reply) => {
        if (request.payload && request.payload.sender_action) {
          return reply()
        }
        const resolve = responses.shift()
        resolve(request.payload)
        return reply()
      },
    })
  }

  startListening(cb) {
    this.internalServer.start((err) => {
      if (err) {
        return cb(err)
      }
      console.log(`Kaiwa server running at  ${this.internalServer.info.uri}`)
      return cb()
    })
  }

  runScript(messageToSend, options) {
    const defaults = {
      responses: 1,
    }
    const config = arguments.length > 1 ? _.defaults(options, defaults) : defaults

    Wreck.post(this.webHookURL, { payload: messageToSend }, () => { })
    return deferPromises(config.responses)
  }

  stopListening(cb) {
    this.internalServer.stop((err) => {
      if (err) {
        return cb(err)
      }
      console.log('Kaiwa server stopped')
      return cb()
    })
  }
}

module.exports = {
  Tester,
}
