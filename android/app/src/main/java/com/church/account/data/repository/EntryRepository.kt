package com.church.account.data.repository

import com.church.account.Constants
import com.church.account.data.local.*
import com.church.account.data.remote.ApiService
import com.google.gson.JsonObject
import kotlinx.coroutines.flow.Flow

// Converts a flat API JsonObject into a local entity.
// Categories is the list to use (INCOME_CATEGORIES or EXPENDITURE_CATEGORIES).
private fun jsonToAmounts(obj: JsonObject, categories: List<Constants.Category>): Map<String, Double> {
    val map = mutableMapOf<String, Double>()
    for (cat in categories) {
        map["${cat.key}_church"] = obj.get("${cat.key}_church")?.asDouble ?: 0.0
        map["${cat.key}_project"] = obj.get("${cat.key}_project")?.asDouble ?: 0.0
    }
    return map
}

private fun amountsToJson(
    date: String,
    serviceType: String,
    amounts: Map<String, Double>,
): JsonObject = JsonObject().also { obj ->
    obj.addProperty("date", date)
    obj.addProperty("service_type", serviceType)
    amounts.forEach { (k, v) -> obj.addProperty(k, v) }
}

private val gson = com.google.gson.Gson()
private fun amountsToString(map: Map<String, Double>) = gson.toJson(map)!!
@Suppress("UNCHECKED_CAST")
private fun stringToAmounts(s: String): Map<String, Double> =
    gson.fromJson(s, Map::class.java) as Map<String, Double>

// ── Income ───────────────────────────────────────────────────────────────────

class IncomeRepository(
    private val dao: IncomeDao,
    private val deletionDao: PendingDeletionDao,
    private val api: ApiService,
) {
    val entries: Flow<List<IncomeEntryEntity>> = dao.getAllEntries()

    private fun jsonToEntity(obj: JsonObject): IncomeEntryEntity {
        val amounts = jsonToAmounts(obj, Constants.INCOME_CATEGORIES)
        return IncomeEntryEntity(
            id = obj.get("id").asLong,
            date = obj.get("date").asString,
            serviceType = obj.get("service_type").asString,
            amounts = amountsToString(amounts),
            totalChurch = amounts.filterKeys { it.endsWith("_church") }.values.sum(),
            totalProject = amounts.filterKeys { it.endsWith("_project") }.values.sum(),
            grandTotal = obj.get("grand_total")?.asDouble ?: amounts.values.sum(),
            pending = false,
        )
    }

    suspend fun syncFromServer(): Boolean {
        return try {
            val resp = api.getIncomeEntries()
            if (resp.isSuccessful) {
                val serverEntries = resp.body()?.map { jsonToEntity(it.asJsonObject) } ?: emptyList()
                dao.deleteNonPending()
                dao.insertAll(serverEntries)
                true
            } else false
        } catch (_: Exception) { false }
    }

    suspend fun save(
        tempId: Long,
        date: String,
        serviceType: String,
        amounts: Map<String, Double>,
    ) {
        val church = amounts.filterKeys { it.endsWith("_church") }.values.sum()
        val project = amounts.filterKeys { it.endsWith("_project") }.values.sum()
        val entity = IncomeEntryEntity(
            id = tempId,
            date = date,
            serviceType = serviceType,
            amounts = amountsToString(amounts),
            totalChurch = church,
            totalProject = project,
            grandTotal = church + project,
            pending = true,
            syncAction = "POST",
        )
        dao.insert(entity)
        try {
            val body = amountsToJson(date, serviceType, amounts)
            val resp = api.createIncomeEntry(body)
            if (resp.isSuccessful) {
                dao.deleteById(tempId)
                dao.insert(jsonToEntity(resp.body()!!))
            }
        } catch (_: Exception) { /* stays pending */ }
    }

    suspend fun update(id: Long, date: String, serviceType: String, amounts: Map<String, Double>) {
        val church = amounts.filterKeys { it.endsWith("_church") }.values.sum()
        val project = amounts.filterKeys { it.endsWith("_project") }.values.sum()
        val entity = IncomeEntryEntity(
            id = id,
            date = date,
            serviceType = serviceType,
            amounts = amountsToString(amounts),
            totalChurch = church,
            totalProject = project,
            grandTotal = church + project,
            pending = true,
            syncAction = "PUT",
        )
        dao.insert(entity)
        try {
            val body = amountsToJson(date, serviceType, amounts)
            val resp = api.updateIncomeEntry(id, body)
            if (resp.isSuccessful) {
                dao.insert(entity.copy(pending = false, syncAction = null))
            }
        } catch (_: Exception) { /* stays pending */ }
    }

    suspend fun delete(id: Long) {
        dao.deleteById(id)
        if (id > 0) {
            try {
                val resp = api.deleteIncomeEntry(id)
                if (!resp.isSuccessful) {
                    deletionDao.insert(PendingDeletionEntity(type = "income", serverId = id))
                }
            } catch (_: Exception) {
                deletionDao.insert(PendingDeletionEntity(type = "income", serverId = id))
            }
        }
    }

    suspend fun getById(id: Long): IncomeEntryEntity? = dao.getById(id)

    fun getAmounts(entity: IncomeEntryEntity): Map<String, Double> = stringToAmounts(entity.amounts)

    suspend fun flushPending(deletionDao: PendingDeletionDao) {
        // Flush pending POSTs and PUTs
        for (entry in dao.getPendingEntries()) {
            try {
                val amounts = stringToAmounts(entry.amounts)
                val body = amountsToJson(entry.date, entry.serviceType, amounts)
                val resp = when (entry.syncAction) {
                    "POST" -> api.createIncomeEntry(body).also { r ->
                        if (r.isSuccessful) {
                            dao.deleteById(entry.id)
                            dao.insert(jsonToEntity(r.body()!!))
                        }
                    }
                    "PUT" -> api.updateIncomeEntry(entry.id, body).also { r ->
                        if (r.isSuccessful) dao.insert(entry.copy(pending = false, syncAction = null))
                    }
                    else -> null
                }
                if (resp?.isSuccessful == false) return
            } catch (_: Exception) { return }
        }
        // Flush pending DELETEs
        for (del in deletionDao.getByType("income")) {
            try {
                val resp = api.deleteIncomeEntry(del.serverId)
                if (resp.isSuccessful) deletionDao.deleteById(del.id)
                else return
            } catch (_: Exception) { return }
        }
    }
}

