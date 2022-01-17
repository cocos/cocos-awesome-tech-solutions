package demo;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import com.google.gson.Gson;
import demo.model.*;
import java.util.*;
import com.github.kevinsawicki.http.HttpRequest;

import org.apache.commons.codec.binary.Hex;

public class Nppa {
    String appId;
    String bizId;
    String keyStr;
    SecretKey key;

    static final String ALGO = "AES/GCM/NoPadding";
    static final int AES_KEY_SIZE = 128;
    static final int GCM_NONCE_LENGTH = 12;
    static final int GCM_TAG_LENGTH = 16;

    public Nppa(String appId, String bizId, String key) {
        this.appId = appId;
        this.bizId = bizId;
        this.keyStr = key;
        this.key = new SecretKeySpec(hexToBytes(key), "AES");
    }

    public static String encrypt(String plaintext, SecretKey key) {
        try {
            Cipher cipher = Cipher.getInstance(ALGO);
            final byte[] nonce = new byte[GCM_NONCE_LENGTH];
            SecureRandom random = SecureRandom.getInstanceStrong();
            random.nextBytes(nonce);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, nonce);
            cipher.init(Cipher.ENCRYPT_MODE, key, spec);
            byte[] encryptData = cipher.doFinal(plaintext.getBytes());
            byte[] result = new byte[GCM_NONCE_LENGTH + encryptData.length];
            System.arraycopy(nonce, 0, result, 0, GCM_NONCE_LENGTH);
            System.arraycopy(encryptData, 0, result, GCM_NONCE_LENGTH, encryptData.length);
            return Base64.getEncoder().encodeToString(result);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private Map<String, String> createCheckBody(String playerId, String name, String idCard) {
        playerId = playerId.replaceAll("-", "");
        String jsonStr = String.format("{\"ai\":\"%s\",\"name\":\"%s\",\"idNum\":\"%s\"}", playerId, name, idCard);
        String data = encrypt(jsonStr, this.key);
        Map<String, String> body = new HashMap<>();
        body.put("data", data);
        Gson gson = new Gson();
        System.out.println(gson.toJson(body));
        return body;
    }

    private Map<String, String> createParamHeader() {
        String now = String.format("%d", new Date().getTime());
        // 这里用treeMap保证keys是有序的
        Map<String, String> map = new HashMap<>();
        map.put("appId", this.appId);
        map.put("bizId", this.bizId);
        map.put("timestamps", now);
        return map;
    }

    private Map<String, String> createSignedHeader(Map<String, String> headers, Map<String, String> queries, String body) {
        Map<String, String> map = new HashMap<>(headers);
        String sign = sign(headers, queries, body);
        map.put("Content-Type", "application/json;charset=utf-8");
        map.put("sign", sign);

        Gson gson = new Gson();
        System.out.println(" == Get Map ==\n" + gson.toJson(map));
        return map;
    }

    private Map<String, String> createQueryQueries(String playerId) {
        playerId = playerId.replaceAll("-", "");
        Map<String, String> map = new HashMap<>();
        map.put("ai", playerId);
        return map;
    }

    private Map<String, String> createDataUploadingQueries(String playerId) {
        playerId = playerId.replaceAll("-", "");
        Map<String, String> map = new HashMap<>();
        map.put("pi", playerId);
        return map;
    }

    private Map<String, String> createLoginoutBody(List<Behaviour> behaviours) {
        Map<String, List<Behaviour>> map = new HashMap<>();
        map.put("collections", behaviours);
        Gson gson = new Gson();
        String jsonStr = gson.toJson(map);
        String data = encrypt(jsonStr, this.key);
        Map<String, String> body = new HashMap<>();
        body.put("data", data);
        return body;
    }

    private String sign(Map<String, String> headers, Map<String, String> queries, String body) {
        StringBuilder builder = new StringBuilder();
        Map<String, String> params = new TreeMap<>(headers);
        if (queries != null && queries.size() != 0) {
            for (Map.Entry<String, String> entry : queries.entrySet()) {
                params.put(entry.getKey(), entry.getValue());
            }
        }
        for (Map.Entry<String, String> entry : params.entrySet()) {
            builder.append(entry.getKey());
            builder.append(entry.getValue());
        }
        if (body != null) {
            builder.append(body);
        }
        System.out.println(" == Get Sign ==\n" + builder.toString());

        String content = this.keyStr + builder.toString();
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes());
            return Hex.encodeHexString(hash);
        } catch (NoSuchAlgorithmException e) {
            // cant go here
            e.printStackTrace();
        }
        return "";
    }

    public static byte[] hexToBytes(String hex) {
        hex = hex.length() % 2 != 0 ? "0" + hex : hex;

        byte[] b = new byte[hex.length() / 2];
        for (int i = 0; i < b.length; i++) {
            int index = i * 2;
            int v = Integer.parseInt(hex.substring(index, index + 2), 16);
            b[i] = (byte) v;
        }
        return b;
    }

    public CheckResponse checkIdCard(String checkUrl, String playerId, String idCard, String name) {
        Map<String, String> headers = createParamHeader();
        Map<String, String> body = createCheckBody(playerId, name, idCard);
        Gson gson = new Gson();
        System.out.println(" == Get Header ==\n" + headers.toString());

        headers = createSignedHeader(headers, null, gson.toJson(body));
        HttpRequest request = HttpRequest.post(checkUrl).headers(headers).contentType("application/json").send(gson.toJson(body));
        String responseBody = request.body();
        if (request.code() == 200) {
            return gson.fromJson(responseBody, CheckResponse.class);
        }
        return null;
    }

    public CheckResponse queryIdCardResult(String queryUrl, String playerId) {
        Map<String, String> headers = createParamHeader();
        Map<String, String> queries = createQueryQueries(playerId);
        headers = createSignedHeader(headers, queries, null);
        HttpRequest request = HttpRequest.get(queryUrl, queries, true).headers(headers);
        String responseBody = request.body();
        if (request.code() == 200) {
            Gson gson = new Gson();
            return gson.fromJson(responseBody, CheckResponse.class);
        }
        return null;
    }

    public CheckResponse dataUploadingResult(String dataUploadingUrl, String playerId) {
        Map<String, String> headers = createParamHeader();
        Map<String, String> queries = createDataUploadingQueries(playerId);
        headers = createSignedHeader(headers, queries, null);
        HttpRequest request = HttpRequest.get(dataUploadingUrl, queries, true).headers(headers);
        String responseBody = request.body();
        if (request.code() == 200) {
            Gson gson = new Gson();
            return gson.fromJson(responseBody, CheckResponse.class);
        }
        return null;
    }

    public LoginoutResponse loginout(String loginoutUrl, List<Behaviour> behaviours) {
        Map<String, String> headers = createParamHeader();
        Map<String, String> body = createLoginoutBody(behaviours);
        Gson gson = new Gson();
        headers = createSignedHeader(headers, null, gson.toJson(body));
        HttpRequest request = HttpRequest.post(loginoutUrl).headers(headers).contentType("application/json").send(gson.toJson(body));
        String responseStr = request.body();
        if (request.code() == 200) {
            return gson.fromJson(responseStr, LoginoutResponse.class);
        }
        return null;
    }
}
