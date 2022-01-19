/*
 * HttpRequestTest.java
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

package com.pmeade.websocket.http;

import com.google.common.collect.ImmutableMap;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.StringJoiner;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * @author blinkdog
 */
public class HttpRequestTest
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

    private static final String MESSED_UP_HEADERS = (Joiner.on("\r\n").join(Arrays.asList(
        "GET / HTTP/1.1",
        "Host: localhost:8080",
        "User-Agent Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language en-US,en;q=0.5",
        "Accept-Encoding: gzip, deflate",
        "Sec-WebSocket-Version 13",
        "Origin: null",
        "Sec-WebSocket-Key V76L7ym8nB/U/K96iWDjKg==",
        "Connection: keep-alive, Upgrade",
        "Pragma no-cache",
        "Cache-Control: no-cache",
        "Upgrade websocket",
        ""
    ))) + "\r\n";

    private static final String INCOMPLETE_REQUEST = (Joiner.on("\r\n").join(Arrays.asList(
        "GET / HTTP/1.1",
        "Host: localhost:8080",
        "User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language: en-US,en;q=0.5",
        "Accept-Encoding: gzip, deflate",
        "Sec-WebSocket-Version: 13"
    ))) + "\r\n";

    private static final String BROKEN_HEADERS = (Joiner.on("\r\n").join(Arrays.asList(
        "GET / HTTP/1.1",
        ": localhost:8080",
        ":::: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0",
        "    :    text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "JustABunchOfStuff:",
        ":JustABunchOfStuff",
        ":::JustABunchOfStuff:::",
        " : : : JustABunchOfStuff : : : ",
        "dflkjdlk j d lkjdlkjflkdjf lkj  dl  kfjdlkjfdlkjflkdjflkdjlkfjdlkjfdlkjflkdjflkdjlfkjdlkfjdlkfjdlk:",
        ""
    ))) + "\r\n";
    
    public HttpRequestTest() {
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
    public void testConstructNullReader() {
        try {
            HttpRequest hr = new HttpRequest(null);
            fail();
        } catch(NullPointerException e) {
            // expected
        }
    }

    @Test
    public void testRequestLineConstantDefined() {
        assertNotNull(HttpRequest.REQUEST_LINE);
    }
    
    @Test
    public void testConstructWithEmptyReader() {
        ByteArrayInputStream bais = new ByteArrayInputStream("".getBytes());
        HttpRequest hr = new HttpRequest(bais);
        assertEquals(1, hr.size());
        assertEquals(null, hr.get(HttpRequest.REQUEST_LINE));
    }
    
    @Test
    public void testWithClientHandshake() {
        ByteArrayInputStream bais = new ByteArrayInputStream(CLIENT_HANDSHAKE.getBytes());
        HttpRequest hr = new HttpRequest(bais);
        assertEquals(25, hr.size());
        assertEquals("GET / HTTP/1.1", hr.get(HttpRequest.REQUEST_LINE));
        assertEquals("localhost:8080", hr.get("Host"));
        assertEquals("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0", hr.get("User-Agent"));
        assertEquals("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", hr.get("Accept"));
        assertEquals("en-US,en;q=0.5", hr.get("Accept-Language"));
        assertEquals("gzip, deflate", hr.get("Accept-Encoding"));
        assertEquals("13", hr.get("Sec-WebSocket-Version"));
        assertEquals("null", hr.get("Origin"));
        assertEquals("V76L7ym8nB/U/K96iWDjKg==", hr.get("Sec-WebSocket-Key"));
        assertEquals("keep-alive, Upgrade", hr.get("Connection"));
        assertEquals("no-cache", hr.get("Pragma"));
        assertEquals("no-cache", hr.get("Cache-Control"));
        assertEquals("websocket", hr.get("Upgrade"));
    }

    @Test
    public void testConstructWithBlankLines() {
        ByteArrayInputStream bais = new ByteArrayInputStream("\r\n\r\n\r\n".getBytes());
        HttpRequest hr = new HttpRequest(bais);
        assertEquals(1, hr.size());
        assertEquals(null, hr.get(HttpRequest.REQUEST_LINE));
    }
    
    @Test
    public void testWithMessedUpHeaders() {
        ByteArrayInputStream bais = new ByteArrayInputStream(MESSED_UP_HEADERS.getBytes());
        HttpRequest hr = new HttpRequest(bais);
        assertEquals(15, hr.size());
        assertEquals("GET / HTTP/1.1", hr.get(HttpRequest.REQUEST_LINE));
        assertEquals("localhost:8080", hr.get("Host"));
        assertEquals(null, hr.get("User-Agent"));
        assertEquals("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", hr.get("Accept"));
        assertEquals(null, hr.get("Accept-Language"));
        assertEquals("gzip, deflate", hr.get("Accept-Encoding"));
        assertEquals(null, hr.get("Sec-WebSocket-Version"));
        assertEquals("null", hr.get("Origin"));
        assertEquals(null, hr.get("Sec-WebSocket-Key"));
        assertEquals("keep-alive, Upgrade", hr.get("Connection"));
        assertEquals(null, hr.get("Pragma"));
        assertEquals("no-cache", hr.get("Cache-Control"));
        assertEquals(null, hr.get("Upgrade"));
    }
    
    @Test
    public void testWithIncompleteRequest() {
        ByteArrayInputStream bais = new ByteArrayInputStream(INCOMPLETE_REQUEST.getBytes());
        HttpRequest hr = new HttpRequest(bais);
        assertEquals(13, hr.size());
        assertEquals("GET / HTTP/1.1", hr.get(HttpRequest.REQUEST_LINE));
        assertEquals("localhost:8080", hr.get("Host"));
        assertEquals("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0", hr.get("User-Agent"));
        assertEquals("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", hr.get("Accept"));
        assertEquals("en-US,en;q=0.5", hr.get("Accept-Language"));
        assertEquals("gzip, deflate", hr.get("Accept-Encoding"));
        assertEquals("13", hr.get("Sec-WebSocket-Version"));
    }
    
    @Test
    public void testWithIncompleteRequestThatThrows() {
        InputStream bytesThenThrow = new InputStream() {
            final byte[] bytes = INCOMPLETE_REQUEST.getBytes();
            final ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
            int count = 0;
            @Override
            public int read() throws IOException {
                if(count < bytes.length) {
                    int data = (int)bytes[count];
                    count++;
                    return data;
                } else {
                    throw new IOException("Oh frell...");
                }
            }
        };
        HttpRequest hr = new HttpRequest(bytesThenThrow);
        assertEquals(13, hr.size());
        assertEquals("GET / HTTP/1.1", hr.get(HttpRequest.REQUEST_LINE));
        assertEquals("localhost:8080", hr.get("Host"));
        assertEquals("Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:30.0) Gecko/20100101 Firefox/30.0", hr.get("User-Agent"));
        assertEquals("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", hr.get("Accept"));
        assertEquals("en-US,en;q=0.5", hr.get("Accept-Language"));
        assertEquals("gzip, deflate", hr.get("Accept-Encoding"));
        assertEquals("13", hr.get("Sec-WebSocket-Version"));
    }

    @Test
    public void testMapMutatorsFailWithException() {
        ByteArrayInputStream bais = new ByteArrayInputStream(CLIENT_HANDSHAKE.getBytes());
        HttpRequest hr = new HttpRequest(bais);
        assertEquals(25, hr.size());
        assertEquals("GET / HTTP/1.1", hr.get(HttpRequest.REQUEST_LINE));
        assertEquals("localhost:8080", hr.get("Host"));
        
        try {
            hr.put("Custom-Header", "Custom Data For Header");
            fail();
        } catch(UnsupportedOperationException e) {
            // expected
        }
        
        try {
            hr.remove("Host");
            fail();
        } catch(UnsupportedOperationException e) {
            // expected
        }

        try {
            ImmutableMap<String,String> myMap = ImmutableMap.<String,String>builder()
                .put("Header-One", "Data One") 
                .put("Header-Two", "Data Two") 
                .put("Header-Three", "Data Three") 
                .build();            
            hr.putAll(myMap);
            fail();
        } catch(UnsupportedOperationException e) {
            // expected
        }
        
        try {
            hr.clear();
            fail();
        } catch(UnsupportedOperationException e) {
            // expected
        }
    }

    @Test
    public void testMapAccessorsWork() {
        ByteArrayInputStream bais = new ByteArrayInputStream(CLIENT_HANDSHAKE.getBytes());
        HttpRequest hr = new HttpRequest(bais);
        assertEquals(25, hr.size());
        assertEquals("GET / HTTP/1.1", hr.get(HttpRequest.REQUEST_LINE));
        assertEquals("localhost:8080", hr.get("Host"));

        assertFalse(hr.isEmpty());

        assertTrue(hr.containsKey("Host"));
        assertFalse(hr.containsKey("Dalek-Malware"));
        
        assertTrue(hr.containsValue("localhost:8080"));
        assertFalse(hr.containsValue("Exterminate!"));
        
        Set<String> keys = hr.keySet();
        assertNotNull(keys);
        assertEquals(25, keys.size());
        
        Collection<String> values = hr.values();
        assertNotNull(values);
        assertEquals(25, values.size());

        Set<Map.Entry<String, String>> entrySet = hr.entrySet();
        assertNotNull(entrySet);
        assertEquals(25, entrySet.size());
    }
    
    @Test
    public void testWithBrokenHeaders() {
        ByteArrayInputStream bais = new ByteArrayInputStream(BROKEN_HEADERS.getBytes());
        HttpRequest hr = new HttpRequest(bais);
        assertEquals(1, hr.size());
        assertEquals("GET / HTTP/1.1", hr.get(HttpRequest.REQUEST_LINE));
    }
}
