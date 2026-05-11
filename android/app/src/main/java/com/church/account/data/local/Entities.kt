package com.church.account.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "income_entries")
data class IncomeEntryEntity(
    @PrimaryKey val id: Long,           // negative = temp (offline-created)
    val date: String,
    @ColumnInfo(name = "service_type") val serviceType: String,
    val amounts: String,                // JSON: {"offering_church":5000.0, ...}
    @ColumnInfo(name = "total_church") val totalChurch: Double,
    @ColumnInfo(name = "total_project") val totalProject: Double,
    @ColumnInfo(name = "grand_total") val grandTotal: Double,
    val pending: Boolean = false,
    @ColumnInfo(name = "sync_action") val syncAction: String? = null, // POST or PUT
)

@Entity(tableName = "expenditure_entries")
data class ExpenditureEntryEntity(
    @PrimaryKey val id: Long,
    val date: String,
    @ColumnInfo(name = "service_type") val serviceType: String,
    val amounts: String,
    @ColumnInfo(name = "total_church") val totalChurch: Double,
    @ColumnInfo(name = "total_project") val totalProject: Double,
    @ColumnInfo(name = "grand_total") val grandTotal: Double,
    val pending: Boolean = false,
    @ColumnInfo(name = "sync_action") val syncAction: String? = null,
)

@Entity(tableName = "pending_deletions")
data class PendingDeletionEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val type: String,       // "income" or "expenditure"
    @ColumnInfo(name = "server_id") val serverId: Long,
)
