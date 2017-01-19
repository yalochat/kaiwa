'use strict'

const Hapi = require('hapi')
const Wreck = require('wreck')
const Promise = require('bluebird')
const _ = require('lodash')

module.exports.Tester = (function () {
    function Tester(options) {
        const self = this
        this.options = options
        this.internalServer = new Hapi.Server()
        this.internalServer.connection({ port: this.options.testingPort })
        this.internalServer.route({
            method: 'POST',
            path: '/',
            handler: function (request, reply) {
                if(_.isEqual(self.expectedMessage,request.payload)){
                    self.p.resolve(true)
                }else{
                    self.p.reject(new Error(`Expected ${JSON.stringify(self.expectedMessage)} but found ${JSON.stringify(request.payload)}`))
                }
                //self.p.resolve(true)
                reply({status: 'ok'})
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

    Tester.prototype.runScript = function (messageToSend, expectedMessage) {
        this.expectedMessage = expectedMessage
        this.p = new defer((reject, resolve) => {
            Wreck.post(this.options.webHookURL, { payload: messageToSend }, (err, res, payload) => { })
        })
        return this.p.promise
    }

    return Tester

})()

function defer(cb) {
    var resolve, reject;
    var promise = new Promise(function (r, j) {
        resolve = r;
        reject = j;
        cb(r, j)
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
}