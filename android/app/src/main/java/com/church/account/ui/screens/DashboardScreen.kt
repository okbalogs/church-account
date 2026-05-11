package com.church.account.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.church.account.ui.components.*
import com.church.account.ui.theme.*
import com.church.account.ui.viewmodel.DashboardViewModel
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Composable
fun DashboardScreen(
    vm: DashboardViewModel,
    onNewIncome: () -> Unit,
    onIncomeHistory: () -> Unit,
    onNewExp: () -> Unit,
    onExpHistory: () -> Unit,
) {
    val income by vm.incomeEntries.collectAsStateWithLifecycle()
    val exp by vm.expEntries.collectAsStateWithLifecycle()
    val isOnline by vm.isOnline.collectAsStateWithLifecycle()
    val isSyncing by vm.isSyncing.collectAsStateWithLifecycle()
    val pending by vm.pendingCount.collectAsStateWithLifecycle()

    val thisMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"))
    val incTotal = income.sumOf { it.grandTotal }
    val expTotal = exp.sumOf { it.grandTotal }
    val incMonth = income.filter { it.date.startsWith(thisMonth) }.sumOf { it.grandTotal }
    val expMonth = exp.filter { it.date.startsWith(thisMonth) }.sumOf { it.grandTotal }
    val net = incTotal - expTotal

    Column(Modifier.fillMaxSize()) {
        OfflineBanner(isOnline, isSyncing, pending)
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // Header
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    Modifier.size(48.dp).background(Indigo600, RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center,
                ) { Text("✝", color = Color.White, fontSize = 22.sp) }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text("Church Account", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = Slate900)
                    Text(LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM yyyy")), fontSize = 13.sp, color = Slate600)
                }
                Spacer(Modifier.weight(1f))
                IconButton(onClick = { vm.refresh() }) { Icon(Icons.Default.Refresh, null, tint = Slate600) }
            }

            // Stat cards
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatCard("Total Income", incTotal, "${income.size} entries · ${formatNaira(incMonth)} this month", Green600, Modifier.weight(1f))
                StatCard("Expenditure", expTotal, "${exp.size} entries · ${formatNaira(expMonth)} this month", Rose600, Modifier.weight(1f))
            }
            NetCard(net, expMonth - incMonth)

            // Quick actions
            Text("Quick Actions", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Slate900)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ActionBtn("✏️", "New Income", Green600, Modifier.weight(1f), onNewIncome)
                ActionBtn("📋", "Income Records", Indigo600, Modifier.weight(1f), onIncomeHistory)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ActionBtn("🧾", "New Exp.", Rose600, Modifier.weight(1f), onNewExp)
                ActionBtn("📊", "Exp. Records", Slate600, Modifier.weight(1f), onExpHistory)
            }

            // Recent income
            Text("Recent Income", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Slate900)
            Card(shape = RoundedCornerShape(16.dp), border = BorderStroke(1.dp, Slate200)) {
                if (income.isEmpty()) EmptyRow("No income entries yet")
                else income.take(5).forEachIndexed { i, e ->
                    RecentRow(e.date, e.serviceType, e.grandTotal, e.pending, Green600, i < minOf(4, income.size - 1))
                }
            }

            // Recent expenditure
            Text("Recent Expenditure", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Slate900)
            Card(shape = RoundedCornerShape(16.dp), border = BorderStroke(1.dp, Slate200)) {
                if (exp.isEmpty()) EmptyRow("No expenditure entries yet")
                else exp.take(5).forEachIndexed { i, e ->
                    RecentRow(e.date, e.serviceType, e.grandTotal, e.pending, Rose600, i < minOf(4, exp.size - 1))
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun StatCard(label: String, amount: Double, sub: String, color: Color, modifier: Modifier) {
    Box(modifier.background(color, RoundedCornerShape(18.dp)).padding(16.dp)) {
        Column {
            Text(label.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.8f), letterSpacing = 0.5.sp)
            Spacer(Modifier.height(4.dp))
            Text(formatNaira(amount), fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
            Spacer(Modifier.height(4.dp))
            Text(sub, fontSize = 10.sp, color = Color.White.copy(alpha = 0.75f))
        }
    }
}

@Composable
private fun NetCard(net: Double, netMonth: Double) {
    val color = if (net >= 0) Indigo600 else Orange600
    Box(Modifier.fillMaxWidth().background(color, RoundedCornerShape(18.dp)).padding(16.dp)) {
        Column {
            Text("Net Balance (Income − Expenditure)".uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.8f))
            Spacer(Modifier.height(4.dp))
            Text(formatNaira(net), fontSize = 26.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
            Text("This month: ${formatNaira(-netMonth)}", fontSize = 11.sp, color = Color.White.copy(alpha = 0.75f))
        }
    }
}

@Composable
private fun ActionBtn(icon: String, label: String, color: Color, modifier: Modifier, onClick: () -> Unit) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(80.dp),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.5.dp, color),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = color),
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(icon, fontSize = 24.sp)
            Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun RecentRow(date: String, svcType: String, amount: Double, pending: Boolean, color: Color, divider: Boolean) {
    Column {
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(date, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Slate900)
                Text(svcType + if (pending) "  ⏳" else "", fontSize = 12.sp, color = Slate600)
            }
            Text(formatNaira(amount), fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = color)
        }
        if (divider) HorizontalDivider(color = Slate200, thickness = 1.dp)
    }
}

@Composable
private fun EmptyRow(text: String) {
    Box(Modifier.fillMaxWidth().padding(20.dp), contentAlignment = Alignment.Center) {
        Text(text, color = Slate600, fontSize = 14.sp)
    }
}
