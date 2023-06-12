/*
 * WebSocketServerInputStream.java
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

package com.pmeade.websocket.io;

import com.google.common.hash.HashCode;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;
import com.google.common.io.BaseEncoding;
import com.pmeade.websocket.http.HttpRequest;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * WebSocketServerInputStream decorates an InputStream to handle WebSocket
 * frames as specified in RFC 6455.
 * @author pmeade
 */
public class WebSocketServerInputStream extends InputStream {
    /**
     * Constant indicating end of stream.
     */
    public static final int EOF = -1;

    /**
     * Number of bytes in the WebSocket handshake nonce.
     */
    public static final int HANDSHAKE_NONCE_LENGTH = 16;

    /**
     * Payload length indicating that the payload's true length is a
     * yet-to-be-provided unsigned 16-bit integer.
     */
    public static final int LENGTH_16 = 0x7E;

    /**
     * A payload specified with 16 bits must have at least this
     * length in order to be considered valid.
     */
    public static final int LENGTH_16_MIN = 126;

    /**
     * Payload length indicating that the payload's true length is a
     * yet-to-be-provided unsigned 64-bit integer (MSB = 0).
     */
    public static final int LENGTH_64 = 0x7F;

    /**
     * A payload specified with 64 bits must have at least this
     * length in order to be considered valid.
     */
    public static final int LENGTH_64_MIN = 0x10000;

    /**
     * Binary mask to limit an int to 8 bits (an unsigned byte).
     */
    public static final int MASK_BYTE = 0x000000FF;

    /**
     * Binary mask to extract the final fragment flag bit of a WebSocket frame.
     */
    public static final int MASK_FINAL = 0x80;

    /**
     * Binary mask to extract the masking flag bit of a WebSocket frame.
     */
    public static final int MASK_MASK = 0x80;

    /**
     * Binary mask to limit a value in the range [0-3] (inclusive).
     */
    public static final int MASK_MASKING_INDEX = 0x03;

    /**
     * Binary mask to extract the opcode bits of a WebSocket frame.
     */
    public static final int MASK_OPCODE = 0x0F;

    /**
     * Binary mask to extract the control bit of an opcode.
     */
    public static final int MASK_CONTROL_OPCODE = 0x08;

    /**
     * Binary mask to extract the payload size of a WebSocket frame.
     */
    public static final int MASK_PAYLOAD_SIZE = 0x7F;

    /**
     * Binary mask to extract the reserved flag bits of a WebSocket frame.
     */
    public static final int MASK_RESERVED = 0x70;

    /**
     * Number of masking bytes provided by the client.
     */
    public static final int NUM_MASKING_BYTES = 4;

    /**
     * Number of octets (bytes) in a 64-bit number.
     */
    public static final int NUM_OCTET_64 = 8;

    /**
     * Number of bits in an octet.
     */
    public static final int OCTET = 8;

    /**
     * WebSocket Opcode for a Continuation frame.
     */
    public static final int OPCODE_CONTINUATION = 0x00;

    /**
     * WebSocket Opcode for a Text frame.
     */
    public static final int OPCODE_TEXT = 0x01;

    /**
     * WebSocket Opcode for a Binary frame.
     */
    public static final int OPCODE_BINARY = 0x02;

    /**
     * Lowest WebSocket Opcode for reserved non-control frames. That is
     * these data frames are yet reserved (undefined).
     */
    public static final int OPCODE_RESERVED_NON_CONTROL_LOW = 0x03;

    /**
     * Highest WebSocket Opcode for reserved non-control frames. That is
     * these data frames are yet reserved (undefined).
     */
    public static final int OPCODE_RESERVED_NON_CONTROL_HIGH = 0x07;

    /**
     * WebSocket Opcode for a Close control frame.
     */
    public static final int OPCODE_CLOSE = 0x08;

    /**
     * WebSocket Opcode for a Ping control frame.
     */
    public static final int OPCODE_PING = 0x09;

    /**
     * WebSocket Opcode for a Pong control frame.
     */
    public static final int OPCODE_PONG = 0x0A;

    /**
     * Lowest WebSocket Opcode for reserved control frames. That is
     * these control frames are yet reserved (undefined).
     */
    public static final int OPCODE_RESERVED_CONTROL_LOW = 0x0B;

    /**
     * Highest WebSocket Opcode for reserved control frames. That is
     * these control frames are yet reserved (undefined).
     */
    public static final int OPCODE_RESERVED_CONTROL_HIGH = 0x0F;

    /**
     * Lowest WebSocket Opcode that defines a control frame.
     */
    public static final int OPCODE_CONTROL_LOW = 0x08;

