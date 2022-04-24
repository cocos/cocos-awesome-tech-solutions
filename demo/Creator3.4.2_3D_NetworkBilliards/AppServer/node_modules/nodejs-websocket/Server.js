/**
 * @file Represents a websocket server
 */
'use strict'

function nop() {}

var util = require('util'),
	net = require('net'),
	tls = require('tls'),
	events = require('events'),
	Connection

/**
 * @callback SelectProtocolCallback
 * @param {Connection} connection
 * @param {Array<string>} protocols
 * @returns {?string}
 */

/**
 * Creates a new ws server and starts listening for new connections
 * @class
 * @param {boolean} secure indicates if it should use tls
 * @param {Object} [options] will be passed to net.createServer() or tls.createServer()
 * @param {Array<string>} [options.validProtocols]
 * @param {SelectProtocolCallback} [options.selectProtocol]
 * @param {Function} [callback] will be added as "connection" listener
 * @inherits EventEmitter
 * @event listening
 * @event close
 * @event error an error object is passed
 * @event connection a Connection object is passed
 */
function Server(secure, options, callback) {
	var that = this

	if (typeof options === 'function') {
		callback = options
		options = undefined
	}

	var onConnection = function (socket) {
		var conn = new Connection(socket, that, function () {
			that.connections.push(conn)
			conn.removeListener('error', nop)
			that.emit('connection', conn)
		})
		conn.on('close', function () {
			var pos = that.connections.indexOf(conn)
			if (pos !== -1) {
				that.connections.splice(pos, 1)
			}
		})

		// Ignore errors before the connection is established
		conn.on('error', nop)
	}

	if (secure) {
		this.socket = tls.createServer(options, onConnection)
	} else {
		this.socket = net.createServer(options, onConnection)
	}

	this.socket.on('close', function () {
		that.emit('close')
	})
	this.socket.on('error', function (err) {
		that.emit('error', err)
	})
	this.connections = []

	// super constructor
	events.EventEmitter.call(this)
	if (callback) {
		this.on('connection', callback)
	}

	// Add protocol agreement handling
	/**
	 * @member {?SelectProtocolCallback}
	 * @private
	 */
	this._selectProtocol = null

	if (options && options.selectProtocol) {
		// User-provided logic
		this._selectProtocol = options.selectProtocol
	} else if (options && options.validProtocols) {
		// Default logic
		this._selectProtocol = this._buildSelectProtocol(options.validProtocols)
	}
}

util.inherits(Server, events.EventEmitter)
module.exports = Server

Connection = require('./Connection')

/**
 * Start listening for connections
 * @param {number} port
 * @param {string} [host]
 * @param {Function} [callback] will be added as "connection" listener
 */
Server.prototype.listen = function (port, host, callback) {
	var that = this

	if (typeof host === 'function') {
		callback = host
		host = undefined
	}

	if (callback) {
		this.on('listening', callback)
	}

	this.socket.listen(port, host, function () {
		that.emit('listening')
	})

	return this
}

/**
 * Stops the server from accepting new connections and keeps existing connections.
 * This function is asynchronous, the server is finally closed when all connections are ended and the server emits a 'close' event.
 * The optional callback will be called once the 'close' event occurs.
 * @param {function()} [callback]
 */
Server.prototype.close = function (callback) {
	if (callback) {
		this.once('close', callback)
	}
	this.socket.close()
}

/**
 * Create a resolver to pick the client's most preferred protocol the server recognises
 * @param {Array<string>} validProtocols
 * @returns {SelectProtocolCallback}
 * @private
 */
Server.prototype._buildSelectProtocol = function (validProtocols) {
	return function (conn, protocols) {
		var i

		for (i = 0; i < protocols.length; i++) {
			if (validProtocols.indexOf(protocols[i]) !== -1) {
				// A valid protocol was found
				return protocols[i]
			}
		}

		// No agreement
	}
}