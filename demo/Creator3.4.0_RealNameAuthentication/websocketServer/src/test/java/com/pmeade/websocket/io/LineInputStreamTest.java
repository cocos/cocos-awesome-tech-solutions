/*
 * LineInputStreamTest.java
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

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * @author blinkdog
 */
public class LineInputStreamTest
{
    public LineInputStreamTest() {
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
    public void testRequireDecoratee() {
        try {
            LineInputStream lis = new LineInputStream(null);
            fail();
        } catch (NullPointerException e) {
            // expected
        }
    }
    
    @Test
    public void testConstructWithInputStream() throws Exception {
        ByteArrayInputStream bais = new ByteArrayInputStream("".getBytes());
        LineInputStream lis = new LineInputStream(bais);
        assertNotNull(lis);
        assertNull(lis.readLine());
    }
    
    @Test
    public void testOneLineNoLineEndings() throws Exception {
        ByteArrayInputStream bais = new ByteArrayInputStream("Dalek".getBytes());
        LineInputStream lis = new LineInputStream(bais);
        assertNotNull(lis);
        assertEquals("Dalek", lis.readLine());
        assertEquals(null, lis.readLine());
    }

    @Test
    public void testTwoLinesOneLineEnding() throws Exception {
        String[] inputs = {
            "Cyberman\r\n",
            "Dalek"
        };
        StringBuilder sb = new StringBuilder();
        for(String input : inputs) {
            sb.append(input);
        }
        byte[] bytes = sb.toString().getBytes();
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        LineInputStream lis = new LineInputStream(bais);
        assertNotNull(lis);
        assertEquals("Cyberman", lis.readLine());
        assertEquals("Dalek", lis.readLine());
        assertEquals(null, lis.readLine());
    }
    
    @Test
    public void testSeveralLinesAllEndings() throws Exception {
        String[] inputs = {
            "Alice\r\n",
            "Bob\r\n",
            "Carol\r\n",
            "Dave\r\n",
            "Eve\r\n",
            "Mallory\r\n",
            "Trent\r\n"
        };
        StringBuilder sb = new StringBuilder();
        for(String input : inputs) {
            sb.append(input);
        }
        byte[] bytes = sb.toString().getBytes();
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        LineInputStream lis = new LineInputStream(bais);
        assertNotNull(lis);
        assertEquals("Alice", lis.readLine());
        assertEquals("Bob", lis.readLine());
        assertEquals("Carol", lis.readLine());
        assertEquals("Dave", lis.readLine());
        assertEquals("Eve", lis.readLine());
        assertEquals("Mallory", lis.readLine());
        assertEquals("Trent", lis.readLine());
        assertEquals(null, lis.readLine());
    }
    
    @Test
    public void testSeveralLinesMixedEndings() throws Exception {
        String[] inputs = {
            "Alice\r",
            "Bob\n",
            "Carol\r\n",
            "Dave\r",
            "Eve\n",
            "Mallory\r\n",
            "Trent\r\n",
            "Eve\n",
            "Dave\r",
            "Carol\r\n",
            "Eve\n",
        };
        StringBuilder sb = new StringBuilder();
        for(String input : inputs) {
            sb.append(input);
        }
        byte[] bytes = sb.toString().getBytes();
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        LineInputStream lis = new LineInputStream(bais);
        assertNotNull(lis);
        assertEquals("Alice\rBob\nCarol", lis.readLine());
        assertEquals("Dave\rEve\nMallory", lis.readLine());
        assertEquals("Trent", lis.readLine());
        assertEquals("Eve\nDave\rCarol", lis.readLine());
        assertEquals("Eve\n", lis.readLine());
        assertEquals(null, lis.readLine());
    }
    
    @Test
    public void testPlainRead() throws Exception {
        ByteArrayInputStream bais = new ByteArrayInputStream("Dalek".getBytes());
        LineInputStream lis = new LineInputStream(bais);
        assertNotNull(lis);
        assertEquals((int)'D', lis.read());
        assertEquals((int)'a', lis.read());
        assertEquals((int)'l', lis.read());
        assertEquals((int)'e', lis.read());
        assertEquals((int)'k', lis.read());
        assertEquals(-1, lis.read());
    }
    
    @Test
    public void testDecoratedIOExceptionNotSuppressed() throws Exception {
        InputStream is = new InputStream() {
            @Override
            public int read() throws IOException {
                throw new IOException("Exterminate!");
            }
        };
        LineInputStream lis = new LineInputStream(is);
        assertNotNull(lis);
        try {
            lis.read();
            fail();
        } catch (IOException e) {
            // expected
        }
    }
    
    @Test
    public void testSeveralLinesSomeEmpty() throws Exception {
        String[] inputs = {
            "Alice\r\n",
            "Bob\r\n",
            "\r\n",
            "Dave\r\n",
            "Eve\r\n",
            "\r\n",
            "Trent\r\n"
        };
        StringBuilder sb = new StringBuilder();
        for(String input : inputs) {
            sb.append(input);
        }
        byte[] bytes = sb.toString().getBytes();
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        LineInputStream lis = new LineInputStream(bais);
        assertNotNull(lis);
        assertEquals("Alice", lis.readLine());
        assertEquals("Bob", lis.readLine());
        assertEquals("", lis.readLine());
        assertEquals("Dave", lis.readLine());
        assertEquals("Eve", lis.readLine());
        assertEquals("", lis.readLine());
        assertEquals("Trent", lis.readLine());
        assertEquals(null, lis.readLine());
    }
}
