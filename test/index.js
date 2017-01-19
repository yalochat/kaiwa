'use strict'

const Hapi = require('hapi')
const Wreck = require('wreck')
const Kaiwa = require('../')
const Lab = require('lab')
const Code = require('code');
const expect = Code.expect;

const lab = exports.lab = Lab.script();


lab.experiment('conversation', () => {

    const server = new Hapi.Server()
    server.connection({ port: 3000 })
    server.route({
        method: 'POST',
        path: '/',
        handler: function (request, reply) {
            Wreck.post('http://localhost:3001/', { payload: { text: 'pong' } }, (err, res, payload) => { })
            reply({ status: 'OK' })
        }
    })
    server.start((err) => {
        if (err) {
            throw err
        }
        console.log('Server running at ' + server.info.uri)
    })

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

        const messageToSend = { text: 'ping' }
        const expectedMessage = { text: 'pong' }
        tester.runScript(messageToSend, expectedMessage).then((result) => {
            expect(result).to.be.true()
            done()
        })
    })

    lab.test('error on no expected response', (done) => {
        const messageToSend = { text: 'ping' }
        const expectedMessage = { text: 'ball' }
        tester.runScript(messageToSend, expectedMessage).catch((error) => {
            expect(error).to.be.object()
            done()
        })
    })
})