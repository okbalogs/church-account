package com.church.account.sync

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import com.church.account.data.repository.ExpenditureRepository
import com.church.account.data.repository.IncomeRepository
import com.church.account.data.local.PendingDeletionDao
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class SyncManager(
    private val incomeRepo: IncomeRepository,
    private val expenditureRepo: ExpenditureRepository,
    private val deletionDao: PendingDeletionDao,
    context: Context,
) {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val _isOnline = MutableStateFlow(false)
    val isOnline: StateFlow<Boolean> = _isOnline

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing

    private val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    init {
        _isOnline.value = isConnected()
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        cm.registerNetworkCallback(request, object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                _isOnline.value = true
                scope.launch { flushAndRefresh() }
            }
            override fun onLost(network: Network) {
                _isOnline.value = isConnected()
            }
        })
    }

    private fun isConnected(): Boolean {
        val net = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(net) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    suspend fun flushAndRefresh() {
        if (!isConnected()) return
        _isSyncing.value = true
        try {
            incomeRepo.flushPending(deletionDao)
            expenditureRepo.flushPending(deletionDao)
            incomeRepo.syncFromServer()
            expenditureRepo.syncFromServer()
        } finally {
            _isSyncing.value = false
        }
    }

    fun refreshIfOnline() {
        if (isConnected()) scope.launch { flushAndRefresh() }
    }
}
