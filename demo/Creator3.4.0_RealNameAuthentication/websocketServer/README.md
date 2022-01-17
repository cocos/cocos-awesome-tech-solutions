# websocket
High quality low grade server side WebSocket (RFC 6455) implementation.

## Motivation
Web requests are typically follow a request-response pattern. The client
communicates the resource that it wants, and the server responds with the
content that resource (or an error status code). After this the connection
between client and server is closed and communication ends.

WebSocket (RFC 6455) allows an HTTP client, such as a modern web browser, to
request that the HTTP connection not close, but rather be upgraded to a
communication channel for an on-going two-way exchange of binary and text data.
Basically, the client says: Don't hang up yet, let's chat awhile.

This fills an interesting niche in client-server communications. At first,
it looks and acts (and actually, is) a web (HTTP) request. This allows the
communication to get around most networking/firewall problems involved with
opening a direct communication channel. Yet, after the WebSocket handshake,
the channel acts very much like a traditional socket. The connection stays
open and any data may be put on the wire.

## websocket
This component is a server-side WebSocket implementation. By using the
provided WebSocketServerSocket to decorate a ServerSocket, the server can
listen for WebSocket connections and treat them like a traditional socket.

WebSocketServerSocket itself is a ServerSocket. So, it can be used anywhere
in your application that a ServerSocket might be used. WebSocketServerSocket
can decorate any ServerSocket, including SSLServerSocket, if you want to
support secure WebSocket connections.

## Usage
This is how you start listening for WebSocket connections:

    ServerSocket serverSocket = new ServerSocket(PORT);
    WebSocketServerSocket webSocketServerSocket = new WebSocketServerSocket(serverSocket);
    WebSocket webSocket = webSocketServerSocket.accept();

And this is how you read data from the connecting client:

    InputStream is = webSocket.getInputStream();
    int data = is.read();

And this is how you communicate back to the connecting client:

    WebSocketServerOutputStream os = webSocket.getOutputStream();
    os.writeString("This is a UTF-8 string.");
    os.writeBinary("Some binary data.".getBytes());

Note that this usage is as raw as it gets, giving you the bytes sent over
the WebSocket.

### Echo server example
Included in this component is the example EchoServer. By running this, you
can test the WebSocket implementation.

    mvn install
    ./start-echo-server

Then point your browser to the following URL:

* [http://www.websocket.org/echo.html](http://www.websocket.org/echo.html)

Change the server to:

    localhost:8080

You can then test that the server is echoing back the bytes that it has
received.

## Features
This WebSocket implementation is safe for very large frames. It does NOT
allocate large buffers in anticipation of large frames.

The code is:
* Checkstyle clean
* FindBugs clean
* PMD/CPD clean

The code has virtually 100% test coverage in Cobertura.

## Shortcomings
This component is fairly specialized, and there are not a whole lot of
options.

### Protocol opacity
This component does its best to hide the details of the WebSocket protocol
from the application.

* No distinction is made between binary frames and text frames.
* No markers indicate the start or end of frames in the stream.
* Control frames (Ping, Pong, Close) are handled internally, and never
  visible to the application.

If you need a nice clear channel to communicate strings or binary blobs
between server and client, this component will meet your requirements.
If you need to get into the guts of the WebSocket protocol, you'll
need to modify the component.

### No channels
Unlike a regular Socket or ServerSocket, you cannot call getChannel().
Attempting to do so will throw a UnsupportedOperationException.

## Development ideas
These are some ideas that I might work on in the future.

* Add a client side socket, to allow a Java process to connect to a
  server that speaks WebSocket.

* Use Guava's EventBus to create an evented I/O object that speaks WebSocket.

* Create a WebSocketChannel to provide WebSocket protocol support for NIO
  channels.

## License
This program is free software: you can redistribute it and/or modify
it under the terms of the [GNU Affero General Public License]
(https://www.gnu.org/licenses/agpl-3.0.html) as published by the
[Free Software Foundation](http://www.fsf.org/), either version 3
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
[GNU Affero General Public License]
(https://www.gnu.org/licenses/agpl-3.0.html) for more details.

You should have received a copy of the [GNU Affero General Public License]
(https://www.gnu.org/licenses/agpl-3.0.html) along with this program. If
not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).
