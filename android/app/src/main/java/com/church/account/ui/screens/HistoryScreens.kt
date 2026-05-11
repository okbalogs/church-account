package com.church.account.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.church.account.Constants
import com.church.account.data.local.IncomeEntryEntity
import com.church.account.data.local.ExpenditureEntryEntity
import com.church.account.ui.components.*
import com.church.account.ui.theme.*
import com.church.account.ui.viewmodel.IncomeViewModel
import com.church.account.ui.viewmodel.ExpenditureViewModel

@Composable
fun IncomeHistoryScreen(vm: IncomeViewModel, onEdit: (Long) -> Unit) {
    val entries by vm.entries.collectAsStateWithLifecycle()
    val isOnline by vm.isOnline.collectAsStateWithLifecycle()
    val isSyncing by vm.isSyncing.collectAsStateWithLifecycle()
    val pending by vm.pendingCount.collectAsStateWithLifecycle()

    HistoryList(
        title = "Income Records",
        isOnline = isOnline, isSyncing = isSyncing, pendingCount = pending,
        headerColor = Green600,
        overallTotal = entries.sumOf { it.grandTotal },
        count = entries.size,
        isEmpty = entries.isEmpty(),
        emptyIcon = "📋",
    ) {
        itemsIndexed(entries) { i, entry ->
            IncomeCard(entry, vm, onEdit, i < entries.size - 1)
        }
    }
}

@Composable
fun ExpenditureHistoryScreen(vm: ExpenditureViewModel, onEdit: (Long) -> Unit) {
    val entries by vm.entries.collectAsStateWithLifecycle()
    val isOnline by vm.isOnline.collectAsStateWithLifecycle()
    val isSyncing by vm.isSyncing.collectAsStateWithLifecycle()
    val pending by vm.pendingCount.collectAsStateWithLifecycle()

    HistoryList(
        title = "Expenditure Records",
        isOnline = isOnline, isSyncing = isSyncing, pendingCount = pending,
        headerColor = Rose600,
        overallTotal = entries.sumOf { it.grandTotal },
        count = entries.size,
        isEmpty = entries.isEmpty(),
        emptyIcon = "📊",
    ) {
        itemsIndexed(entries) { i, entry ->
            ExpenditureCard(entry, vm, onEdit, i < entries.size - 1)
        }
    }
}

@Composable
private fun HistoryList(
    title: String,
    isOnline: Boolean, isSyncing: Boolean, pendingCount: Int,
    headerColor: Color,
    overallTotal: Double,
    count: Int,
    isEmpty: Boolean,
    emptyIcon: String,
    content: androidx.compose.foundation.lazy.LazyListScope.() -> Unit,
) {
    Column(Modifier.fillMaxSize()) {
        OfflineBanner(isOnline, isSyncing, pendingCount)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item {
                Text(title, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = Slate900)
                Text("$count record${if (count != 1) "s" else ""}", fontSize = 13.sp, color = Slate600)
                Spacer(Modifier.height(4.dp))
                if (!isEmpty) {
                    Box(Modifier.fillMaxWidth().background(headerColor, RoundedCornerShape(18.dp)).padding(18.dp)) {
                        Column {
                            Text("Overall Total".uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.8f))
                            Text(formatNaira(overallTotal), fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                        }
                    }
                }
            }
            if (isEmpty) {
                item {
                    Column(Modifier.fillMaxWidth().padding(top = 64.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(emptyIcon, fontSize = 52.sp)
                        Spacer(Modifier.height(12.dp))
                        Text("No records yet", fontSize = 16.sp, color = Slate600)
                    }
                }
            } else {
                content()
            }
        }
    }
}

