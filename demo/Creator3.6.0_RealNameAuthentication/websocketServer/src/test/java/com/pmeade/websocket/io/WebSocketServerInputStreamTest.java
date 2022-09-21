/*
 * WebSocketServerInputStreamTest.java
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

import com.google.common.base.Joiner;
import com.google.common.io.ByteSource;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Arrays;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * @author pmeade
 */
public class WebSocketServerInputStreamTest
{
    private static final String CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
        "GET / HTTP/1.1",
        "Host: localhost:8080",
        "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language: en-US,en;q=0.5",
        "Accept-Encoding: gzip, deflate",
        "Sec-WebSocket-Version: 13",
        "Origin: null",
        "Sec-WebSocket-Key: V76L7ym8nB/U/K96iWDjKg==",
        "Connection: keep-alive, Upgrade",
        "Pragma: no-cache",
        "Cache-Control: no-cache",
        "Upgrade: websocket",
        ""
    ))) + "\r\n";
    
    public WebSocketServerInputStreamTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    @Test
    public void testAlwaysSucceed() {
        assertTrue(true);
    }
    
    @Test
    public void testImplementsInputStream() {
        ByteArrayInputStream bais = new ByteArrayInputStream("".getBytes());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais);
        assertTrue(wsis instanceof InputStream);
    }
    
    @Test
    public void testRequiresDecorableInputStream() {
        try {
            WebSocketServerInputStream webSocketInputStream = new WebSocketServerInputStream(null);
            fail();
        } catch(NullPointerException e) {
            // expected
        }
    }
    
    @Test
    public void testGetOutputPeer() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        ByteArrayInputStream bais = new ByteArrayInputStream("".getBytes());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais);

        wsis.setOutputPeer(wsos);
        assertEquals(wsos, wsis.getOutputPeer());
    }
    
    @Test
    public void testConstructWithOutputPeer() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);
        
        ByteArrayInputStream bais = new ByteArrayInputStream("".getBytes());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertEquals(wsos, wsis.getOutputPeer());
    }

    @Test
    public void testHandshake() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals('H', wsis.read());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
        assertEquals('e', wsis.read());
        assertEquals('l', wsis.read());
        assertEquals('l', wsis.read());
        assertEquals('o', wsis.read());
    }
    
    @Test
    public void testReserved1Fail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: RSV1 bit is set
                (byte)0xC1, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testReserved2Fail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: RSV2 bit is set
                (byte)0xA1, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testReserved3Fail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: RSV3 bit is set
                (byte)0x91, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcode3Fail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode 3 is used
                (byte)0x83, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcode4Fail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode 4 is used
                (byte)0x84, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcode5Fail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode 5 is used
                (byte)0x85, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcode6Fail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode 6 is used
                (byte)0x86, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcode7Fail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode 7 is used
                (byte)0x87, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodeBFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode B is used
                (byte)0x8B, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodeCFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode C is used
                (byte)0x8C, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodeDFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode D is used
                (byte)0x8D, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodeEFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode E is used
                (byte)0x8E, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodeFFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode F is used
                (byte)0x8F, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testUnmaskedFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Client frame MASK bit is clear
                (byte)0x81, (byte)0x05, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testTinyPayloadIn16BitsFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Payload length of 5 encoded incorrectly
                (byte)0x81, (byte)0xFE, (byte)0x00, (byte)0x05,
                (byte)0x37, (byte)0xfa, (byte)0x21, (byte)0x3d,
                (byte)0x7f, (byte)0x9f, (byte)0x4d, (byte)0x51,
                (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testTinyPayloadIn64BitsFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Payload length of 5 encoded incorrectly
                (byte)0x81, (byte)0xFF,
                (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00,
                (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x05,
                (byte)0x37, (byte)0xfa, (byte)0x21, (byte)0x3d,
                (byte)0x7f, (byte)0x9f, (byte)0x4d, (byte)0x51,
                (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testMediumPayloadIn64BitsFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Payload length of 65244 encoded incorrectly
                (byte)0x81, (byte)0xFF,
                (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00,
                (byte)0x00, (byte)0x00, (byte)0xFE, (byte)0xDC,
                (byte)0x37, (byte)0xfa, (byte)0x21, (byte)0x3d,
                (byte)0x7f, (byte)0x9f, (byte)0x4d, (byte)0x51,
                (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodeCloseFragmentedFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // Error: Control Frame (CLOSE) is marked fragmented
                (byte)0x08, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodePingFragmentedFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // Error: Control Frame (PING) is marked fragmented
                (byte)0x0A, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodePongFragmentedFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // Error: Control Frame (PONG) is marked fragmented
                (byte)0x0B, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testControlOpcode16BitPayloadFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // Error: Control opcode (PING) with 16-bit payload
                (byte)0x89, (byte)0xFE, (byte)0x00, (byte)0xFF,
                (byte)0x37, (byte)0xfa, (byte)0x21, (byte)0x3d,
                (byte)0x7f, (byte)0x9f, (byte)0x4d, (byte)0x51,
                (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testControlOpcode64BitPayloadFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // Error: Control opcode (PING) with 64-bit payload
                (byte)0x89, (byte)0xFF,
                (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00,
                (byte)0x00, (byte)0x54, (byte)0x32, (byte)0x10,
                (byte)0x37, (byte)0xfa, (byte)0x21, (byte)0x3d,
                (byte)0x7f, (byte)0x9f, (byte)0x4d, (byte)0x51,
                (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testOpcodeClose() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // control: close
                (byte)0x88, (byte)0x82, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x27, (byte)0xfa
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testOpcodePing() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // control: ping
                (byte)0x89, (byte)0x82, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x27, (byte)0xfa,
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals('H', wsis.read());
        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testOpcodePong() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // control: pong
                (byte)0x8A, (byte)0x82, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x27, (byte)0xfa,
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals('H', wsis.read());
        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testReadAfterCloseEOF() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // control: close
                (byte)0x88, (byte)0x82, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x27, (byte)0xfa
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertEquals(-1, wsis.read());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testReadAfterFailEOF() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                // Error: Reserved Opcode 3 is used
                (byte)0x83, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertEquals(-1, wsis.read());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testLargePayloadNoFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0xFF,
                (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00,
                (byte)0x00, (byte)0x01, (byte)0x23, (byte)0x45,
                (byte)0x37, (byte)0xfa, (byte)0x21, (byte)0x3d,
                (byte)0x7f, (byte)0x9f, (byte)0x4d, (byte)0x51,
                (byte)0x58 // ...
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals('H', wsis.read());
        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testMediumPayloadNoFail() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0xFE, (byte)0x7f, (byte)0xed,
                (byte)0x37, (byte)0xfa, (byte)0x21, (byte)0x3d,
                (byte)0x7f, (byte)0x9f, (byte)0x4d, (byte)0x51,
                (byte)0x58 // ...
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals('H', wsis.read());
        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testMissingHttpVersion() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / XTTP/5.3",
            "Host: localhost:8080",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Sec-WebSocket-Version: 13",
            "Origin: null",
            "Sec-WebSocket-Key: V76L7ym8nB/U/K96iWDjKg==",
            "Connection: keep-alive, Upgrade",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "Upgrade: websocket",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testMissingHostHeaderHandshake() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / HTTP/1.1",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Sec-WebSocket-Version: 13",
            "Origin: null",
            "Sec-WebSocket-Key: V76L7ym8nB/U/K96iWDjKg==",
            "Connection: keep-alive, Upgrade",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "Upgrade: websocket",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }

    @Test
    public void testMissingUpgradeHeaderHandshake() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / HTTP/1.1",
            "Host: localhost:8080",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Sec-WebSocket-Version: 13",
            "Origin: null",
            "Sec-WebSocket-Key: V76L7ym8nB/U/K96iWDjKg==",
            "Connection: keep-alive, Upgrade",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }

    @Test
    public void testMissingConnectionHeaderHandshake() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / HTTP/1.1",
            "Host: localhost:8080",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Sec-WebSocket-Version: 13",
            "Origin: null",
            "Sec-WebSocket-Key: V76L7ym8nB/U/K96iWDjKg==",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "Upgrade: websocket",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }

    @Test
    public void testMissingSecWebSocketKeyHeaderHandshake() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / HTTP/1.1",
            "Host: localhost:8080",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Sec-WebSocket-Version: 13",
            "Origin: null",
            "Connection: keep-alive, Upgrade",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "Upgrade: websocket",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }

    @Test
    public void testMissingSecWebSocketVersionHeaderHandshake() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / HTTP/1.1",
            "Host: localhost:8080",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Origin: null",
            "Sec-WebSocket-Key: V76L7ym8nB/U/K96iWDjKg==",
            "Connection: keep-alive, Upgrade",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "Upgrade: websocket",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }

    @Test
    public void testMissingSecWebSocketKeyHeaderTooShortHandshake() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / HTTP/1.1",
            "Host: localhost:8080",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Sec-WebSocket-Version: 13",
            "Origin: null",
            "Sec-WebSocket-Key: ZHlMGtPVRy8=",
            "Connection: keep-alive, Upgrade",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "Upgrade: websocket",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testMissingSecWebSocketKeyHeaderTooLongHandshake() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / HTTP/1.1",
            "Host: localhost:8080",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Sec-WebSocket-Version: 13",
            "Origin: null",
            "Sec-WebSocket-Key: fRRoI5iC739Wv0VGuOREaMLyXCRv6+AJ+JS5ZgalJoA=",
            "Connection: keep-alive, Upgrade",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "Upgrade: websocket",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testEmptyHostHeaderHandshake() throws Exception {
        final String BROKEN_CLIENT_HANDSHAKE = (Joiner.on("\r\n").join(Arrays.asList(
            "GET / HTTP/1.1",
            "Host: ",
            "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
            "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language: en-US,en;q=0.5",
            "Accept-Encoding: gzip, deflate",
            "Sec-WebSocket-Version: 13",
            "Origin: null",
            "Sec-WebSocket-Key: V76L7ym8nB/U/K96iWDjKg==",
            "Connection: keep-alive, Upgrade",
            "Pragma: no-cache",
            "Cache-Control: no-cache",
            "Upgrade: websocket",
            ""
        ))) + "\r\n";
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(BROKEN_CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }

    @Test
    public void testEmptyHandshake() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        ByteArrayInputStream bais = new ByteArrayInputStream(new byte[0]);
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testHandleCloseFrameAfterCloseSent() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // control: close
                (byte)0x88, (byte)0x82, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x27, (byte)0xfa
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        // send the close frame in advance
        wsos.writeClose(0x1000);
        
        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
    
    @Test
    public void testHandleCloseFrameWithoutPayload() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // control: close
                (byte)0x88, (byte)0x80, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);
        
        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals(-1, wsis.read());
        assertTrue(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }

    @Test
    public void testHandlePingFrameAfterCloseSent() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);

        final ByteSource handshakeHello = ByteSource.concat(
            ByteSource.wrap(CLIENT_HANDSHAKE.getBytes()),
            ByteSource.wrap(new byte[] {
                // control: ping
                (byte)0x89, (byte)0x82, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x27, (byte)0xfa,
                // masked text frame "Hello"
                (byte)0x81, (byte)0x85, (byte)0x37, (byte)0xfa,
                (byte)0x21, (byte)0x3d, (byte)0x7f, (byte)0x9f,
                (byte)0x4d, (byte)0x51, (byte)0x58
            }));

        ByteArrayInputStream bais = new ByteArrayInputStream(handshakeHello.read());
        WebSocketServerInputStream wsis = new WebSocketServerInputStream(bais, wsos);

        // send the close frame in advance
        wsos.writeClose(0x1000);
        
        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertFalse(wsis.isHandshakeComplete());
        assertEquals('H', wsis.read());
        assertFalse(wsis.isClosed());
        assertFalse(wsis.isFailed());
        assertTrue(wsis.isHandshakeComplete());
    }
}
