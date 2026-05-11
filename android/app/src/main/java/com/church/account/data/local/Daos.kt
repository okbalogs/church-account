package com.church.account.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface IncomeDao {
    @Query("SELECT * FROM income_entries ORDER BY date DESC, id DESC")
    fun getAllEntries(): Flow<List<IncomeEntryEntity>>

    @Query("SELECT * FROM income_entries ORDER BY date DESC, id DESC")
    suspend fun getAllEntriesOnce(): List<IncomeEntryEntity>

    @Query("SELECT * FROM income_entries WHERE id = :id")
    suspend fun getById(id: Long): IncomeEntryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: IncomeEntryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(entries: List<IncomeEntryEntity>)

    @Update
    suspend fun update(entry: IncomeEntryEntity)

    @Query("DELETE FROM income_entries WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("SELECT * FROM income_entries WHERE pending = 1")
    suspend fun getPendingEntries(): List<IncomeEntryEntity>

    @Query("DELETE FROM income_entries WHERE pending = 0")
    suspend fun deleteNonPending()
}

@Dao
interface ExpenditureDao {
    @Query("SELECT * FROM expenditure_entries ORDER BY date DESC, id DESC")
    fun getAllEntries(): Flow<List<ExpenditureEntryEntity>>

    @Query("SELECT * FROM expenditure_entries ORDER BY date DESC, id DESC")
    suspend fun getAllEntriesOnce(): List<ExpenditureEntryEntity>

    @Query("SELECT * FROM expenditure_entries WHERE id = :id")
    suspend fun getById(id: Long): ExpenditureEntryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: ExpenditureEntryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(entries: List<ExpenditureEntryEntity>)

    @Update
    suspend fun update(entry: ExpenditureEntryEntity)

    @Query("DELETE FROM expenditure_entries WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("SELECT * FROM expenditure_entries WHERE pending = 1")
    suspend fun getPendingEntries(): List<ExpenditureEntryEntity>

    @Query("DELETE FROM expenditure_entries WHERE pending = 0")
    suspend fun deleteNonPending()
}

@Dao
interface PendingDeletionDao {
    @Insert
    suspend fun insert(deletion: PendingDeletionEntity)

    @Query("SELECT * FROM pending_deletions WHERE type = :type")
    suspend fun getByType(type: String): List<PendingDeletionEntity>

    @Query("DELETE FROM pending_deletions WHERE id = :id")
    suspend fun deleteById(id: Int)
}
