'use strict'

const Hapi = require('hapi')
const Wreck = require('wreck')
const Promise = require('bluebird')
const _ = require('lodash')
const Hoek = require('hoek')

const internals = {}
module.exports.Tester = (function () {
  function Tester(options) {
    const self = this


    this.options = options
    this.internalServer = new Hapi.Server()
    this.internalServer.connection({ port: this.options.testingPort })
    this.internalServer.route({
      method: 'POST',
      path: '/bots/{botSlug}',
      handler: function (request, reply) {

        const resolve = internals.responses.shift()
        resolve(request.payload)

        reply()
      }
    })

    this.internalServer.route({
      method: 'GET',
      path: '/bots/{botSlug}/users/{userId}',
      handler: (request, reply) => {
        reply({
          first_name: 'Byron',
          last_name: 'Sequen',
          profile_pic: 'https://scontent.xx.fbcdn.net/v/t31.0-1/11144480_10206350725419470_2587846062330382983_o.jpg?oh=b0f6c54b9ffda86e4758a53a31a4e802&oe=5A0FA360',
          gender: 'male'
        })
      }
    })
  }

  Tester.prototype.startListening = function (cb) {
    this.internalServer.start((err) => {
      if (err) {
        cb(err)
      }
      console.log('Kaiwa server running at ' + this.internalServer.info.uri)
      cb()
    })
  }

  Tester.prototype.runScript = function (messageToSend, options) {

    internals.responses = []
    let lastPromise
    const defaults = {
      responses: 1
    }
    const config = arguments.length >1 ? Hoek.applyToDefaults(defaults, options) : defaults


    Wreck.post(this.options.webHookURL, { payload: messageToSend }, (err, res, payload) => { })
    return internals.deferPromises(config.responses)

  }

  return Tester

})()

internals.deferPromises = (count) => {

  const promises = []

  for (let i=1; i <= count; i++){

    let deferResolve
    promises.push(new Promise((resolve) => {

      deferResolve = resolve
    }))

    internals.responses.push(deferResolve)
  }

  return Promise.all(promises)
}
