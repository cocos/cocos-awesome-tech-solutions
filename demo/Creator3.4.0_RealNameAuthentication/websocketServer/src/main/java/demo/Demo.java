package demo;

import com.google.gson.Gson;
import java.io.IOException;

import demo.model.CheckResponse;

public class Demo {
    static String AppId = "AppId"; // 注册成功后即可获得 appId
    static String BizId = "BizId"; // 注册成功后即可获得 bizId
    static String Key = "secretkey"; // 注册成功后即可获得 secretkey
    static String CheckUrl = "https://wlc.nppa.gov.cn/test/authentication/check/AAAAAA"; //测试码需登录网站开启
    static String QueryUrl = "https://wlc.nppa.gov.cn/test/authentication/query/BBBBBB"; //测试码需登录网站开启

    public static void main(String[] args) throws IOException {
        Nppa nppa = new Nppa(AppId, BizId, Key);
        Gson gson = new Gson();
        CheckResponse res = nppa.checkIdCard(CheckUrl, "100000000000000001", "110000190101010001", "???");
        System.out.println(" == Get Response ==\n" + gson.toJson(res));
        res = nppa.queryIdCardResult(QueryUrl, "100000000000000001");
        System.out.println(gson.toJson(res));
    }

}




