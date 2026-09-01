plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.hilt) apply false
}

/**
 * Seller and buyer are two roles in one app. They meet through :core:domain and
 * :feature:shared, never through each other. The moment one imports the other,
 * the two halves fuse and neither can be worked on independently again - which
 * is the delivery risk this whole project is arranged to avoid.
 *
 * Convention will not hold this line on its own, so the build enforces it.
 */
val forbiddenEdges = listOf(
    ":feature:seller" to ":feature:buyer",
    ":feature:buyer" to ":feature:seller",
)

tasks.register("checkModuleBoundaries") {
    group = "verification"
    description = "Fails if :feature:seller and :feature:buyer depend on each other."
    doLast {
        val violations = mutableListOf<String>()
        forbiddenEdges.forEach { (fromPath, toPath) ->
            val from = project.findProject(fromPath) ?: return@forEach
            from.configurations
                .filter { it.name.endsWith("Implementation", ignoreCase = true) || it.name.endsWith("Api", ignoreCase = true) }
                .forEach { config ->
                    config.dependencies
                        .filterIsInstance<ProjectDependency>()
                        .filter { it.path == toPath }
                        .forEach { violations += "$fromPath depends on $toPath (via ${config.name})" }
                }
        }
        if (violations.isNotEmpty()) {
            throw GradleException(
                "Module boundary violated:\n" + violations.joinToString("\n") { "  - $it" } +
                    "\n\nShared code belongs in :core:domain or :feature:shared."
            )
        }
        logger.lifecycle("Module boundaries ok: seller and buyer are independent.")
    }
}

tasks.register("check") { dependsOn("checkModuleBoundaries") }