@Composable
private fun IncomeCard(entry: IncomeEntryEntity, vm: IncomeViewModel, onEdit: (Long) -> Unit, divider: Boolean) {
    var expanded by remember { mutableStateOf(false) }
    var showDelete by remember { mutableStateOf(false) }
    val amounts = vm.repo.getAmounts(entry)

    EntryCard(
        date = entry.date, serviceType = entry.serviceType,
        grandTotal = entry.grandTotal, pending = entry.pending,
        totalChurch = entry.totalChurch, totalProject = entry.totalProject,
        accentColor = Green600,
        expanded = expanded,
        onToggle = { expanded = !expanded },
        categories = Constants.INCOME_CATEGORIES,
        amounts = amounts,
        onEdit = { onEdit(entry.id) },
        onDelete = { showDelete = true },
    )
    if (showDelete) {
        AlertDialog(
            onDismissRequest = { showDelete = false },
            title = { Text("Delete Entry") },
            text = { Text("Delete income entry for ${entry.date}?") },
            confirmButton = {
                TextButton(onClick = { vm.delete(entry.id); showDelete = false }) {
                    Text("Delete", color = Rose600)
                }
            },
            dismissButton = { TextButton(onClick = { showDelete = false }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun ExpenditureCard(entry: ExpenditureEntryEntity, vm: ExpenditureViewModel, onEdit: (Long) -> Unit, divider: Boolean) {
    var expanded by remember { mutableStateOf(false) }
    var showDelete by remember { mutableStateOf(false) }
    val amounts = vm.repo.getAmounts(entry)

    EntryCard(
        date = entry.date, serviceType = entry.serviceType,
        grandTotal = entry.grandTotal, pending = entry.pending,
        totalChurch = entry.totalChurch, totalProject = entry.totalProject,
        accentColor = Rose600,
        expanded = expanded,
        onToggle = { expanded = !expanded },
        categories = Constants.EXPENDITURE_CATEGORIES,
        amounts = amounts,
        onEdit = { onEdit(entry.id) },
        onDelete = { showDelete = true },
    )
    if (showDelete) {
        AlertDialog(
            onDismissRequest = { showDelete = false },
            title = { Text("Delete Entry") },
            text = { Text("Delete expenditure entry for ${entry.date}?") },
            confirmButton = {
                TextButton(onClick = { vm.delete(entry.id); showDelete = false }) {
                    Text("Delete", color = Rose600)
                }
            },
            dismissButton = { TextButton(onClick = { showDelete = false }) { Text("Cancel") } },
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun EntryCard(
    date: String, serviceType: String, grandTotal: Double, pending: Boolean,
    totalChurch: Double, totalProject: Double, accentColor: Color,
    expanded: Boolean, onToggle: () -> Unit,
    categories: List<Constants.Category>, amounts: Map<String, Double>,
    onEdit: () -> Unit, onDelete: () -> Unit,
) {
    val borderColor = if (pending) Amber600 else Slate200
    Column(
        Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(BorderStroke(if (pending) 1.5.dp else 1.dp, borderColor), RoundedCornerShape(16.dp))
            .clickable(onClick = onToggle)
            .padding(16.dp),
    ) {
        Row(verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(date, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Slate900)
                    if (pending) Text("⏳", fontSize = 13.sp)
                }
                Spacer(Modifier.height(4.dp))
                Box(
                    Modifier.background(accentColor.copy(alpha = 0.1f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 10.dp, vertical = 3.dp),
                ) { Text(serviceType, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = accentColor) }
            }
            Text(formatNaira(grandTotal), fontWeight = FontWeight.ExtraBold, fontSize = 17.sp, color = accentColor)
        }

        if (expanded) {
            Spacer(Modifier.height(12.dp))
            // Category chips
            val nonZero = categories.filter { cat ->
                (amounts["${cat.key}_church"] ?: 0.0) > 0 || (amounts["${cat.key}_project"] ?: 0.0) > 0
            }
            if (nonZero.isNotEmpty()) {
                FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    nonZero.forEach { cat ->
                        val total = (amounts["${cat.key}_church"] ?: 0.0) + (amounts["${cat.key}_project"] ?: 0.0)
                        Box(Modifier.background(Slate50, RoundedCornerShape(8.dp)).padding(horizontal = 8.dp, vertical = 4.dp)) {
                            Text("${cat.label}: ${formatNaira(total)}", fontSize = 12.sp, color = Slate600)
                        }
                    }
                }
                Spacer(Modifier.height(10.dp))
            }
            // Sub-totals
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SubTotalBox("Church", totalChurch, Slate50, Slate900, Modifier.weight(1f))
                SubTotalBox("Project", totalProject, Slate50, Slate900, Modifier.weight(1f))
                SubTotalBox("Total", grandTotal, accentColor, Color.White, Modifier.weight(1f))
            }
            Spacer(Modifier.height(10.dp))
            // Action buttons
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(onClick = onEdit, modifier = Modifier.weight(1f), border = BorderStroke(1.5.dp, Indigo600)) {
                    Text("Edit", color = Indigo600, fontWeight = FontWeight.Bold)
                }
                OutlinedButton(onClick = onDelete, modifier = Modifier.weight(1f), border = BorderStroke(1.5.dp, Rose600)) {
                    Text("Delete", color = Rose600, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun SubTotalBox(label: String, amount: Double, bg: Color, textColor: Color, modifier: Modifier) {
    Column(modifier.background(bg, RoundedCornerShape(10.dp)).padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label.uppercase(), fontSize = 9.sp, fontWeight = FontWeight.Bold, color = textColor.copy(alpha = 0.7f))
        Text(formatNaira(amount), fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = textColor)
    }
}
