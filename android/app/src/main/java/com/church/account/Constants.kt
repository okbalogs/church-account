package com.church.account

object Constants {
    data class Category(val key: String, val label: String)

    val INCOME_CATEGORIES = listOf(
        Category("offering", "Offering"),
        Category("tithe", "Tithe"),
        Category("sunday_school", "Sunday School"),
        Category("covenant_offering", "Covenant Offering"),
        Category("thanksgiving", "Thanksgiving"),
        Category("holy_communion", "Holy Communion"),
        Category("special_thanksgiving", "Special Thanksgiving/Gift"),
        Category("fellowship", "Fellowship"),
        Category("dedication", "Dedication"),
        Category("sow_a_seed", "Sow A Seed"),
        Category("pastors_appreciation", "Pastor's Appreciation"),
        Category("harvest", "Harvest"),
        Category("project_support", "Project Support"),
        Category("lcc", "LCC"),
    )

    val EXPENDITURE_CATEGORIES = listOf(
        Category("transportation", "Transportation"),
        Category("premise", "Premise"),
        Category("percent25", "25%"),
        Category("gift", "Gift"),
        Category("battery", "Battery"),
        Category("fuel", "Fuel"),
        Category("electricity", "Electricity"),
        Category("lcc_dcc", "LCC/DCC"),
        Category("entertainment", "Entertainment"),
        Category("pastors_appreciation", "Pastor's Appreciation"),
        Category("stationeries", "Stationeries"),
        Category("accessories", "Accessories"),
        Category("phcn", "PHCN"),
        Category("assessment", "Assessment"),
    )

    val SERVICE_TYPES = listOf(
        "First Service", "Second Service", "Third Service",
        "Combined Service", "Special Service", "Youth Service", "Children Service",
    )
}
