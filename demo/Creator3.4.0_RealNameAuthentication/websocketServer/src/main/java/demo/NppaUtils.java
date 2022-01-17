package demo;

import com.google.gson.Gson;

import demo.model.CheckResponse;

public class NppaUtils {
    static String AppId = "6d392d7a275946978e8ee38f3f904fae"; // 注册成功后即可获得 appId
    static String BizId = "1101999999"; // 注册成功后即可获得 bizId
    static String Key = "225a2debed3587b89d0ea79cd18b0b09"; // 注册成功后即可获得 secretkey
    static String CheckUrl = "https://wlc.nppa.gov.cn/test/authentication/check/D3oQau"; // 测试码需登录网站开启
    static String QueryUrl = "https://wlc.nppa.gov.cn/test/authentication/query/fSn5NX"; // 测试码需登录网站开启
    static String DataUploadUrl = "https://wlc.nppa.gov.cn/test/collection/loginout/QdN7Cu"; // 测试码需登录网站开启
    public String params = "";
    public String EVENT_LOGIN = "1001";
    public String EVENT_CHECK = "1002";
    public String EVENT_QUERY = "1003";
    public String EVENT_DATAUPLOADING = "1004";
    public Boolean LoginFlag = false;

    public String getCheckResult(String playId, String idCard, String name){
        Nppa nppa = new Nppa(AppId, BizId, Key);
        Gson gson = new Gson();
        CheckResponse res = nppa.checkIdCard(CheckUrl, playId, idCard, name);
        System.out.println(" == name ==\n" + name);
        return gson.toJson(res);
    }

    public String getQueryResult(String playId, String idCard, String name){
        Nppa nppa = new Nppa(AppId, BizId, Key);
        Gson gson = new Gson();
        CheckResponse res = nppa.checkIdCard(CheckUrl, playId, idCard, name);
        res = nppa.queryIdCardResult(QueryUrl, playId);

        return gson.toJson(res);
    }

    public String getDataUploadingResult(String playId, String idCard, String name) {
        Nppa nppa = new Nppa(AppId, BizId, Key);
        Gson gson = new Gson();
        CheckResponse res = nppa.checkIdCard(CheckUrl, playId, idCard, name);
        res = nppa.dataUploadingResult(DataUploadUrl, playId);

        return gson.toJson(res);
    }

    public void Login(){
        LoginFlag = true;
    }
}
