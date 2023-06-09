/*
 * WebSocketServerSocketTest.java
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

import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.SocketAddress;
import java.nio.channels.ServerSocketChannel;
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
public class WebSocketServerSocketTest 
{
    private ServerSocket mockSS;
    private WebSocketServerSocket wsss;
    
    public WebSocketServerSocketTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() throws Exception {
        mockSS = mock(ServerSocket.class);
        wsss = new WebSocketServerSocket(mockSS);
    }
    
    @After
    public void tearDown() throws Exception {
    }

    @Test
    public void testAlwaysSucceed() {
        assertTrue(true);
        verifyZeroInteractions(mockSS);
    }
    
    @Test
    public void testExtendsServerSocket() throws Exception {
        assertTrue(wsss instanceof ServerSocket);
        verifyZeroInteractions(mockSS);
    }
    
    @Test
    public void testBindDelegatesToServerSocket() throws Exception {
        SocketAddress sa = mock(SocketAddress.class);
        wsss.bind(sa);
        verify(mockSS).bind(sa);
        verifyZeroInteractions(sa);
    }
    
    @Test
    public void testBindWithBacklogDelegatesToServerSocket() throws Exception {
        SocketAddress sa = mock(SocketAddress.class);
        wsss.bind(sa, 12345);
        verify(mockSS).bind(sa, 12345);
        verifyZeroInteractions(sa);
    }
    
    @Test
    public void testGetInetAddressDelegatesToServerSocket() throws Exception {
        InetAddress ia = mock(InetAddress.class);
        when(mockSS.getInetAddress()).thenReturn(ia);
        InetAddress result = wsss.getInetAddress();
        assertEquals(ia, result);
        verify(mockSS).getInetAddress();
        verifyZeroInteractions(ia);
    }

    @Test
    public void testGetLocalPortDelegatesToServerSocket() throws Exception {
        when(mockSS.getLocalPort()).thenReturn(42);
        int result = wsss.getLocalPort();
        assertEquals(42, result);
        verify(mockSS).getLocalPort();
    }
    
    @Test
    public void testGetLocalAddressDelegatesToServerSocket() throws Exception {
        SocketAddress sa = mock(SocketAddress.class);
        when(mockSS.getLocalSocketAddress()).thenReturn(sa);
        SocketAddress result = wsss.getLocalSocketAddress();
        assertEquals(sa, result);
        verify(mockSS).getLocalSocketAddress();
        verifyZeroInteractions(sa);
    }
    
    @Test
    public void testGetChannelThrowsUnsupportedOperationException() throws Exception {
        try {
            ServerSocketChannel ssc = wsss.getChannel();
            fail();
        } catch (UnsupportedOperationException e) {
            // expected
        }
        verifyZeroInteractions(mockSS);
    }
    
    @Test
    public void testSetSoTimeoutDelegatesToSocket() throws Exception {
        wsss.setSoTimeout(123456);
        verify(mockSS).setSoTimeout(123456);
    }
    
    @Test
    public void testGetSoTimeoutDelegatesToSocket() throws Exception {
        when(mockSS.getSoTimeout()).thenReturn(123456);
        assertEquals(123456, wsss.getSoTimeout());
        verify(mockSS).getSoTimeout();
    }
    
    @Test
    public void testSetReceiveBufferSizeDelegatesToSocket() throws Exception {
        wsss.setReceiveBufferSize(654321);
        verify(mockSS).setReceiveBufferSize(654321);
    }
    
    @Test
    public void testGetReceiveBufferSizeDelegatesToSocket() throws Exception {
        when(mockSS.getReceiveBufferSize()).thenReturn(654321);
        assertEquals(654321, wsss.getReceiveBufferSize());
        verify(mockSS).getReceiveBufferSize();
    }

    @Test
    public void testSetReuseAddressDelegatesToSocket() throws Exception {
        wsss.setReuseAddress(true);
        wsss.setReuseAddress(false);
        verify(mockSS).setReuseAddress(true);
        verify(mockSS).setReuseAddress(false);
    }

    @Test
    public void testGetReuseAddressDelegatesToSocket() throws Exception {
        when(mockSS.getReuseAddress()).thenReturn(false);
        assertFalse(wsss.getReuseAddress());
        verify(mockSS).getReuseAddress();
    }
    
    @Test
    public void testCloseDelegatesToSocket() throws Exception {
        wsss.close();
        verify(mockSS).close();
    }
    
    @Test
    public void testToStringDelegatesToSocket() throws Exception {
        when(mockSS.toString()).thenReturn("Exterminate!");
        assertEquals("Exterminate!", wsss.toString());
        // toString() ... Mockito's Kryptonite
//        verify(mockSS).toString();
    }

    @Test
    public void testIsBoundDelegatesToSocket() throws Exception {
        when(mockSS.isBound()).thenReturn(true);
        assertTrue(wsss.isBound());
        verify(mockSS).isBound();
    }
    
    @Test
    public void testIsClosedDelegatesToSocket() throws Exception {
        when(mockSS.isClosed()).thenReturn(true);
        assertTrue(wsss.isClosed());
        verify(mockSS).isClosed();
    }
    
    @Test
    public void testSetPerformancePreferencesDelegatesToSocket() throws Exception {
        wsss.setPerformancePreferences(123, 456, 789);
        verify(mockSS).setPerformancePreferences(123, 456, 789);
    }
}
    