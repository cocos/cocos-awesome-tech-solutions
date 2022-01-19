/*
 * EchoServer.java
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

package com.pmeade.websocket.example;


import com.pmeade.websocket.io.WebSocketServerOutputStream;
import com.pmeade.websocket.net.WebSocket;
import com.pmeade.websocket.net.WebSocketServerSocket;


import java.io.IOException;
import java.io.InputStream;

import java.net.ServerSocket;



/**
 * @author pmeade
 */
public class EchoServer {
    public static final int PORT = 8080;

    public static void main(String[] args) {
        EchoServer echoServer = new EchoServer();

        try {
            echoServer.doIt();
        } catch(Exception e) {
            System.err.println(e.getLocalizedMessage());
            e.printStackTrace(System.err);
        }
    }
    
    public void doIt() throws Exception
    {
        ServerSocket serverSocket = new ServerSocket(PORT);
        WebSocketServerSocket webSocketServerSocket
                = new WebSocketServerSocket(serverSocket);
        while(finished == false) {
            WebSocket socket = webSocketServerSocket.accept();

            new WebSocketThread(socket).start();

        }

    }
    
    public void finish() {
        finished = true;
    }
    
    private boolean finished = false;
}

class WebSocketThread extends Thread {
    public WebSocketThread(WebSocket socket) {
        this.webSocket = socket;
    }

    @Override
    public void run() {
        try {

            WebSocketServerOutputStream wsos = webSocket.getOutputStream();
            InputStream wsis = webSocket.getInputStream();
            int data = wsis.read();
            System.out.println("Decoded String : " + data);

            while (finished == false && data != -1) {
                wsos.writeString(data);

                data = wsis.read();
            }

            System.out.println("Data received1: "+data);

        } catch (IOException e) {
            finished = true;
            System.err.println(e.getLocalizedMessage());
            e.printStackTrace(System.err);
        }
        try {
            webSocket.close();
        } catch (IOException e) {
            finished = true;
            System.err.println(e.getLocalizedMessage());
            e.printStackTrace(System.err);
        }
    }

    public void finish() {
        finished = true;
    }
    
    private boolean finished = false;
    
    private final WebSocket webSocket;
}
