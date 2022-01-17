/*
 * WebSocket.java
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

import com.pmeade.websocket.io.WebSocketServerInputStream;
import com.pmeade.websocket.io.WebSocketServerOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.SocketException;
import java.nio.channels.SocketChannel;

/**
 * WebSocket decorates Socket to provide the server side of a Socket that
 * speaks the WebSocket (RFC 6455) protocol.
 * @author veloxi
 */
public class WebSocket extends Socket {
    /**
     * Construct a WebSocket. WebSocket decorates a Socket for WebSocket
     * (RFC 6455) behavior.
     * @param s Socket to be decorated with WebSocket behavior.
     */
    public WebSocket(final Socket s) {
        this.socket = s;
    }

    @Override
    public final void connect(final SocketAddress endpoint) throws IOException {
        socket.connect(endpoint);
    }

    @Override
    public final void connect(final SocketAddress endpoint, final int timeout)
            throws IOException {
        socket.connect(endpoint, timeout);
    }

    @Override
    public final void bind(final SocketAddress bindpoint) throws IOException {
        socket.bind(bindpoint);
    }

    @Override
    public final InetAddress getInetAddress() {
        return socket.getInetAddress();
    }

    @Override
    public final InetAddress getLocalAddress() {
        return socket.getLocalAddress();
    }

    @Override
    public final int getPort() {
        return socket.getPort();
    }

    @Override
    public final int getLocalPort() {
        return socket.getLocalPort();
    }

    @Override
    public final SocketAddress getRemoteSocketAddress() {
        return socket.getRemoteSocketAddress();
    }

    @Override
    public final SocketAddress getLocalSocketAddress() {
        return socket.getLocalSocketAddress();
    }

    @Override
    public final SocketChannel getChannel() {
        throw new UnsupportedOperationException();
    }

    @Override
    public final WebSocketServerInputStream getInputStream()
            throws IOException {
        if (wssos == null) {
            this.getOutputStream();
        }
        if (wssis == null) {
            wssis = new WebSocketServerInputStream(
                        socket.getInputStream(), wssos);
        }
        return wssis;
    }

    @Override
    public final WebSocketServerOutputStream getOutputStream()
            throws IOException {
        if (wssos == null) {
            wssos = new WebSocketServerOutputStream(socket.getOutputStream());
        }
        return wssos;
    }

    @Override
    public final void setTcpNoDelay(final boolean on) throws SocketException {
        socket.setTcpNoDelay(on);
    }

    @Override
    public final boolean getTcpNoDelay() throws SocketException {
        return socket.getTcpNoDelay();
    }

    @Override
    public final void setSoLinger(final boolean on, final int linger)
            throws SocketException {
        socket.setSoLinger(on, linger);
    }

    @Override
    public final int getSoLinger() throws SocketException {
        return socket.getSoLinger();
    }

    @Override
    public final void sendUrgentData(final int data)
            throws IOException {
        socket.sendUrgentData(data);
    }

    @Override
    public final void setOOBInline(final boolean on)
            throws SocketException {
        socket.setOOBInline(on);
    }

    @Override
    public final boolean getOOBInline() throws SocketException {
        return socket.getOOBInline();
    }

    @Override
    public final synchronized void setSoTimeout(final int timeout)
            throws SocketException {
        socket.setSoTimeout(timeout);
    }

    @Override
    public final synchronized int getSoTimeout() throws SocketException {
        return socket.getSoTimeout();
    }

    @Override
    public final synchronized void setSendBufferSize(final int size)
            throws SocketException {
        socket.setSendBufferSize(size);
    }

    @Override
    public final synchronized int getSendBufferSize() throws SocketException {
        return socket.getSendBufferSize();
    }

    @Override
    public final synchronized void setReceiveBufferSize(final int size)
            throws SocketException {
        socket.setReceiveBufferSize(size);
    }

    @Override
    public final synchronized int getReceiveBufferSize()
            throws SocketException {
        return socket.getReceiveBufferSize();
    }

    @Override
    public final void setKeepAlive(final boolean on) throws SocketException {
        socket.setKeepAlive(on);
    }

    @Override
    public final boolean getKeepAlive() throws SocketException {
        return socket.getKeepAlive();
    }

    @Override
    public final void setTrafficClass(final int tc) throws SocketException {
        socket.setTrafficClass(tc);
    }

    @Override
    public final int getTrafficClass() throws SocketException {
        return socket.getTrafficClass();
    }

    @Override
    public final void setReuseAddress(final boolean on) throws SocketException {
        socket.setReuseAddress(on);
    }

    @Override
    public final boolean getReuseAddress() throws SocketException {
        return socket.getReuseAddress();
    }

    @Override
    public final synchronized void close() throws IOException {
        socket.close();
    }

    @Override
    public final void shutdownInput() throws IOException {
        socket.shutdownInput();
    }

    @Override
    public final void shutdownOutput() throws IOException {
        socket.shutdownOutput();
    }

    @Override
    public final String toString() {
        return socket.toString();
    }

    @Override
    public final boolean isConnected() {
        return socket.isConnected();
    }

    @Override
    public final boolean isBound() {
        return socket.isBound();
    }

    @Override
    public final boolean isClosed() {
        return socket.isClosed();
    }

    @Override
    public final boolean isInputShutdown() {
        return socket.isInputShutdown();
    }

    @Override
    public final boolean isOutputShutdown() {
        return socket.isOutputShutdown();
    }

    @Override
    public final void setPerformancePreferences(
            final int connectionTime,
            final int latency,
            final int bandwidth) {
        socket.setPerformancePreferences(connectionTime, latency, bandwidth);
    }

    /**
     * Socket to be decorated for WebSocket behavior.
     */
    private final Socket socket;

    /**
     * WebSocketServerInputStream that decorates the InputStream for
     * this Socket. Created on the first call to <code>getInputStream()</code>.
     */
    private WebSocketServerInputStream wssis = null;

    /**
     * WebSocketServerOutputStream that decorates the OutputStream for
     * this Socket. Created on the first call to <code>getInputStream()</code>
     * or <code>getOutputStream()</code>.
     */
    private WebSocketServerOutputStream wssos = null;
}
