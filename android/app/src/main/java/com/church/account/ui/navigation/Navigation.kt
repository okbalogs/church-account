package com.church.account.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.church.account.ui.screens.*
import com.church.account.ui.theme.*
import com.church.account.ui.viewmodel.*

sealed class Tab(val route: String, val label: String, val icon: ImageVector) {
    object Dashboard : Tab("dashboard", "Dashboard", Icons.Default.Home)
    object NewIncome : Tab("new_income", "Income", Icons.Default.Add)
    object IncomeHistory : Tab("income_history", "Records", Icons.Default.List)
    object NewExp : Tab("new_exp", "Expense", Icons.Default.RemoveCircle)
    object ExpHistory : Tab("exp_history", "Exp. List", Icons.Default.BarChart)
}

val tabs = listOf(Tab.Dashboard, Tab.NewIncome, Tab.IncomeHistory, Tab.NewExp, Tab.ExpHistory)

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val dashVm: DashboardViewModel = viewModel(factory = DashboardViewModel.Factory)
    val incVm: IncomeViewModel = viewModel(factory = IncomeViewModel.Factory)
    val expVm: ExpenditureViewModel = viewModel(factory = ExpenditureViewModel.Factory)

    val navBackStack by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStack?.destination?.route

    val showTabs = tabs.any { it.route == currentRoute }

    Scaffold(
        bottomBar = {
            if (showTabs) {
                NavigationBar {
                    tabs.forEach { tab ->
                        val selected = currentRoute == tab.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(tab.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, tab.label) },
                            label = { Text(tab.label) },
                            colors = NavigationBarItemDefaults.colors(indicatorColor = Indigo100),
                        )
                    }
                }
            }
        }
    ) { padding ->
        NavHost(navController, startDestination = Tab.Dashboard.route) {
            composable(Tab.Dashboard.route) {
                DashboardScreen(
                    vm = dashVm,
                    onNewIncome = { navController.navigate(Tab.NewIncome.route) },
                    onIncomeHistory = { navController.navigate(Tab.IncomeHistory.route) },
                    onNewExp = { navController.navigate(Tab.NewExp.route) },
                    onExpHistory = { navController.navigate(Tab.ExpHistory.route) },
                )
            }
            composable(Tab.NewIncome.route) {
                NewIncomeScreen(vm = incVm, onSaved = { navController.navigate(Tab.IncomeHistory.route) })
            }
            composable(Tab.IncomeHistory.route) {
                IncomeHistoryScreen(vm = incVm, onEdit = { id -> navController.navigate("edit_income/$id") })
            }
            composable(Tab.NewExp.route) {
                NewExpenditureScreen(vm = expVm, onSaved = { navController.navigate(Tab.ExpHistory.route) })
            }
            composable(Tab.ExpHistory.route) {
                ExpenditureHistoryScreen(vm = expVm, onEdit = { id -> navController.navigate("edit_exp/$id") })
            }
            composable("edit_income/{id}", arguments = listOf(navArgument("id") { type = NavType.LongType })) {
                val id = it.arguments!!.getLong("id")
                EditIncomeScreen(vm = incVm, entryId = id, onSaved = { navController.popBackStack() })
            }
            composable("edit_exp/{id}", arguments = listOf(navArgument("id") { type = NavType.LongType })) {
                val id = it.arguments!!.getLong("id")
                EditExpenditureScreen(vm = expVm, entryId = id, onSaved = { navController.popBackStack() })
            }
        }
    }
}