// ── Expenditure ───────────────────────────────────────────────────────────────

class ExpenditureRepository(
    private val dao: ExpenditureDao,
    private val deletionDao: PendingDeletionDao,
    private val api: ApiService,
) {
    val entries: Flow<List<ExpenditureEntryEntity>> = dao.getAllEntries()

    private fun jsonToEntity(obj: JsonObject): ExpenditureEntryEntity {
        val amounts = jsonToAmounts(obj, Constants.EXPENDITURE_CATEGORIES)
        return ExpenditureEntryEntity(
            id = obj.get("id").asLong,
            date = obj.get("date").asString,
            serviceType = obj.get("service_type").asString,
            amounts = amountsToString(amounts),
            totalChurch = amounts.filterKeys { it.endsWith("_church") }.values.sum(),
            totalProject = amounts.filterKeys { it.endsWith("_project") }.values.sum(),
            grandTotal = obj.get("grand_total")?.asDouble ?: amounts.values.sum(),
            pending = false,
        )
    }

    suspend fun syncFromServer(): Boolean {
        return try {
            val resp = api.getExpenditureEntries()
            if (resp.isSuccessful) {
                val serverEntries = resp.body()?.map { jsonToEntity(it.asJsonObject) } ?: emptyList()
                dao.deleteNonPending()
                dao.insertAll(serverEntries)
                true
            } else false
        } catch (_: Exception) { false }
    }

    suspend fun save(tempId: Long, date: String, serviceType: String, amounts: Map<String, Double>) {
        val church = amounts.filterKeys { it.endsWith("_church") }.values.sum()
        val project = amounts.filterKeys { it.endsWith("_project") }.values.sum()
        val entity = ExpenditureEntryEntity(
            id = tempId, date = date, serviceType = serviceType,
            amounts = amountsToString(amounts), totalChurch = church, totalProject = project,
            grandTotal = church + project, pending = true, syncAction = "POST",
        )
        dao.insert(entity)
        try {
            val body = amountsToJson(date, serviceType, amounts)
            val resp = api.createExpenditureEntry(body)
            if (resp.isSuccessful) { dao.deleteById(tempId); dao.insert(jsonToEntity(resp.body()!!)) }
        } catch (_: Exception) {}
    }

    suspend fun update(id: Long, date: String, serviceType: String, amounts: Map<String, Double>) {
        val church = amounts.filterKeys { it.endsWith("_church") }.values.sum()
        val project = amounts.filterKeys { it.endsWith("_project") }.values.sum()
        val entity = ExpenditureEntryEntity(
            id = id, date = date, serviceType = serviceType,
            amounts = amountsToString(amounts), totalChurch = church, totalProject = project,
            grandTotal = church + project, pending = true, syncAction = "PUT",
        )
        dao.insert(entity)
        try {
            val resp = api.updateExpenditureEntry(id, amountsToJson(date, serviceType, amounts))
            if (resp.isSuccessful) dao.insert(entity.copy(pending = false, syncAction = null))
        } catch (_: Exception) {}
    }

    suspend fun delete(id: Long) {
        dao.deleteById(id)
        if (id > 0) {
            try {
                val resp = api.deleteExpenditureEntry(id)
                if (!resp.isSuccessful)
                    deletionDao.insert(PendingDeletionEntity(type = "expenditure", serverId = id))
            } catch (_: Exception) {
                deletionDao.insert(PendingDeletionEntity(type = "expenditure", serverId = id))
            }
        }
    }

    suspend fun getById(id: Long): ExpenditureEntryEntity? = dao.getById(id)

    fun getAmounts(entity: ExpenditureEntryEntity): Map<String, Double> = stringToAmounts(entity.amounts)

    suspend fun flushPending(deletionDao: PendingDeletionDao) {
        for (entry in dao.getPendingEntries()) {
            try {
                val amounts = stringToAmounts(entry.amounts)
                val body = amountsToJson(entry.date, entry.serviceType, amounts)
                when (entry.syncAction) {
                    "POST" -> api.createExpenditureEntry(body).also { r ->
                        if (r.isSuccessful) { dao.deleteById(entry.id); dao.insert(jsonToEntity(r.body()!!)) }
                        else return
                    }
                    "PUT" -> api.updateExpenditureEntry(entry.id, body).also { r ->
                        if (r.isSuccessful) dao.insert(entry.copy(pending = false, syncAction = null))
                        else return
                    }
                }
            } catch (_: Exception) { return }
        }
        for (del in deletionDao.getByType("expenditure")) {
            try {
                val resp = api.deleteExpenditureEntry(del.serverId)
                if (resp.isSuccessful) deletionDao.deleteById(del.id) else return
            } catch (_: Exception) { return }
        }
    }
}
