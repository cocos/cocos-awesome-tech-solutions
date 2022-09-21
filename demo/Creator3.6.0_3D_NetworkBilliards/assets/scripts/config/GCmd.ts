const GCmd = {
    ClientCmd: {
        USER_LOGIN: "user_login",
        INITIATE_BALLS_SYNC: "initiate_balls_sync",
        INITIATE_CUE_SYNC: "initiate_cue_sync"
    },
    ServerCmd: {
        USER_LOGIN_SUCCESS: "user_login_success",
        USER_LOGIN_FAIL: "user_login_fail",
        REQUEST_BALLS_SYNC: "request_balls_sync",
        REQUEST_CUE_SYNC: "request_cue_sync"
    },
}
export default GCmd;