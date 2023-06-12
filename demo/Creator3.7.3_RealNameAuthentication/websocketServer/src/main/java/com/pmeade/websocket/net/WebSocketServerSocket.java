/*
 * WebSocketServerSocket.java
 * Copyright 2014 Patrick Meade.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.pmeade.websocket.net;

import java.io.IOException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.SocketAddress;
import java.net.SocketException;
import java.nio.channels.ServerSocketChannel;

/**
 * WebSocketServerSocket decorates a ServerSocket to accept connections
 * that use the WebSocket protocol as specified in RFC 6455.
 * @author veloxi
 */
public class WebSocketServerSocket extends ServerSocket {
    /**
     * Construct a WebSocketServerSocket. WebSocketServerSocket provides a
     * ServerSocket with WebSocket (RFC 6455) behavior.
     * @param ss ServerSocket to be decorated with WebSocket behavior
     * @throws IOException if an I/O error occurs
     */
    public WebSocketServerSocket(final ServerSocket ss) throws IOException {
        this.serverSocket = ss;
    }

    @Override
    public final void bind(final SocketAddress endpoint) throws IOException {
        serverSocket.bind(endpoint);
    }

    @Override
    public final void bind(final SocketAddress endpoint, final int backlog)
            throws IOException {
        serverSocket.bind(endpoint, backlog);
    }

    @Override
    public final InetAddress getInetAddress() {
        return serverSocket.getInetAddress();
    }

    @Override
    public final int getLocalPort() {
        return serverSocket.getLocalPort();
    }

    @Override
    public final SocketAddress getLocalSocketAddress() {
        return serverSocket.getLocalSocketAddress();
    }

    @Override
    public final WebSocket accept() throws IOException {
        return new WebSocket(serverSocket.accept());
    }

    @Override
    public final void close() throws IOException {
        serverSocket.close();
    }

    @Override
    public final ServerSocketChannel getChannel() {
        throw new UnsupportedOperationException();
    }

    @Override
    public final boolean isBound() {
        return serverSocket.isBound();
    }

    @Override
    public final boolean isClosed() {
        return serverSocket.isClosed();
    }

    @Override
    public final synchronized void setSoTimeout(final int timeout)
            throws SocketException {
        serverSocket.setSoTimeout(timeout);
    }

    @Override
    public final synchronized int getSoTimeout() throws IOException {
        return serverSocket.getSoTimeout();
    }

    @Override
    public final void setReuseAddress(final boolean on)
            throws SocketException {
        serverSocket.setReuseAddress(on);
    }

    @Override
    public final boolean getReuseAddress() throws SocketException {
        return serverSocket.getReuseAddress();
    }

    @Override
    public final String toString() {
        return serverSocket.toString();
    }

    @Override
    public final synchronized void setReceiveBufferSize(final int size)
            throws SocketException {
        serverSocket.setReceiveBufferSize(size);
    }

    @Override
    public final synchronized int getReceiveBufferSize()
            throws SocketException {
        return serverSocket.getReceiveBufferSize();
    }

    @Override
    public final void setPerformancePreferences(
            final int connectionTime,
            final int latency,
            final int bandwidth) {
        serverSocket.setPerformancePreferences(
                connectionTime, latency, bandwidth);
    }

    /**
     * ServerSocket to be decorated with WebSocket behavior.
     */
    private final ServerSocket serverSocket;
}
