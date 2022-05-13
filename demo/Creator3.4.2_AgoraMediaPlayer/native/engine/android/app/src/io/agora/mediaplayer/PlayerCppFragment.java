package io.agora.mediaplayer;

import android.app.Activity;
import android.view.SurfaceView;

import io.agora.mediaplayer.data.MediaStreamInfo;
import io.agora.mediaplayer.internal.AgoraMediaPlayer;

public class PlayerCppFragment {
//    static {
//        System.loadLibrary("AgoraMediaPlayer");
//    }
    public PlayerCppFragment(Activity act) {
        int ret = AgoraMediaPlayer.nativeSetupAvJniEnv();
        initMediaPlayerCpp(act.getApplication());
        SurfaceView videoView1 = new SurfaceView(act);
        setViewMediaPlayerCpp(videoView1);
    }
    private native void initMediaPlayerCpp(Object context);
    private native void setViewMediaPlayerCpp(SurfaceView view);

}
