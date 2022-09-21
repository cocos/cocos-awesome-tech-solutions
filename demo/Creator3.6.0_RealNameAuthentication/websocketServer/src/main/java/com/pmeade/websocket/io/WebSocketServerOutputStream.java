/*
 * WebSocketServerOutputStream.java
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

import java.io.IOException;
import java.io.OutputStream;

import static com.google.common.base.Preconditions.checkNotNull;


import com.alibaba.fastjson.JSON;


import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import demo.NppaUtils;

/**
 * WebSocketServerOutputStream decorates an OutputStream to handle WebSocket
 * frames as specified in RFC 6455.
 * @author pmeade
 */
public class WebSocketServerOutputStream extends OutputStream {

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
     * Binary mask to remove all but the bits of octet 3. We also remove the
     * sign bit (0x80000000) if any, to prevent it from being shifted down.
     */
    public static final int MASK_HIGH_WORD_HIGH_BYTE_NO_SIGN = 0x7f000000;

    /**
     * Binary mask to remove all but the bits of octet 2.
     */
    public static final int MASK_HIGH_WORD_LOW_BYTE = 0x00ff0000;

    /**
     * Binary mask to remove all but the bits of octet 1.
     */
    public static final int MASK_LOW_WORD_HIGH_BYTE = 0x0000ff00;

    /**
     * Binary mask to remove all but the lowest 8 bits (octet 0).
     */
    public static final int MASK_LOW_WORD_LOW_BYTE = 0x000000ff;

    /**
     * Number of bits required to shift octet 1 into the lowest 8 bits.
     */
    public static final int OCTET_ONE = 8;

    /**
     * Number of bits required to shift octet 2 into the lowest 8 bits.
     */
    public static final int OCTET_TWO = 16;

    /**
     * Number of bits required to shift octet 3 into the lowest 8 bits.
     */
    public static final int OCTET_THREE = 24;

    /**
     * WebSocket defined opcode for a Binary frame. Includes high bit (0x80)
     * to indicate that the frame is the final/complete frame.
     */
    public static final int OPCODE_FRAME_BINARY = 0x82;

    /**
     * WebSocket defined opcode for a Close frame. Includes high bit (0x80)
     * to indicate that the frame is the final/complete frame.
     */
    public static final int OPCODE_FRAME_CLOSE = 0x88;

    /**
     * WebSocket defined opcode for a Pong frame. Includes high bit (0x80)
     * to indicate that the frame is the final/complete frame.
     */
    public static final int OPCODE_FRAME_PONG = 0x8A;

    /**
     * WebSocket defined opcode for a Text frame. Includes high bit (0x80)
     * to indicate that the frame is the final/complete frame.
     */
    public static final int OPCODE_FRAME_TEXT = 0x81;

    /**
     * Create a WebSocket-speaking OutputStream from the provided OutputStream.
     * @param os OutputStream to be decorated as a WebSocketServerOutputStream
     */
    public WebSocketServerOutputStream(final OutputStream os) {
        checkNotNull(os);
        this.outputStream = os;
    }

    /**
     * Writes the specified byte to this output stream. The general contract
     * for write is that one byte is written to the output stream. The byte to
     * be written is the eight low-order bits of the argument b. The 24
     * high-order bits of b are ignored.
     * <p>Subclasses of OutputStream must provide an implementation for this
     * method.
     * @param b the byte.
     * @throws IOException if an I/O error occurs. In particular, an
     *                     IOException may be thrown if the output stream has
     *                     been closed.
     */
    @Override
    public final void write(final int b) throws IOException {
        if (handshakeComplete) {
            byte[] ba = new byte[] {(byte) b };
            writeBinary(ba);
        } else {
            outputStream.write(b);
        }
    }

    /**
     * Writes len bytes from the specified byte array starting at offset off to
     * this output stream. The general contract for write(b, off, len) is that
     * some of the bytes in the array b are written to the output stream in
     * order; element b[off] is the first byte written and b[off+len-1] is the
     * last byte written by this operation.
     * <p>The write method of OutputStream calls the write method of one
     * argument on each of the bytes to be written out. Subclasses are
     * encouraged to override this method and provide a more efficient
     * implementation.
     * <p>If b is null, a NullPointerException is thrown.
     * <p>If off is negative, or len is negative, or off+len is greater than
     * the length of the array b, then an IndexOutOfBoundsException is thrown.
     * @param b the data.
     * @param off the start offset in the data.
     * @param len the number of bytes to write.
     * @throws IOException if an I/O error occurs. In particular, an
     *                     IOException is thrown if the output stream is
     *                     closed.
     */
    @Override
    public final void write(final byte[] b, final int off, final int len)
            throws IOException {
        if (handshakeComplete) {
            byte[] dst = new byte[len];
            System.arraycopy(b, off, dst, 0, len);
            writeBinary(dst);
        } else {
            super.write(b, off, len);
        }
    }

