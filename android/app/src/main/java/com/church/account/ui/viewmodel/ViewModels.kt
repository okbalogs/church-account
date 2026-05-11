package com.church.account.ui.viewmodel

import android.app.Application
import androidx.lifecycle.*
import com.church.account.ChurchApp
import com.church.account.Constants
import com.church.account.data.local.IncomeEntryEntity
import com.church.account.data.local.ExpenditureEntryEntity
import com.church.account.data.repository.IncomeRepository
import com.church.account.data.repository.ExpenditureRepository
import com.church.account.sync.SyncManager
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

// ── Shared form state ─────────────────────────────────────────────────────────

data class FormState(
    val date: String = java.time.LocalDate.now().toString(),
    val serviceType: String = Constants.SERVICE_TYPES[0],
    val amounts: Map<String, String> = emptyMap(),
    val saving: Boolean = false,
    val saved: Boolean = false,
    val error: String? = null,
)

fun FormState.amountsAsDoubles(): Map<String, Double> =
    amounts.mapValues { (_, v) -> v.toDoubleOrNull() ?: 0.0 }

// ── Dashboard ViewModel ───────────────────────────────────────────────────────

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as ChurchApp
    val incomeEntries = app.incomeRepo.entries.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())
    val expEntries = app.expenditureRepo.entries.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())
    val isOnline = app.syncManager.isOnline
    val isSyncing = app.syncManager.isSyncing

    val pendingCount = combine(incomeEntries, expEntries) { inc, exp ->
        inc.count { it.pending } + exp.count { it.pending }
    }.stateIn(viewModelScope, SharingStarted.Eagerly, 0)

    fun refresh() = viewModelScope.launch { app.syncManager.flushAndRefresh() }

    companion object { val Factory = viewModelFactory { initializer { DashboardViewModel(this[APPLICATION_KEY]!!) } } }
}

// ── Income ViewModel ──────────────────────────────────────────────────────────

class IncomeViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as ChurchApp
    val repo: IncomeRepository = app.incomeRepo
    val entries = repo.entries.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())
    val isOnline = app.syncManager.isOnline
    val isSyncing = app.syncManager.isSyncing
    val pendingCount = entries.map { it.count { e -> e.pending } }
        .stateIn(viewModelScope, SharingStarted.Eagerly, 0)

    private val _form = MutableStateFlow(FormState())
    val form: StateFlow<FormState> = _form

    fun initEmpty() {
        val amounts = buildMap {
            Constants.INCOME_CATEGORIES.forEach { cat ->
                put("${cat.key}_church", ""); put("${cat.key}_project", "")
            }
        }
        _form.value = FormState(amounts = amounts)
    }

    fun initForEdit(entry: IncomeEntryEntity) {
        val raw = repo.getAmounts(entry)
        val amounts = raw.mapValues { (_, v) -> if (v == 0.0) "" else v.toLong().toString() }
        _form.value = FormState(date = entry.date, serviceType = entry.serviceType, amounts = amounts)
    }

    fun setDate(d: String) { _form.update { it.copy(date = d) } }
    fun setServiceType(s: String) { _form.update { it.copy(serviceType = s) } }
    fun setAmount(key: String, value: String) { _form.update { it.copy(amounts = it.amounts + (key to value)) } }

    fun save() = viewModelScope.launch {
        _form.update { it.copy(saving = true, error = null) }
        val f = _form.value
        repo.save(-System.currentTimeMillis(), f.date, f.serviceType, f.amountsAsDoubles())
        app.syncManager.refreshIfOnline()
        _form.update { it.copy(saving = false, saved = true) }
    }

    fun saveEdit(id: Long) = viewModelScope.launch {
        _form.update { it.copy(saving = true, error = null) }
        val f = _form.value
        repo.update(id, f.date, f.serviceType, f.amountsAsDoubles())
        app.syncManager.refreshIfOnline()
        _form.update { it.copy(saving = false, saved = true) }
    }

    fun delete(id: Long) = viewModelScope.launch {
        repo.delete(id)
        app.syncManager.refreshIfOnline()
    }

    fun resetSaved() { _form.update { it.copy(saved = false) } }

    companion object { val Factory = viewModelFactory { initializer { IncomeViewModel(this[APPLICATION_KEY]!!) } } }
}

// ── Expenditure ViewModel ─────────────────────────────────────────────────────

class ExpenditureViewModel(application: Application) : AndroidViewModel(application) {
    private val app = application as ChurchApp
    val repo: ExpenditureRepository = app.expenditureRepo
    val entries = repo.entries.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())
    val isOnline = app.syncManager.isOnline
    val isSyncing = app.syncManager.isSyncing
    val pendingCount = entries.map { it.count { e -> e.pending } }
        .stateIn(viewModelScope, SharingStarted.Eagerly, 0)

    private val _form = MutableStateFlow(FormState())
    val form: StateFlow<FormState> = _form

    fun initEmpty() {
        val amounts = buildMap {
            Constants.EXPENDITURE_CATEGORIES.forEach { cat ->
                put("${cat.key}_church", ""); put("${cat.key}_project", "")
            }
        }
        _form.value = FormState(amounts = amounts)
    }

    fun initForEdit(entry: ExpenditureEntryEntity) {
        val raw = repo.getAmounts(entry)
        val amounts = raw.mapValues { (_, v) -> if (v == 0.0) "" else v.toLong().toString() }
        _form.value = FormState(date = entry.date, serviceType = entry.serviceType, amounts = amounts)
    }

    fun setDate(d: String) { _form.update { it.copy(date = d) } }
    fun setServiceType(s: String) { _form.update { it.copy(serviceType = s) } }
    fun setAmount(key: String, value: String) { _form.update { it.copy(amounts = it.amounts + (key to value)) } }

    fun save() = viewModelScope.launch {
        _form.update { it.copy(saving = true, error = null) }
        val f = _form.value
        repo.save(-System.currentTimeMillis(), f.date, f.serviceType, f.amountsAsDoubles())
        app.syncManager.refreshIfOnline()
        _form.update { it.copy(saving = false, saved = true) }
    }

    fun saveEdit(id: Long) = viewModelScope.launch {
        _form.update { it.copy(saving = true, error = null) }
        val f = _form.value
        repo.update(id, f.date, f.serviceType, f.amountsAsDoubles())
        app.syncManager.refreshIfOnline()
        _form.update { it.copy(saving = false, saved = true) }
    }

    fun delete(id: Long) = viewModelScope.launch {
        repo.delete(id)
        app.syncManager.refreshIfOnline()
    }

    fun resetSaved() { _form.update { it.copy(saved = false) } }

    companion object { val Factory = viewModelFactory { initializer { ExpenditureViewModel(this[APPLICATION_KEY]!!) } } }
}
