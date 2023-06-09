/*
 * WebSocketTest.java
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
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketAddress;
import java.nio.channels.SocketChannel;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

/**
 * @author veloxi
 */
public class WebSocketTest
{
    private Socket mockS;
    private ServerSocket mockSS;
    private Socket ws;
    private WebSocketServerSocket wsss;
    
    public WebSocketTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() throws Exception {
        mockS = mock(Socket.class);
        mockSS = mock(ServerSocket.class);
        when(mockSS.accept()).thenReturn(mockS);
        wsss = new WebSocketServerSocket(mockSS);
        ws = wsss.accept();
    }
    
    @After
    public void tearDown() throws Exception {
        verify(mockSS, times(1)).accept();
    }

    @Test
    public void testAlwaysSucceed() {
        assertTrue(true);
        verifyZeroInteractions(mockS);
    }
    
    @Test
    public void testExtendsSocket() {
        Socket s = new Socket();
        WebSocket webSocket = new WebSocket(s);
        assertTrue(webSocket instanceof Socket);
        verifyZeroInteractions(mockS);
    }
    
    @Test
    public void testAcceptReturnsWebSocket() throws Exception {
        assertTrue(ws instanceof WebSocket);
        verifyZeroInteractions(mockS);
    }
    
    @Test
    public void testConnectDelegatesToSocket() throws Exception {
        SocketAddress sa = mock(SocketAddress.class);
        ws.connect(sa);
        verify(mockS).connect(sa);
        verifyZeroInteractions(sa);
    }
    
    @Test
    public void testConnectWithTimeoutDelegatesToSocket() throws Exception {
        SocketAddress sa = mock(SocketAddress.class);
        ws.connect(sa, 9001);
        verify(mockS).connect(sa, 9001);
        verifyZeroInteractions(sa);
    }
    
    @Test
    public void testBindDelegatesToSocket() throws Exception {
        SocketAddress sa = mock(SocketAddress.class);
        ws.bind(sa);
        verify(mockS).bind(sa);
        verifyZeroInteractions(sa);
    }
    
    @Test
    public void testGetInetAddressDelegatesToSocket() throws Exception {
        InetAddress ia = mock(InetAddress.class);
        when(mockS.getInetAddress()).thenReturn(ia);
        InetAddress result = ws.getInetAddress();
        assertEquals(ia, result);
        verify(mockS).getInetAddress();
        verifyZeroInteractions(ia);
    }
    
    @Test
    public void testGetLocalAddressDelegatesToSocket() throws Exception {
        InetAddress ia = mock(InetAddress.class);
        when(mockS.getLocalAddress()).thenReturn(ia);
        InetAddress result = ws.getLocalAddress();
        assertEquals(ia, result);
        verify(mockS).getLocalAddress();
        verifyZeroInteractions(ia);
    }
    
    @Test
    public void testGetPortDelegatesToSocket() throws Exception {
        when(mockS.getPort()).thenReturn(42);
        int result = ws.getPort();
        assertEquals(42, result);
        verify(mockS).getPort();
    }
    
    @Test
    public void testGetLocalPortDelegatesToSocket() throws Exception {
        when(mockS.getLocalPort()).thenReturn(69);
        int result = ws.getLocalPort();
        assertEquals(69, result);
        verify(mockS).getLocalPort();
    }
    
    @Test
    public void testGetRemoteSocketAddressDelegatesToSocket() throws Exception {
        SocketAddress sa = mock(SocketAddress.class);
        when(mockS.getRemoteSocketAddress()).thenReturn(sa);
        SocketAddress result = ws.getRemoteSocketAddress();
        assertEquals(sa, result);
        verify(mockS).getRemoteSocketAddress();
        verifyZeroInteractions(sa);
    }
    
    @Test
    public void testGetLocalSocketAddressDelegatesToSocket() throws Exception {
        SocketAddress sa = mock(SocketAddress.class);
        when(mockS.getLocalSocketAddress()).thenReturn(sa);
        SocketAddress result = ws.getLocalSocketAddress();
        assertEquals(sa, result);
        verify(mockS).getLocalSocketAddress();
        verifyZeroInteractions(sa);
    }
    
    @Test
    public void testGetChannelThrowsUnsupportedOperationException() throws Exception {
        try {
            SocketChannel sc = ws.getChannel();
            fail();
        } catch (UnsupportedOperationException e) {
            // expected
        }
        verifyZeroInteractions(mockS);
    }
    
    @Test
    public void testGetInputStreamReturnsWebSocketServerInputStream() throws Exception {
        InputStream is = mock(InputStream.class);
        OutputStream os = mock(OutputStream.class);
        when(mockS.getInputStream()).thenReturn(is);
        when(mockS.getOutputStream()).thenReturn(os);
        InputStream result = ws.getInputStream();
        assertNotEquals(is, result);
        assertTrue(result instanceof WebSocketServerInputStream);
        verify(mockS).getInputStream();
        verify(mockS).getOutputStream();
        verifyZeroInteractions(is);
        verifyZeroInteractions(os);
    }
    
