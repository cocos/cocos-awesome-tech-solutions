/*
 * WebSocketServerOutputStreamTest.java
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
import java.io.OutputStream;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 * @author pmeade
 */
public class WebSocketServerOutputStreamTest
{
    public WebSocketServerOutputStreamTest() {
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
    public void testExtendsOutputStream() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wsos = new WebSocketServerOutputStream(baos);
        assertTrue(wsos instanceof OutputStream);
    }
    
    @Test
    public void testRequiresDecorableOutputStream() {
        try {
            WebSocketServerOutputStream webSocketOutputStream = new WebSocketServerOutputStream(null);
            fail();
        } catch(NullPointerException e) {
            // expected
        }
    }
    
    @Test
    public void testSetHandshakeComplete() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
    }
    
    @Test
    public void testWriteArrayTransparentBeforeHandshake() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.write(new byte[] { 0x01, 0x02, 0x03, 0x04, 0x05 });
        byte[] result = baos.toByteArray();
        assertEquals(0x01, result[0]);
        assertEquals(0x02, result[1]);
        assertEquals(0x03, result[2]);
        assertEquals(0x04, result[3]);
        assertEquals(0x05, result[4]);
    }
    
    @Test
    public void testWriteArrayNotTransparentAfterHandshake() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        wssos.write(new byte[] { 0x01, 0x02, 0x03, 0x04, 0x05 });
        byte[] result = baos.toByteArray();
        assertEquals((byte)0x82, result[0]);
        assertEquals(0x05, result[1]);
        assertEquals(0x01, result[2]);
        assertEquals(0x02, result[3]);
        assertEquals(0x03, result[4]);
        assertEquals(0x04, result[5]);
        assertEquals(0x05, result[6]);
    }
    
    @Test
    public void testWriteByteTransparentBeforeHandshake() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.write(0x05);
        byte[] result = baos.toByteArray();
        assertEquals(0x05, result[0]);
    }
    
    @Test
    public void testWriteByteNotTransparentAfterHandshake() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        wssos.write(0x05);
        byte[] result = baos.toByteArray();
        assertEquals((byte)0x82, result[0]);
        assertEquals(0x01, result[1]);
        assertEquals(0x05, result[2]);
    }

    @Test
    public void testWriteArrayOffsetTransparentBeforeHandshake() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        final byte[] DATA = new byte[] {
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
            0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f
        };
        wssos.write(DATA, 2, 4);
        byte[] result = baos.toByteArray();
        assertEquals(0x02, result[0]);
        assertEquals(0x03, result[1]);
        assertEquals(0x04, result[2]);
        assertEquals(0x05, result[3]);
    }
    
    @Test
    public void testWriteArrayOffsetNotTransparentAfterHandshake() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        final byte[] DATA = new byte[] {
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
            0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f
        };
        wssos.write(DATA, 2, 4);
        byte[] result = baos.toByteArray();
        assertEquals((byte)0x82, result[0]);
        assertEquals(0x04, result[1]);
        assertEquals(0x02, result[2]);
        assertEquals(0x03, result[3]);
        assertEquals(0x04, result[4]);
        assertEquals(0x05, result[5]);
    }
    
    @Test
    public void testWriteCloseTwiceOutputsOneFrame() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        wssos.writeClose();
        wssos.writeClose();
        byte[] result = baos.toByteArray();
        assertEquals(2, result.length);
        assertEquals((byte)0x88, result[0]);
        assertEquals(0x00, result[1]);
    }

    @Test
    public void testWriteCloseStatusCodeTwiceOutputsOneFrame() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        wssos.writeClose(0x1000);
        wssos.writeClose(0x1000);
        byte[] result = baos.toByteArray();
        assertEquals(4, result.length);
        assertEquals((byte)0x88, result[0]);
        assertEquals(0x02, result[1]);
        assertEquals(0x10, result[2]);
        assertEquals(0x00, result[3]);
    }
    
    @Test
    public void testWriteStringSmallPayload() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        wssos.writeString("\u00a9");
        byte[] result = baos.toByteArray();
        assertEquals(4, result.length);
        assertEquals((byte)0x81, result[0]);
        assertEquals(0x02, result[1]);
        assertEquals((byte)0xc2, result[2]);
        assertEquals((byte)0xa9, result[3]);
    }

    @Test
    public void testWriteStringMediumPayload() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        StringBuilder sb = new StringBuilder();
        for(int i=0; i<0x100; i++) {
            sb.append("\u00a9");
        }
        wssos.writeString(sb.toString());
        byte[] result = baos.toByteArray();
        assertEquals(516, result.length);
        assertEquals((byte)0x81, result[0]);
        assertEquals((byte)WebSocketServerOutputStream.LENGTH_16, result[1]);
        assertEquals((byte)0x02, result[2]);
        assertEquals((byte)0x00, result[3]);
        assertEquals((byte)0xc2, result[4]);
        assertEquals((byte)0xa9, result[5]);
        assertEquals((byte)0xc2, result[6]);
        assertEquals((byte)0xa9, result[7]);
    }

    @Test
    public void testWriteStringLargePayload() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        StringBuilder sb = new StringBuilder();
        for(int i=0; i<0x10000; i++) {
            sb.append("\u00a9");
        }
        wssos.writeString(sb.toString());
        byte[] result = baos.toByteArray();
        assertEquals(0x20000 + 10, result.length);
        assertEquals((byte)0x81, result[0]);
        assertEquals((byte)WebSocketServerOutputStream.LENGTH_64, result[1]);
        assertEquals((byte)0x00, result[2]);
        assertEquals((byte)0x00, result[3]);
        assertEquals((byte)0x00, result[4]);
        assertEquals((byte)0x00, result[5]);
        assertEquals((byte)0x00, result[6]);
        assertEquals((byte)0x02, result[7]);
        assertEquals((byte)0x00, result[8]);
        assertEquals((byte)0x00, result[9]);
        assertEquals((byte)0xc2, result[10]);
        assertEquals((byte)0xa9, result[11]);
        assertEquals((byte)0xc2, result[12]);
        assertEquals((byte)0xa9, result[13]);
        assertEquals((byte)0xc2, result[14]);
        assertEquals((byte)0xa9, result[15]);
    }

    @Test
    public void testWriteBinaryMediumPayload() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        byte[] DATA = new byte[0x200];
        for(int i=0; i<0x200; i++) {
            DATA[i] = (byte)(i & 0xff);
        }
        wssos.write(DATA);
        byte[] result = baos.toByteArray();
        assertEquals(0x200 + 4, result.length);
        assertEquals((byte)0x82, result[0]);
        assertEquals((byte)WebSocketServerOutputStream.LENGTH_16, result[1]);
        assertEquals((byte)0x02, result[2]);
        assertEquals((byte)0x00, result[3]);
        assertEquals((byte)0x00, result[4]);
        assertEquals((byte)0x01, result[5]);
        assertEquals((byte)0x02, result[6]);
        assertEquals((byte)0x03, result[7]);
    }
    
    @Test
    public void testWriteBinaryLargePayload() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        WebSocketServerOutputStream wssos = new WebSocketServerOutputStream(baos);
        assertFalse(wssos.isHandshakeComplete());
        wssos.setHandshakeComplete(true);
        assertTrue(wssos.isHandshakeComplete());
        byte[] DATA = new byte[0x20000];
        for(int i=0; i<0x20000; i++) {
            DATA[i] = (byte)(i & 0xff);
        }
        wssos.write(DATA);
        byte[] result = baos.toByteArray();
        assertEquals(0x20000 + 10, result.length);
        assertEquals((byte)0x82, result[0]);
        assertEquals((byte)WebSocketServerOutputStream.LENGTH_64, result[1]);
        assertEquals((byte)0x00, result[2]);
        assertEquals((byte)0x00, result[3]);
        assertEquals((byte)0x00, result[4]);
        assertEquals((byte)0x00, result[5]);
        assertEquals((byte)0x00, result[6]);
        assertEquals((byte)0x02, result[7]);
        assertEquals((byte)0x00, result[8]);
        assertEquals((byte)0x00, result[9]);
        assertEquals((byte)0x00, result[10]);
        assertEquals((byte)0x01, result[11]);
        assertEquals((byte)0x02, result[12]);
        assertEquals((byte)0x03, result[13]);
        assertEquals((byte)0x04, result[14]);
        assertEquals((byte)0x05, result[15]);
    }
}
