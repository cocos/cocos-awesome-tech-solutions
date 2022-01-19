package demo.model;

public class CheckResponse {
    public static int StatusSuccess = 0;
    public static int StatusWaiting = 1;
    public static int StatusFailed = 2;
    public static class CheckResult {
        public int status;
        public String pi;
    }
    public static class CheckData {
        public CheckResult result;
    }

    public int errcode;
    public String errmsg;
    public CheckData data;
}