    @Test
    public void testWebSocketServerInputStreamHasOutputPeer() throws Exception {
        InputStream is = mock(InputStream.class);
        OutputStream os = mock(OutputStream.class);
        when(mockS.getInputStream()).thenReturn(is);
        when(mockS.getOutputStream()).thenReturn(os);
        InputStream result = ws.getInputStream();
        assertNotEquals(is, result);
        assertTrue(result instanceof WebSocketServerInputStream);
        WebSocketServerInputStream wssis = (WebSocketServerInputStream) result;
        assertNotNull(wssis.getOutputPeer());
        verify(mockS).getInputStream();
        verify(mockS).getOutputStream();
        verifyZeroInteractions(is);
        verifyZeroInteractions(os);
    }
    
    @Test
    public void testGetInputStreamTwiceReturnsSameObject() throws Exception {
        InputStream is = mock(InputStream.class);
        OutputStream os = mock(OutputStream.class);
        when(mockS.getInputStream()).thenReturn(is);
        when(mockS.getOutputStream()).thenReturn(os);
        InputStream result = ws.getInputStream();
        assertNotEquals(is, result);
        assertTrue(result instanceof WebSocketServerInputStream);
        WebSocketServerInputStream wssis = (WebSocketServerInputStream) result;
        assertNotNull(wssis.getOutputPeer());
        InputStream result2 = ws.getInputStream();
        assertNotNull(result2);
        assertEquals(result, result2);
        assertEquals(wssis, result2);
        verify(mockS, times(1)).getInputStream();
        verify(mockS, times(1)).getOutputStream();
        verifyZeroInteractions(is);
        verifyZeroInteractions(os);
    }
    
    @Test
    public void testGetOutputStreamReturnsWebSocketServerOutputStream() throws Exception {
        OutputStream os = mock(OutputStream.class);
        when(mockS.getOutputStream()).thenReturn(os);
        OutputStream result = ws.getOutputStream();
        assertNotEquals(os, result);
        assertTrue(result instanceof WebSocketServerOutputStream);
        verify(mockS).getOutputStream();
        verifyZeroInteractions(os);
    }
    
    @Test
    public void testGetOutputStreamTwiceReturnsSameObject() throws Exception {
        OutputStream os = mock(OutputStream.class);
        when(mockS.getOutputStream()).thenReturn(os);
        OutputStream result = ws.getOutputStream();
        assertNotEquals(os, result);
        assertTrue(result instanceof WebSocketServerOutputStream);
        WebSocketServerOutputStream wssos = (WebSocketServerOutputStream) result;
        OutputStream result2 = ws.getOutputStream();
        assertNotNull(result2);
        assertEquals(result, result2);
        assertEquals(wssos, result2);
        verify(mockS, times(1)).getOutputStream();
        verifyZeroInteractions(os);
    }

    @Test
    public void testSetTcpNoDelayDelegatesToSocket() throws Exception {
        ws.setTcpNoDelay(true);
        ws.setTcpNoDelay(false);
        verify(mockS).setTcpNoDelay(true);
        verify(mockS).setTcpNoDelay(false);
    }

    @Test
    public void testGetTcpNoDelayDelegatesToSocket() throws Exception {
        when(mockS.getTcpNoDelay()).thenReturn(false);
        assertFalse(ws.getTcpNoDelay());
        verify(mockS).getTcpNoDelay();
    }

    @Test
    public void testGetTcpNoDelayDelegatesToSocket2() throws Exception {
        when(mockS.getTcpNoDelay()).thenReturn(true);
        assertTrue(ws.getTcpNoDelay());
        verify(mockS).getTcpNoDelay();
    }

    @Test
    public void testSetSoLignerDelegatesToSocket() throws Exception {
        ws.setSoLinger(true, 1337);
        verify(mockS).setSoLinger(true, 1337);
    }

    @Test
    public void testGetSoLingerDelegatesToSocket() throws Exception {
        when(mockS.getSoLinger()).thenReturn(1337);
        assertEquals(1337, ws.getSoLinger());
        verify(mockS).getSoLinger();
    }

    @Test
    public void testSendUrgentDataDelegatesToSocket() throws Exception {
        ws.sendUrgentData(49152);
        verify(mockS).sendUrgentData(49152);
    }
    
    @Test
    public void testSetOobInlineDelegatesToSocket() throws Exception {
        ws.setOOBInline(true);
        verify(mockS).setOOBInline(true);
    }
    
    @Test
    public void testGetOobInlineDelegatesToSocket() throws Exception {
        when(mockS.getOOBInline()).thenReturn(true);
        assertTrue(ws.getOOBInline());
        verify(mockS).getOOBInline();
    }
    
    @Test
    public void testSetSoTimeoutDelegatesToSocket() throws Exception {
        ws.setSoTimeout(123456);
        verify(mockS).setSoTimeout(123456);
    }
    
