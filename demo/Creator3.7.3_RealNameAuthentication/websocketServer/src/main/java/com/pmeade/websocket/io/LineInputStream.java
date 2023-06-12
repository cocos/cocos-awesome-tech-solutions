/*
 * LineInputStream.java
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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * LineInputStream decorates an InputStream for line-by-line reading.
 * It implements a <code>readLine()</code> method, similar to
 * <code>BufferedReader</code>, but does not need an intermediate
 * <code>InputStreamReader</code> to translate.
 *
 * <p>The reason we avoid an <code>InputStreamReader</code> is that it
 * will consume as much of the input as it possibly can in order
 * to optimize character encoding from the input bytes.
 *
 * <p>In our case, the input will be switching protocols from an HTTP
 * Request to WebSocket frames. We want to consume the HTTP Request
 * line by line and process it for a WebSocket handshake, but the
 * data following that must be handled in a completely different way.
 *
 * <p>The ability to handle the data line-by-line like
 * <code>BufferedReader</code> is able to do, is very useful for
 * parsing the HTTP Reqeust. Therefore we have ListInputStream to
 * provide this functionality as an InputStream decorator.
 *
 * <p>Unlike <code>BufferedReader</code>, which handles three kinds of
 * line endings (CR, LF, CRLF), the HTTP protocol has defined the line
 * ending to be CRLF. Therefore, the <code>readLine()</code> method of
 * this decorator requires a CRLF (or EOF) sequence to terminate a line.
 *
 * @author blinkdog
 */
public class LineInputStream extends InputStream {
    /**
     * Constant defining Carriage Return (CR). Octet 13, Hex 0x0c.
     */
    public static final int CR = 13;

    /**
     * Constant defining the end of the stream (EOF). This is derived
     * from the InputStream API. Calls to <code>read()</code> return -1
     * when the end of the stream is reached.
     */
    public static final int EOF = -1;

    /**
     * Constant defining Line Feed (LF). Octet 10, Hex 0x0a
     */
    public static final int LF = 10;

    /**
     * Constant defining the canonical name of the UTF-8 character encoding.
     */
    public static final String UTF_8 = StandardCharsets.UTF_8.name();

    /**
     * Construct a LineInputStream to decorate the provided InputStream.
     * A <code>NullPointerException</code> will be thrown if the provided
     * InputStream is null.
     * @param in InputStream to be decorated by this LineInputStream
     */
    public LineInputStream(final InputStream in) {
        checkNotNull(in);
        this.inputStream = in;
    }

    /**
     * {@inheritDoc}
     * @return the next byte of data, or <code>-1</code> if the end of the
     *         stream is reached.
     * @throws IOException if an I/O error occurs
     */
    @Override
    public final int read() throws IOException {
        return inputStream.read();
    }

    /**
     * Reads a line of text. A line is considered to be terminated by a
     * carriage return ('\r') followed immediately by a linefeed ('\n').
     * This is per the HTTP specification.
     * @return String containing the contents of the line, not including
     *         any line-termination characters, or null if the end of the
     *         stream has been reached
     * @throws IOException if an I/O error occurs
     */
    public final String readLine() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        boolean inputTaken = false;
        while (true) {
            int data = inputStream.read();
            // if this is the end of the stream
            if (data == EOF) {
                // if we've taken some input already
                if (inputTaken) {
                    // return that input
                    return baos.toString(UTF_8);
                } else {
                    // otherwise return null
                    return null;
                }
            // otherwise, if this is a CR
            } else if (data == CR) {
                // it may be the end of a line
                lastWasCarriageReturn = true;
            // otherwise, if this is a LF
            } else if (data == LF) {
                // if we did follow a CR
                if (lastWasCarriageReturn) {
                    // then this is the end of a line
                    lastWasCarriageReturn = false;
                    return baos.toString(UTF_8);
                } else {
                    inputTaken = true;
                    lastWasCarriageReturn = false;
                    baos.write(LF);
                }
            // otherwise...
            } else {
                // if the last thing was a carriage return
                if (lastWasCarriageReturn) {
                    // write that CR to our line
                    baos.write(CR);
                }
                // add the data we just read to the line
                inputTaken = true;
                lastWasCarriageReturn = false;
                baos.write(data);
            }
        }
    }

    /**
     * InputStream to be decorated by this LineInputStream. This reference
     * is provided at construction time.
     */
    private final InputStream inputStream;

    /**
     * Flag: Is the last character we processed a Carriage Return (Octet 13)?
     *       true: Yes, the last character was a CR
     *       false: No, the last character was not a CR
     */
    private boolean lastWasCarriageReturn = false;
}
