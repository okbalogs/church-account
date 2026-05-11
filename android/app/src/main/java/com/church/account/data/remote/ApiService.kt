package com.church.account.data.remote

import com.google.gson.JsonArray
import com.google.gson.JsonObject
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @GET("api/entries")
    suspend fun getIncomeEntries(): Response<JsonArray>

    @POST("api/entries")
    suspend fun createIncomeEntry(@Body body: JsonObject): Response<JsonObject>

    @PUT("api/entries/{id}")
    suspend fun updateIncomeEntry(@Path("id") id: Long, @Body body: JsonObject): Response<JsonObject>

    @DELETE("api/entries/{id}")
    suspend fun deleteIncomeEntry(@Path("id") id: Long): Response<Unit>

    @GET("api/expenditure")
    suspend fun getExpenditureEntries(): Response<JsonArray>

    @POST("api/expenditure")
    suspend fun createExpenditureEntry(@Body body: JsonObject): Response<JsonObject>

    @PUT("api/expenditure/{id}")
    suspend fun updateExpenditureEntry(@Path("id") id: Long, @Body body: JsonObject): Response<JsonObject>

    @DELETE("api/expenditure/{id}")
    suspend fun deleteExpenditureEntry(@Path("id") id: Long): Response<Unit>
}
