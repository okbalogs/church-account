package com.church.account.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Indigo600 = Color(0xFF4F46E5)
val Indigo100 = Color(0xFFE0E7FF)
val Green600  = Color(0xFF059669)
val Green50   = Color(0xFFECFDF5)
val Rose600   = Color(0xFFE11D48)
val Rose50    = Color(0xFFFFF1F2)
val Slate900  = Color(0xFF0F172A)
val Slate600  = Color(0xFF475569)
val Slate200  = Color(0xFFE2E8F0)
val Slate50   = Color(0xFFF8FAFC)
val Amber600  = Color(0xFFD97706)
val Orange600 = Color(0xFFEA580C)

private val colorScheme = lightColorScheme(
    primary = Indigo600,
    onPrimary = Color.White,
    primaryContainer = Indigo100,
    secondary = Green600,
    background = Slate50,
    surface = Color.White,
    onBackground = Slate900,
    onSurface = Slate900,
    outline = Slate200,
)

@Composable
fun ChurchAccountTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = colorScheme, content = content)
}
