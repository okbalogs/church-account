package com.church.account

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.church.account.ui.navigation.AppNavigation
import com.church.account.ui.theme.ChurchAccountTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        (application as ChurchApp).syncManager.refreshIfOnline()
        setContent {
            ChurchAccountTheme {
                AppNavigation()
            }
        }
    }
}
