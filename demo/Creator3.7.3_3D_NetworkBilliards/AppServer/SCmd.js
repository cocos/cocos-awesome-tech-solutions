const SCmd = {
    C2S: {
        USER_LOGIN: "user_login",
        HIT_BALL: "hit_ball",
        HIT_BALL_COMPLETE: "hit_ball_complete",
        INITIATE_CUE_SYNC: "initiate_cue_sync"
    },
    S2C: {
        USER_LOGIN_SUCCESS: "user_login_success",
        USER_LOGIN_FAIL: "user_login_fail",
        HIT_BALL_SYNC: "hit_ball_sync",
        HIT_BALL_COMPLETE_SYNC: "hit_ball_complete_sync",
        REQUEST_CUE_SYNC: "request_cue_sync",
    },
};
module.exports = SCmd;