package com.church.account

import android.app.Application
import com.church.account.data.local.AppDatabase
import com.church.account.data.remote.ApiClient
import com.church.account.data.repository.ExpenditureRepository
import com.church.account.data.repository.IncomeRepository
import com.church.account.sync.SyncManager

class ChurchApp : Application() {
    val db by lazy { AppDatabase.getInstance(this) }
    val incomeRepo by lazy { IncomeRepository(db.incomeDao(), db.pendingDeletionDao(), ApiClient.apiService) }
    val expenditureRepo by lazy { ExpenditureRepository(db.expenditureDao(), db.pendingDeletionDao(), ApiClient.apiService) }
    val syncManager by lazy { SyncManager(incomeRepo, expenditureRepo, db.pendingDeletionDao(), this) }
}