    /**
     * Writes b.length bytes from the specified byte array to this output
     * stream. The general contract for write(b) is that it should have
     * exactly the same effect as the call write(b, 0, b.length).
     * @param b the data.
     * @throws IOException if an I/O error occurs.
     */
    @Override
    public final void write(final byte[] b) throws IOException {
        if (handshakeComplete) {
            writeBinary(b);
        } else {
            super.write(b);
        }
    }

    /**
     * Determine if a Close control frame has been sent over the WebSocket.
     * @return true, iff a Close control frame has been sent,
     *         otherwise fasle
     */
    public final boolean isCloseSent() {
        return closeSent;
    }

    /**
     * Determine if the WebSocket handshake has completed successfully.
     * @return true, if the WebSocket handshake has completed successfully,
     *         otherwise false
     */
    public final boolean isHandshakeComplete() {
        return handshakeComplete;
    }

    /**
     * Tell this WebSocketServerOutputStream if the WebSocket handshake
     * has completed successfully.
     * @param complete true, if the WebSocket handshake has completed
     *                 successfully, otherwise false
     */
    public final void setHandshakeComplete(final boolean complete) {
        this.handshakeComplete = complete;
    }

    /**
     * Write the provided binary data to the WebSocket.
     * @param bytes byte array containing the binary data to be writen
     * @throws IOException if an I/O error occurs
     */
    public final void writeBinary(final byte[] bytes) throws IOException {
        int binLength = bytes.length;
        outputStream.write(OPCODE_FRAME_BINARY); // final binary-frame
        if (binLength < LENGTH_16_MIN) {
            outputStream.write(binLength); // small payload length
        } else if (binLength < LENGTH_64_MIN) {
            outputStream.write(LENGTH_16); // medium payload flag
            outputStream.write(
                (binLength & MASK_LOW_WORD_HIGH_BYTE) >> OCTET_ONE);
            outputStream.write(binLength & MASK_LOW_WORD_LOW_BYTE);
        } else {
            outputStream.write(LENGTH_64); // large payload flag
            outputStream.write(0x00); // upper bytes
            outputStream.write(0x00); // upper bytes
            outputStream.write(0x00); // upper bytes
            outputStream.write(0x00); // upper bytes
            outputStream.write(
                (binLength & MASK_HIGH_WORD_HIGH_BYTE_NO_SIGN) >> OCTET_THREE);
            outputStream.write(
                (binLength & MASK_HIGH_WORD_LOW_BYTE) >> OCTET_TWO);
            outputStream.write(
                (binLength & MASK_LOW_WORD_HIGH_BYTE) >> OCTET_ONE);
            outputStream.write(binLength & MASK_LOW_WORD_LOW_BYTE);
        }
        outputStream.write(bytes); // binary payload
    }

    /**
     * Write a Close control frame to the WebSocket.
     * @throws IOException if an I/O error occurs
     */
    public final void writeClose() throws IOException {
        if (!closeSent) {
            closeSent = true;
            outputStream.write(new byte[] {
                (byte) OPCODE_FRAME_CLOSE, (byte) 0x00
            });
        }
    }

    /**
     * Write a Close control frame to the WebSocket.
     * @param statusCode status code indicating the reason for the closure
     *                   of the WebSocket; constants defined in RFC 6455
     * @throws IOException if an I/O error occurs
     */
    public final void writeClose(final int statusCode) throws IOException {
        if (!closeSent) {
            closeSent = true;
            outputStream.write(new byte[] {
                (byte) OPCODE_FRAME_CLOSE, (byte) 0x02,
                (byte) ((statusCode & MASK_LOW_WORD_HIGH_BYTE) >> OCTET_ONE),
                (byte) (statusCode & MASK_LOW_WORD_LOW_BYTE)
            });
        }
    }