    /**
     * Highest WebSocket Opcode that defines a control frame.
     */
    public static final int OPCODE_CONTROL_HIGH = 0x0F;

    /**
     * WebSocket Accept UUID. The UUID to be appended to the client-provided
     * security nonce, in order to complete the WebSocket handshake.
     */
    public static final String WEBSOCKET_ACCEPT_UUID =
                               "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    /**
     * Convert the provided byte to an unsigned int.
     * @param b byte to be converted
     * @return unsigned int (8-bit) representation of the provided byte
     */
    public static final int asUnsignedInt(final byte b) {
        int x = b;
        x &= MASK_BYTE;
        return x;
    }

    /**
     * Convert the provided String to UTF-8 encoded bytes.
     * @param s String to be converted to a UTF-8 representation
     * @return byte array containing the UTF-8 representation of the
     *         provided String data
     */
    public static final byte[] asUTF8(final String s) {
        return s.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Check if the first String contains() the second String. This method
     * returns false if the first string is null.
     * @param s1 String to be checked if it contains
     * @param s2 String to check for
     * @return true, iff s1.contains(s2), otherwise false
     */
    public static boolean checkContains(final String s1, final String s2) {
        if (s1 == null) {
            return false;
        }
        return s1.contains(s2);
    }

    /**
     * Check if the first String startsWith() the second String. This method
     * returns false if the first String is null.
     * @param s1 String to be checked if it starts with
     * @param s2 String to check for
     * @return true, iff s1.startsWith(s2), otherwise false
     */
    public static boolean checkStartsWith(final String s1, final String s2) {
        if (s1 == null) {
            return false;
        }
        return s1.startsWith(s2);
    }

    /**
     * Create a WebSocket-speaking InputStream from the provided InputStream.
     * Note that an output peer is still required.
     * @param is InputStream to be decorated as a WebSocket-speaking InputStream
     */
    public WebSocketServerInputStream(final InputStream is) {
        checkNotNull(is, "is == null");
        this.inputStream = is;
    }

    /**
     * Create a WebSocket-speaking InputStream from the provided InputStream
     * and output peer WebSocketOutputStream.
     * @param is InputStream to be decorated as a WebSocket-speaking InputStream
     * @param wsos WebSocketOutputStream to be the output peer
     */
    public WebSocketServerInputStream(final InputStream is,
                                      final WebSocketServerOutputStream wsos) {
        checkNotNull(is, "is == null");
        checkNotNull(wsos, "wsos == null");
        this.inputStream = is;
        this.outputPeer = wsos;
    }

    /**
     * Obtain a reference to the peer object used for output on this stream.
     * @return WebSocketServerOutputStream used for output on this stream
     */
    public final WebSocketServerOutputStream getOutputPeer() {
        return outputPeer;
    }

    /**
     * Determine if this connection has sent a WebSocket Close frame.
     * @return true, if this connection has sent a WebSocket Close frame,
     *         otherwise false.
     */
    private boolean isCloseSent() {
        return outputPeer.isCloseSent();
    }

    /**
     * Determine if the WebSocket connection is closed.
     * @return true, if the WebSocket connection is closed, otherwise false.
     */
    public final boolean isClosed() {
        return closeReceived && isCloseSent();
    }

    /**
     * Determine if the WebSocket connection has failed.
     * @return true, if the WebSocket connection has failed, otherwise false.
     */
    public final boolean isFailed() {
        return failed;
    }

    /**
     * Determine if the WebSocket handshake has completed successfully.
     * @return true, if the WebSocket handshake has completed successfully,
     *         otherwise false.
     */
    public final boolean isHandshakeComplete() {
        return handshakeComplete;
    }

    /**
     * Reads the next byte of data from the input stream. The value byte is
     * returned as an int in the range 0 to 255. If no byte is available
     * because the end of the stream has been reached, the value -1 is
     * returned. This method blocks until input data is available, the end
     * of the stream is detected, or an exception is thrown.
     * @return the next byte of data, or -1 if the end of the stream is
     *         reached.
     * @throws IOException if an I/O error occurs.
     */
    @Override
    public final int read() throws IOException {
        if (isClosed() || isFailed()) {
            return EOF;
        }
        if (!handshakeComplete) {
            shakeHands();
            if (!handshakeComplete) {
                failTheWebSocketConnection();
                return EOF;
            }
        }
        return nextWebSocketByte();
    }

    /**
     * Set the output peer for this InputStream. A WebSocketServerOutputStream
     * object is used to communicate back to the source of this InputStream.
     * This method allows a client to specify the object that does this. This
     * is especially useful if the client did not do so during construction.
     * @param op WebSocketServerOutputStream object used to communicate back
     *           to the source of this InputStream
     */
    public final void setOutputPeer(final WebSocketServerOutputStream op) {
        this.outputPeer = op;
    }

    //-----------------------------------------------------------------------

    /**
     * Obtain the next byte of data from the WebSocket.
     * @return the next byte of data from the WebSocket
     * @throws IOException if anything goes wrong with the underlying stream
     */
    private int nextWebSocketByte() throws IOException {
        while (payloadLength == 0L) {
            nextWebSocketFrame();
            if (isClosed() || isFailed()) {
                return EOF;
            }
        }
        int data = inputStream.read() ^ maskingBytes[maskingIndex];
        payloadLength--;
        maskingIndex++;
        maskingIndex &= MASK_MASKING_INDEX;
        return data;
    }

    /**
     * Process the next WebSocket frame. This method reads the header
     * information about the frame. It sets up non-control frames to
     * provide their data, and handles WebSocket protocol-specifics for
     * the control frames.
     * @throws IOException if anything goes wrong with the underlying stream
     */
    private void nextWebSocketFrame() throws IOException {
        // byte 0: flags and opcode
        int flagOps = inputStream.read();
        if ((flagOps & MASK_RESERVED) != 0x00) {
            failTheWebSocketConnection();
            return;
        }
        int opcode = flagOps & MASK_OPCODE;
        if (opcode >= OPCODE_RESERVED_NON_CONTROL_LOW
            && opcode <= OPCODE_RESERVED_NON_CONTROL_HIGH) {
            failTheWebSocketConnection();
            return;
        }
        if (opcode >= OPCODE_RESERVED_CONTROL_LOW) {
            failTheWebSocketConnection();
            return;
        }
        boolean finalFragment = (flagOps & MASK_FINAL) == MASK_FINAL;
        boolean controlOpcode =
            (flagOps & MASK_CONTROL_OPCODE) == MASK_CONTROL_OPCODE;
        if (controlOpcode && !finalFragment) {
            failTheWebSocketConnection();
            return;
        }
        // byte 1: masking and payload length
        int maskPayload = inputStream.read();
        boolean masked = (maskPayload & MASK_MASK) == MASK_MASK;
        if (!masked) {
            failTheWebSocketConnection();
            return;
        }
        int payloadSize = maskPayload & MASK_PAYLOAD_SIZE;
        // byte 2-9: extended payload length, if specified
        if (payloadSize == LENGTH_16) {
            if (controlOpcode) {
                failTheWebSocketConnection();
                return;
            }
            payloadLength = (inputStream.read() << OCTET)
                          | (inputStream.read());
            if (payloadLength < LENGTH_16_MIN) {
                failTheWebSocketConnection();
                return;
            }
        } else if (payloadSize == LENGTH_64) {
            if (controlOpcode) {
                failTheWebSocketConnection();
                return;
            }
            payloadLength = 0L;
            for (int i = 0; i < NUM_OCTET_64; i++) {
                payloadLength |=
                    inputStream.read() << (NUM_OCTET_64 - 1 - i) * OCTET;
            }
            if (payloadLength < LENGTH_64_MIN) {
                failTheWebSocketConnection();
                return;
            }
        } else {
            payloadLength = payloadSize;
        }
        // byte 10-13: masking key
        for (int i = 0; i < NUM_MASKING_BYTES; i++) {
            maskingBytes[i] = inputStream.read();
        }
        maskingIndex = 0;
        // if this is a control opcode; handle the control frame
        if (opcode == OPCODE_CLOSE) {
            handleCloseFrame();
        }
        if (opcode == OPCODE_PING) {
            handlePingFrame();
        }
        if (opcode == OPCODE_PONG) {
            handlePongFrame();
        }
    }

    /**
     * Perform the initial WebSocket handshake. WebSockets connect with an
     * HTTP Request to upgrade the connection to a WebSocket connection. This
     * method ensures that the request is correctly formed, and provides
     * the appropriate response to the client. After this method is called,
     * further communication is performed solely with WebSocket frames.
     * @throws IOException if anything goes wrong with the underlying stream
     */
    private void shakeHands() throws IOException {
        HttpRequest req = new HttpRequest(inputStream);
        String requestLine = req.get(HttpRequest.REQUEST_LINE);
        handshakeComplete = checkStartsWith(requestLine, "GET /")
            && checkContains(requestLine, "HTTP/")
            && req.get("Host") != null
            && checkContains(req.get("Upgrade"), "websocket")
            && checkContains(req.get("Connection"), "Upgrade")
            && "13".equals(req.get("Sec-WebSocket-Version"))
            && req.get("Sec-WebSocket-Key") != null;
        String nonce = req.get("Sec-WebSocket-Key");
        if (handshakeComplete) {
            byte[] nonceBytes = BaseEncoding.base64().decode(nonce);
            if (nonceBytes.length != HANDSHAKE_NONCE_LENGTH) {
                handshakeComplete = false;
            }
        }
        // if we have met all the requirements
        if (handshakeComplete) {
            outputPeer.write(asUTF8("HTTP/1.1 101 Switching Protocols\r\n"));
            outputPeer.write(asUTF8("Upgrade: websocket\r\n"));
            outputPeer.write(asUTF8("Connection: upgrade\r\n"));
            outputPeer.write(asUTF8("Sec-WebSocket-Accept: "));
            HashFunction hf = Hashing.sha1();
            HashCode hc = hf.newHasher()
                .putString(nonce, StandardCharsets.UTF_8)
                .putString(WEBSOCKET_ACCEPT_UUID, StandardCharsets.UTF_8)
                .hash();
            String acceptKey = BaseEncoding.base64().encode(hc.asBytes());
            outputPeer.write(asUTF8(acceptKey));
            outputPeer.write(asUTF8("\r\n\r\n"));
        }
        outputPeer.setHandshakeComplete(handshakeComplete);
    }

    /**
     * Sets the WebSocketServerInputStream to a FAILED state. In this state,
     * no further processing of data takes place. Mostly it is used to
     * prevent actions that rely upon faulty WebSocket implementations.
     */
    private void failTheWebSocketConnection() {
        failed = true;
    }

    /**
     * Handle an incoming Close control frame. If we haven't sent a Close
     * frame to the client, we do so. We then close the underlying socket.
     * @throws IOException if anything goes wrong with the underlying stream
     */
    private void handleCloseFrame() throws IOException {
        // the client has sent us a close frame
        closeReceived = true;
        // if we already sent a close frame before
        if (isCloseSent()) {
            // then we received an acknowledgement close frame
            // from the client, so we need to close the underlying
            // TCP socket now
            this.close();
            return;
        }
        // otherwise, the client has sent us a close frame
        // and we will acknowledge that close frame now
        byte[] closePayload = consumePayload();
        if (closePayload.length >= 2) {
            int highByte = asUnsignedInt(closePayload[0]);
            int lowByte = asUnsignedInt(closePayload[1]);
            int closeStatusCode = (highByte << OCTET) | lowByte;
            outputPeer.writeClose(closeStatusCode);
        } else {
            outputPeer.writeClose();
        }
        // we need to close the underlying TCP socket now
        this.close();
    }

    /**
     * Handle an incoming Ping control frame. The WebSocket standard indicates
     * echoing a Pong frame back with an identical payload. That is what this
     * method does.
     * @throws IOException if anything goes wrong with the underlying stream
     */
    private void handlePingFrame() throws IOException {
        // read all of the ping payload
        byte[] pingPayload = consumePayload();
        outputPeer.writePong(pingPayload);
    }

    /**
     * Handle an incoming Pong control frame. This method simply consumes
     * the payload (if any) and disregards the frame.
     * @throws IOException if anything goes wrong with the underlying stream
     */
    private void handlePongFrame() throws IOException {
        // read all of the pong payload
        consumePayload();
    }

    /**
     * Consume the entire payload of the frame. Note that the state of the
     * field <code>payloadLength</code> is used (and altered) in this utility
     * method.
     * @return byte[] containing the bytes of the frame payload
     * @throws IOException if anything goes wrong with the underlying stream
     */
    private byte[] consumePayload() throws IOException {
        byte[] payload = new byte[(int) payloadLength];
        int count = 0;
        while (payloadLength > 0L) {
            payload[count] = (byte) this.read();
            count++;
        }
        return payload;
    }

    /**
     * Flag: Has the WebSocket connection received a CLOSE frame?
     */
    private boolean closeReceived = false;

    /**
     * Flag: Has the WebSocket connection failed for any reason?
     */
    private boolean failed = false;

    /**
     * Flag: Is the WebSocket handshake complete?
     */
    private boolean handshakeComplete = false;

    /**
     * InputStream to be decorated as a WebSocket-speaking InputStream.
     */
    private InputStream inputStream = null;

    /**
     * Bytes of the latest masking key provided by the client.
     */
    private final int[] maskingBytes = new int[NUM_MASKING_BYTES];

    /**
     * Index of the next maskingByte to be used on payload data.
     */
    private int maskingIndex = 0;

    /**
     * The companion OutputStream for this WebSocketInputStream.
     */
    private WebSocketServerOutputStream outputPeer = null;

    /**
     * Number of payload bytes that we still expecting before the next
     * WebSocket frame.
     */
    private long payloadLength = 0L;
}
