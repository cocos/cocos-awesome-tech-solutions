/*
 * HttpRequest.java
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

import com.pmeade.websocket.io.LineInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * HttpRequest represents the headers of an HTTP Request as a Map. At
 * construction time, it parses the headers of the HTTP Request from
 * the provided InputStream, and places them into an accessible but
 * immutable Map.
 * @author blinkdog
 */
public class HttpRequest implements Map<String, String> {
    /**
     * Logging, just in case anything goes wrong.
     */
    private static final Logger LOG =
        LoggerFactory.getLogger(HttpRequest.class);

    /**
     * The Request Line of the HTTP Request is stored in the map under
     * this key.
     */
    public static final String REQUEST_LINE = "REQUEST_LINE";

    /**
     * Construct an HttpRequest object.
     * @param in InputStream providing the content of the HTTP Request to be
     *           parsed
     */
    public HttpRequest(final InputStream in) {
        checkNotNull(in);
        read(in);
    }

    /**
     * {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final int size() {
        return headerMap.size();
    }

    /**
     * {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final boolean isEmpty() {
        return headerMap.isEmpty();
    }

    /**
     * {@inheritDoc}
     * @param key {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final boolean containsKey(final Object key) {
        return headerMap.containsKey(key);
    }

    /**
     * {@inheritDoc}
     * @param value {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final boolean containsValue(final Object value) {
        return headerMap.containsValue(value);
    }

    /**
     * {@inheritDoc}
     * @param key {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final String get(final Object key) {
        return headerMap.get(key);
    }

    /**
     * {@inheritDoc}
     * @param key {@inheritDoc}
     * @param value {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final String put(final String key, final String value) {
        return headerMap.put(key, value);
    }

    /**
     * {@inheritDoc}
     * @param key {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final String remove(final Object key) {
        return headerMap.remove(key);
    }

    /**
     * {@inheritDoc}
     * @param m {@inheritDoc}
     */
    public final void putAll(final Map<? extends String, ? extends String> m) {
        headerMap.putAll(m);
    }

    /**
     * {@inheritDoc}
     */
    public final void clear() {
        headerMap.clear();
    }

    /**
     * {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final Set<String> keySet() {
        return headerMap.keySet();
    }

    /**
     * {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final Collection<String> values() {
        return headerMap.values();
    }

    /**
     * {@inheritDoc}
     * @return {@inheritDoc}
     */
    public final Set<Entry<String, String>> entrySet() {
        return headerMap.entrySet();
    }

    /**
     * Parse the headers of the HTTP Request. The provided InputStream will
     * contain HTTP Request data. The headers are parsed and placed into
     * the Map. The Map is then made immutable, for safe querying by clients.
     * @param in InputStream providing the content of the HTTP Request to be
     *           parsed
     */
    private void read(final InputStream in) {
        // wrap the Reader in something more convenient
        LineInputStream lis = new LineInputStream(in);
        // create a place to store the header values
        headerMap = new HashMap<String, String>();
        // make sure we handle any IOExceptions
        try {
            // read the first line from the buffered reader
            String line = lis.readLine();
            // if the first line is empty
            while (line != null && line.isEmpty()) {
                // keep reading until we get a non-empty line
                line = lis.readLine();
            }
            // store the non-empty line as the request line
            headerMap.put(REQUEST_LINE, line);
            // read the next line from the buffered reader
            line = lis.readLine();
            // as long as we don't have a null or empty line
            while (line != null && !line.isEmpty()) {
                // determine the position of the first colon
                int firstColonPos = line.indexOf(":");
                // if there is a colon in the line
                if (firstColonPos > 0) {
                    // separate the header field from the header value
                    String key = line.substring(0, firstColonPos).trim();
                    int length = line.length();
                    String value = line.substring(firstColonPos + 1, length);
                    value = value.trim();
                    // if we got both a non-empty field and non-empty value
                    if (!key.isEmpty() && !value.isEmpty()) {
                        // add it to the map
                        headerMap.put(key, value);
                        // add it to the map in lowercase, as well
                        headerMap.put(key.toLowerCase(), value);
                    }
                }
                // read the next line from the header
                line = lis.readLine();
            }
        } catch (IOException e) {
            // log it, and move on
            LOG.error("Unable to read HTTP Request in HttpRequest.read():", e);
        }
        // after we've processed the header, lock the map
        headerMap = Collections.unmodifiableMap(headerMap);
    }

    /**
     * A Map to store the header fields and values after they are parsed
     * from the HTTP Request. The parsing function also makes this map
     * unmodifiable, so that it is safe to allow clients to query it.
     */
    private Map<String, String> headerMap;
}
