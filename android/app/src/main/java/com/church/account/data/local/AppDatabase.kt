package com.church.account.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [IncomeEntryEntity::class, ExpenditureEntryEntity::class, PendingDeletionEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun incomeDao(): IncomeDao
    abstract fun expenditureDao(): ExpenditureDao
    abstract fun pendingDeletionDao(): PendingDeletionDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null
        fun getInstance(context: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(context.applicationContext, AppDatabase::class.java, "church_account.db")
                    .build().also { INSTANCE = it }
            }
    }
}