    @Test
    public void testGetSoTimeoutDelegatesToSocket() throws Exception {
        when(mockS.getSoTimeout()).thenReturn(123456);
        assertEquals(123456, ws.getSoTimeout());
        verify(mockS).getSoTimeout();
    }
    
    @Test
    public void testSetSendBufferSizeDelegatesToSocket() throws Exception {
        ws.setSendBufferSize(654321);
        verify(mockS).setSendBufferSize(654321);
    }
    
    @Test
    public void testGetSendBufferSizeDelegatesToSocket() throws Exception {
        when(mockS.getSendBufferSize()).thenReturn(654321);
        assertEquals(654321, ws.getSendBufferSize());
        verify(mockS).getSendBufferSize();
    }
    
    @Test
    public void testSetReceiveBufferSizeDelegatesToSocket() throws Exception {
        ws.setReceiveBufferSize(654321);
        verify(mockS).setReceiveBufferSize(654321);
    }
    
    @Test
    public void testGetReceiveBufferSizeDelegatesToSocket() throws Exception {
        when(mockS.getReceiveBufferSize()).thenReturn(654321);
        assertEquals(654321, ws.getReceiveBufferSize());
        verify(mockS).getReceiveBufferSize();
    }

    @Test
    public void testSetKeepAliveDelegatesToSocket() throws Exception {
        ws.setKeepAlive(true);
        ws.setKeepAlive(false);
        verify(mockS).setKeepAlive(true);
        verify(mockS).setKeepAlive(false);
    }

    @Test
    public void testGetKeepAliveDelegatesToSocket() throws Exception {
        when(mockS.getKeepAlive()).thenReturn(false);
        assertFalse(ws.getKeepAlive());
        verify(mockS).getKeepAlive();
    }

    @Test
    public void testSetTrafficClassDelegatesToSocket() throws Exception {
        ws.setTrafficClass(5);
        verify(mockS).setTrafficClass(5);
    }
    
    @Test
    public void testGetTrafficClassDelegatesToSocket() throws Exception {
        when(mockS.getTrafficClass()).thenReturn(6);
        assertEquals(6, ws.getTrafficClass());
        verify(mockS).getTrafficClass();
    }

    @Test
    public void testSetReuseAddressDelegatesToSocket() throws Exception {
        ws.setReuseAddress(true);
        ws.setReuseAddress(false);
        verify(mockS).setReuseAddress(true);
        verify(mockS).setReuseAddress(false);
    }

    @Test
    public void testGetReuseAddressDelegatesToSocket() throws Exception {
        when(mockS.getReuseAddress()).thenReturn(false);
        assertFalse(ws.getReuseAddress());
        verify(mockS).getReuseAddress();
    }
    
    @Test
    public void testCloseDelegatesToSocket() throws Exception {
        ws.close();
        verify(mockS).close();
    }
    
    @Test
    public void testShutdownInputDelegatesToSocket() throws Exception {
        ws.shutdownInput();
        verify(mockS).shutdownInput();
    }
    
    @Test
    public void testShutdownOutputDelegatesToSocket() throws Exception {
        ws.shutdownOutput();
        verify(mockS).shutdownOutput();
    }
    
    @Test
    public void testToStringDelegatesToSocket() throws Exception {
        when(mockS.toString()).thenReturn("Exterminate!");
        assertEquals("Exterminate!", ws.toString());
        // toString() ... Mockito's Kryptonite
//        verify(mockS).toString();
    }

    @Test
    public void testIsConnectedDelegatesToSocket() throws Exception {
        when(mockS.isConnected()).thenReturn(true);
        assertTrue(ws.isConnected());
        verify(mockS).isConnected();
    }
    
    @Test
    public void testIsBoundDelegatesToSocket() throws Exception {
        when(mockS.isBound()).thenReturn(true);
        assertTrue(ws.isBound());
        verify(mockS).isBound();
    }
    
    @Test
    public void testIsClosedDelegatesToSocket() throws Exception {
        when(mockS.isClosed()).thenReturn(true);
        assertTrue(ws.isClosed());
        verify(mockS).isClosed();
    }
    
    @Test
    public void testIsInputShutdownDelegatesToSocket() throws Exception {
        when(mockS.isInputShutdown()).thenReturn(true);
        assertTrue(ws.isInputShutdown());
        verify(mockS).isInputShutdown();
    }
    
    @Test
    public void testIsOutputShutdownDelegatesToSocket() throws Exception {
        when(mockS.isOutputShutdown()).thenReturn(true);
        assertTrue(ws.isOutputShutdown());
        verify(mockS).isOutputShutdown();
    }
    
    @Test
    public void testSetPerformancePreferencesDelegatesToSocket() throws Exception {
        ws.setPerformancePreferences(123, 456, 789);
        verify(mockS).setPerformancePreferences(123, 456, 789);
    }
}
