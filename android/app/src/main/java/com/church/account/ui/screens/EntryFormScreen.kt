package com.church.account.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
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
import com.church.account.ui.components.*
import com.church.account.ui.theme.*
import com.church.account.ui.viewmodel.IncomeViewModel
import com.church.account.ui.viewmodel.ExpenditureViewModel

@Composable
fun NewIncomeScreen(vm: IncomeViewModel, onSaved: () -> Unit) {
    LaunchedEffect(Unit) { vm.initEmpty() }
    val form by vm.form.collectAsStateWithLifecycle()
    LaunchedEffect(form.saved) { if (form.saved) { vm.resetSaved(); onSaved() } }

    EntryForm(
        title = "New Income Entry",
        accentColor = Green600,
        categories = Constants.INCOME_CATEGORIES,
        date = form.date, onDateChange = vm::setDate,
        serviceType = form.serviceType, onServiceTypeChange = vm::setServiceType,
        amounts = form.amounts, onAmountChange = vm::setAmount,
        saving = form.saving,
        onSave = { vm.save() },
    )
}

@Composable
fun EditIncomeScreen(vm: IncomeViewModel, entryId: Long, onSaved: () -> Unit) {
    LaunchedEffect(entryId) {
        val entry = vm.repo.getById(entryId)
        if (entry != null) vm.initForEdit(entry)
    }
    val form by vm.form.collectAsStateWithLifecycle()
    LaunchedEffect(form.saved) { if (form.saved) { vm.resetSaved(); onSaved() } }

    EntryForm(
        title = "Edit Income Entry",
        accentColor = Green600,
        categories = Constants.INCOME_CATEGORIES,
        date = form.date, onDateChange = vm::setDate,
        serviceType = form.serviceType, onServiceTypeChange = vm::setServiceType,
        amounts = form.amounts, onAmountChange = vm::setAmount,
        saving = form.saving,
        onSave = { vm.saveEdit(entryId) },
    )
}

@Composable
fun NewExpenditureScreen(vm: ExpenditureViewModel, onSaved: () -> Unit) {
    LaunchedEffect(Unit) { vm.initEmpty() }
    val form by vm.form.collectAsStateWithLifecycle()
    LaunchedEffect(form.saved) { if (form.saved) { vm.resetSaved(); onSaved() } }

    EntryForm(
        title = "New Expenditure Entry",
        accentColor = Rose600,
        categories = Constants.EXPENDITURE_CATEGORIES,
        date = form.date, onDateChange = vm::setDate,
        serviceType = form.serviceType, onServiceTypeChange = vm::setServiceType,
        amounts = form.amounts, onAmountChange = vm::setAmount,
        saving = form.saving,
        onSave = { vm.save() },
    )
}

@Composable
fun EditExpenditureScreen(vm: ExpenditureViewModel, entryId: Long, onSaved: () -> Unit) {
    LaunchedEffect(entryId) {
        val entry = vm.repo.getById(entryId)
        if (entry != null) vm.initForEdit(entry)
    }
    val form by vm.form.collectAsStateWithLifecycle()
    LaunchedEffect(form.saved) { if (form.saved) { vm.resetSaved(); onSaved() } }

    EntryForm(
        title = "Edit Expenditure",
        accentColor = Rose600,
        categories = Constants.EXPENDITURE_CATEGORIES,
        date = form.date, onDateChange = vm::setDate,
        serviceType = form.serviceType, onServiceTypeChange = vm::setServiceType,
        amounts = form.amounts, onAmountChange = vm::setAmount,
        saving = form.saving,
        onSave = { vm.saveEdit(entryId) },
    )
}

@Composable
private fun EntryForm(
    title: String,
    accentColor: Color,
    categories: List<Constants.Category>,
    date: String, onDateChange: (String) -> Unit,
    serviceType: String, onServiceTypeChange: (String) -> Unit,
    amounts: Map<String, String>, onAmountChange: (String, String) -> Unit,
    saving: Boolean,
    onSave: () -> Unit,
) {
    val churchTotal = categories.sumOf { cat -> amounts["${cat.key}_church"]?.toDoubleOrNull() ?: 0.0 }
    val projectTotal = categories.sumOf { cat -> amounts["${cat.key}_project"]?.toDoubleOrNull() ?: 0.0 }
    val grandTotal = churchTotal + projectTotal

    Box(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            // Details card
            Column(
                Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(16.dp),
            ) {
                Text(title, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = Slate900)
                Spacer(Modifier.height(12.dp))

                // Date
                OutlinedTextField(
                    value = date,
                    onValueChange = onDateChange,
                    label = { Text("Date (YYYY-MM-DD)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = accentColor),
                )
                Spacer(Modifier.height(10.dp))

                // Service type dropdown
                var svcOpen by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(expanded = svcOpen, onExpandedChange = { svcOpen = it }) {
                    OutlinedTextField(
                        value = serviceType,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Service Type") },
                        trailingIcon = { Icon(Icons.Default.ArrowDropDown, null) },
                        modifier = Modifier.fillMaxWidth().menuAnchor(),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = accentColor),
                    )
                    ExposedDropdownMenu(expanded = svcOpen, onDismissRequest = { svcOpen = false }) {
                        Constants.SERVICE_TYPES.forEach { t ->
                            DropdownMenuItem(
                                text = { Text(t, fontWeight = if (t == serviceType) FontWeight.Bold else FontWeight.Normal) },
                                onClick = { onServiceTypeChange(t); svcOpen = false },
                            )
                        }
                    }
                }
            }

            // Column headers
            Row(
                Modifier.fillMaxWidth().background(Slate50).padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Category", Modifier.weight(1.4f), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate600)
                Text("Church", Modifier.weight(1f), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate600)
                Text("Project", Modifier.weight(1f), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate600)
            }
            HorizontalDivider(color = Slate200)

            // Amount rows
            Column(Modifier.verticalScroll(rememberScrollState()).padding(bottom = 160.dp)) {
                categories.forEachIndexed { i, cat ->
                    AmountRow(
                        label = cat.label,
                        churchValue = amounts["${cat.key}_church"] ?: "",
                        projectValue = amounts["${cat.key}_project"] ?: "",
                        onChurchChange = { onAmountChange("${cat.key}_church", it) },
                        onProjectChange = { onAmountChange("${cat.key}_project", it) },
                        odd = i % 2 == 0,
                    )
                }
            }
        }

        // Sticky footer
        Column(
            Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.White)
                .border(BorderStroke(1.dp, Slate200), RoundedCornerShape(topStart = 0.dp, topEnd = 0.dp))
                .padding(horizontal = 16.dp, vertical = 12.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TotalChip("Church", churchTotal, Slate50, Slate900, Modifier.weight(1f))
                TotalChip("Project", projectTotal, Slate50, Slate900, Modifier.weight(1f))
                TotalChip("Grand Total", grandTotal, accentColor, Color.White, Modifier.weight(1f))
            }
            Spacer(Modifier.height(10.dp))
            Button(
                onClick = onSave,
                enabled = !saving,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = accentColor),
            ) {
                if (saving) CircularProgressIndicator(color = Color.White, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
                else Text("Save Entry", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}

@Composable
private fun TotalChip(label: String, amount: Double, bg: Color, textColor: Color, modifier: Modifier) {
    Column(modifier.background(bg, RoundedCornerShape(10.dp)).padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label.uppercase(), fontSize = 9.sp, fontWeight = FontWeight.Bold, color = textColor.copy(alpha = 0.7f))
        Text(formatNaira(amount), fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = textColor)
    }
}
