# 1.7.2
* Fixed: parsing error when `Connection` header uses ',' instead of ', ' (with space) [#46](https://github.com/sitegui/nodejs-websocket/pull/46)
* Fixed: uses Buffer.alloc and Buffer.from instead of new Buffer
* Changed: Drop support for Node v0.12

# 1.7.1
* Fixed: two errors were emitted when trying to sendText to a closed connection while there was another pending binary write operation.

# 1.7.0
* Added: emit `Connection#error` event on invalid handshake response with the reason why it was rejected
* Added: support for protocol negotiation
* Added: `validProtocols` and `selectProtocol` options to `ws.createServer()`
* Added: `protocols` option to `ws.connect`
* Added: `Connection#protocols` and `Connection#protocol`

# 1.6.0
* Added: `Server#close` as a short hand for `Server#socket.close`

# 1.5.0
* Added: `Connection#send` as a short hand for `Connection#sendText` or `Connection#sendBinary`, depending on the data type (string or Buffer)

# 1.4.1
* Added: example to README

# 1.4.0
* Added: `extraHeaders` option in `ws.connect(URL, [options], [callback])` to let one add custom headers to the HTTP handshake request

# 1.3.0

* Added: `Connection#sendPing([data=''])`
* Added: `pong(data)` event