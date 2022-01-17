package demo.model;

import java.util.List;

public class LoginoutResponse {
    public static class Data {
        public int no;
        public int errcode;
        public String errmsg;
    }
    public int errcode;
    public String errmsg;
    public List<Data> data;
}
