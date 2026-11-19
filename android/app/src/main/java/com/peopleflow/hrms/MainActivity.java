package com.peopleflow.hrms;

import android.os.Bundle;
import android.webkit.CookieManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // The remote Vercel origin uses a first-party HTTP-only refresh cookie.
        // Keep normal WebView cookie acceptance enabled; do not enable
        // third-party cookies or persist access tokens in web storage.
        CookieManager.getInstance().setAcceptCookie(true);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStop() {
        // Flush the WebView cookie jar before Android may terminate the
        // activity so the next launch can restore the session.
        CookieManager.getInstance().flush();
        super.onStop();
    }
}
