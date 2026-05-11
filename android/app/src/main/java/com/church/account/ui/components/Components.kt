package com.church.account.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.church.account.ui.theme.*

@Composable
fun OfflineBanner(isOnline: Boolean, isSyncing: Boolean, pendingCount: Int) {
    val (bg, text) = when {
        isSyncing -> Indigo600 to "Syncing $pendingCount pending ${if (pendingCount == 1) "entry" else "entries"}…"
        !isOnline && pendingCount > 0 -> Orange600 to "Offline — $pendingCount ${if (pendingCount == 1) "entry" else "entries"} will sync when connected"
        !isOnline -> Orange600 to "You're offline — showing saved data"
        pendingCount > 0 -> Amber600 to "$pendingCount ${if (pendingCount == 1) "entry" else "entries"} pending sync"
        else -> return
    }
    Box(
        Modifier.fillMaxWidth().background(bg).padding(horizontal = 16.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun AmountRow(
    label: String,
    churchValue: String,
    projectValue: String,
    onChurchChange: (String) -> Unit,
    onProjectChange: (String) -> Unit,
    odd: Boolean,
) {
    val bg = if (odd) Slate50 else Color.White
    Row(
        Modifier.fillMaxWidth().background(bg).padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, Modifier.weight(1.4f), fontSize = 13.sp, color = Slate600)
        AmountInput(churchValue, onChurchChange, Modifier.weight(1f).padding(end = 4.dp))
        AmountInput(projectValue, onProjectChange, Modifier.weight(1f).padding(start = 4.dp))
    }
}

@Composable
private fun AmountInput(value: String, onChange: (String) -> Unit, modifier: Modifier) {
    OutlinedTextField(
        value = value,
        onValueChange = { new -> onChange(new.filter { it.isDigit() || it == '.' }) },
        modifier = modifier.height(52.dp),
        singleLine = true,
        textStyle = LocalTextStyle.current.copy(fontSize = 14.sp),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Indigo600,
            unfocusedBorderColor = Slate200,
        ),
    )
}

fun formatNaira(amount: Double): String {
    if (amount == 0.0) return "₦0"
    return "₦" + String.format("%,.2f", amount)
}
