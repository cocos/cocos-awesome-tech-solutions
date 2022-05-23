/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.cocos.game;

import android.Manifest;
import android.os.Build;
import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;

import android.util.Log;
import android.view.WindowManager;
import com.cocos.service.SDKWrapper;
import com.cocos.lib.CocosActivity;
import io.agora.mediaplayer.*;
import io.agora.mediaplayer.data.AudioFrame;
import io.agora.mediaplayer.data.VideoFrame;

import java.io.Console;

public class AppActivity extends CocosActivity {
    private PlayerCppFragment playerCppFragment = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // DO OTHER INITIALIZATION BELOW
        SDKWrapper.shared().init(this);

//        AgoraMediaPlayerKit agoraMediaPlayerKit1 = new AgoraMediaPlayerKit(this);
//
//        agoraMediaPlayerKit1.registerPlayerObserver(new MediaPlayerObserver() {
//            @Override
//            public void onPlayerStateChanged(Constants.MediaPlayerState state, Constants.MediaPlayerError error) {
//                Log.d("d", "agoraMediaPlayerKit1 onPlayerStateChanged:"+state+" "+error);
//            }
//
//            @Override
//            public void onPositionChanged(final long position) {
//                Log.d("d", "agoraMediaPlayerKit1 onPositionChanged:"+position);
//            }
//
//            @Override
//            public void onPlayerEvent(Constants.MediaPlayerEvent eventCode) {
//                Log.d("d", "agoraMediaPlayerKit1 onEvent:"+eventCode);
//            }
//
//            @Override
//            public void onMetaData(Constants.MediaPlayerMetadataType mediaPlayerMetadataType, byte[] bytes) {
//                Log.d("d", "agoraMediaPlayerKit1 onMetaData "+ new String(bytes));
//            }
//
//            @Override
//            public void onPlayBufferUpdated(long l) {
//
//            }
//
//            @Override
//            public void onPreloadEvent(String s, Constants.MediaPlayerPreloadEvent mediaPlayerPreloadEvent) {
//
//            }
//
//        });
//
//        agoraMediaPlayerKit1.registerVideoFrameObserver(new VideoFrameObserver() {
//            @Override
//            public void onFrame(VideoFrame videoFrame) {
//                Log.d("d", "agoraMediaPlayerKit1 video onFrame :"+videoFrame);
//            }
//        });
//
//        agoraMediaPlayerKit1.registerAudioFrameObserver(new AudioFrameObserver() {
//            @Override
//            public void onFrame(AudioFrame audioFrame) {
//                Log.d("d", "agoraMediaPlayerKit1 audio onFrame :"+audioFrame);
//            }
//        });
//
//        agoraMediaPlayerKit1.open("rtmp://mobliestream.c3tv.com:554/live/goodtv.sdp",0);
//        agoraMediaPlayerKit1.play();
//        agoraMediaPlayerKit1.stop();
        
        this.playerCppFragment = new PlayerCppFragment(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.shared().onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.shared().onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            return;
        }
        SDKWrapper.shared().onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.shared().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.shared().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.shared().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.shared().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.shared().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.shared().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.shared().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.shared().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.shared().onStart();
        super.onStart();
    }

    @Override
    public void onLowMemory() {
        SDKWrapper.shared().onLowMemory();
        super.onLowMemory();
    }
}