    /**
     * Write a Pong control frame to the WebSocket. Uses the provided data
     * as the payload data of the control frame.
     * @param pongPayload byte array containing payload data for the pong frame
     * @throws IOException if an I/O error occurs
     */
    public final void writePong(final byte[] pongPayload) throws IOException {
        outputStream.write(new byte[] {
            (byte) OPCODE_FRAME_PONG, (byte) (pongPayload.length)
        });
        outputStream.write(pongPayload);
    }

    /**
     * Write the provided String to the WebSocket in UTF-8 format.
     * @param str String to be written to the WebSocket
     * @throws IOException if an I/O error occurs
     */
    NppaUtils nu = new NppaUtils();

    public final void writeString(int str) throws IOException {
        String result = "";
        nu.params += (char)str +"";

        if (str == 125) {
//            System.out.println("str.str=== ");
            String str2= new String(nu.params.getBytes("ISO-8859-1"),"UTF-8");
            HashMap hashMap = JSON.parseObject(str2, HashMap.class);
            String idCard = (String)hashMap.get("idCard");
            String name = (String)hashMap.get("name");
            String playId = (String)hashMap.get("playId");
            String eventType =  (String)hashMap.get("eventType");

            if (eventType.equals(nu.EVENT_LOGIN)) {
                //check
                nu.Login();

                Map<String, String> map = new HashMap<>();
                map.put("errcode", "test");
                map.put("errmsg", "login success, please authenticate your real name.");
                result = JSON.toJSONString(map);
                // System.out.println("check: "+result);

            } else if (eventType.equals(nu.EVENT_CHECK)) {
                //check
                result = nu.getCheckResult(playId, idCard, name);

                if (nu.LoginFlag.equals(false)) {
                    Map<String, String> map = new HashMap<>();
                    map.put("errcode", "test");
                    map.put("errmsg", "no login");
                    result = JSON.toJSONString(map);
                }
                // System.out.println("check: "+result);

            } else if (eventType.equals(nu.EVENT_QUERY)) {
                // query
                result = nu.getQueryResult(playId, idCard, name);
                // System.out.println("query: "+result);

                if (nu.LoginFlag.equals(false)) {
                    Map<String, String> map = new HashMap<>();
                    map.put("errcode", "test");
                    map.put("errmsg", "no login");
                    result = JSON.toJSONString(map);
                }
            } else if (eventType.equals(nu.EVENT_DATAUPLOADING)) {
                // data uploading
                result = nu.getDataUploadingResult(playId, idCard, name);

                if (nu.LoginFlag.equals(false)) {
                    Map<String, String> map = new HashMap<>();
                    map.put("errcode", "test");
                    map.put("errmsg", "no login");
                    result = JSON.toJSONString(map);
                }
            }

            System.out.println("result: "+result);
            byte[] utfBytes = result.getBytes(StandardCharsets.UTF_8);
            int utfLength = utfBytes.length;
            outputStream.write(OPCODE_FRAME_TEXT); // final text-frame
            if (utfLength < LENGTH_16_MIN) {
                outputStream.write(utfLength); // small payload length
            } else if (utfLength < LENGTH_64_MIN) {
                outputStream.write(LENGTH_16); // medium payload flag
                outputStream.write(
                        (utfLength & MASK_LOW_WORD_HIGH_BYTE) >> OCTET_ONE);
                outputStream.write(utfLength & MASK_LOW_WORD_LOW_BYTE);
            } else {
                outputStream.write(LENGTH_64); // large payload flag
                outputStream.write(0x00); // upper bytes
                outputStream.write(0x00); // upper bytes
                outputStream.write(0x00); // upper bytes
                outputStream.write(0x00); // upper bytes
                outputStream.write(
                        (utfLength & MASK_HIGH_WORD_HIGH_BYTE_NO_SIGN) >> OCTET_THREE);
                outputStream.write(
                        (utfLength & MASK_HIGH_WORD_LOW_BYTE) >> OCTET_TWO);
                outputStream.write(
                        (utfLength & MASK_LOW_WORD_HIGH_BYTE) >> OCTET_ONE);
                outputStream.write(utfLength & MASK_LOW_WORD_LOW_BYTE);
            }
            outputStream.write(utfBytes);
            nu.params = "";
        }
    }

    /**
     * Flag: Has the WebSocket connection sent a CLOSE frame?
     */
    private boolean closeSent = false;

    /**
     * Flag: Is the WebSocket handshake complete?
     */
    private boolean handshakeComplete = false;

    /**
     * OutputStream to be decorated as a WebSocket-speaking OutputStream.
     */
    private final OutputStream outputStream;
}
