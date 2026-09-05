package com.akaar.security

import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * FLAG_SECURE, exposed to JS as `NativeModules.AkaarScreenGuard`.
 *
 * android-architecture.md requires this on screens showing cost
 * breakdowns: declared costs and the sustainable floor are SELLER_PRIVATE,
 * and the target phone is frequently shared. FLAG_SECURE blocks both
 * screenshots and screen recording, and also keeps the screen out of the
 * recent-apps thumbnail - which is the leak people forget.
 *
 * The flag must be set on the UI thread and applies to the whole window,
 * so it is toggled per screen by useScreenGuard() rather than set once.
 */
class ScreenGuardModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AkaarScreenGuard"

    @ReactMethod
    fun enable() {
        val activity = currentActivity ?: return
        activity.runOnUiThread {
            activity.window.setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE,
            )
        }
    }

    @ReactMethod
    fun disable() {
        val activity = currentActivity ?: return
        activity.runOnUiThread {
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        }
    }
}
