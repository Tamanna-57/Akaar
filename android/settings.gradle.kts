pluginManagement {
    repositories {
        google { content { includeGroupByRegex("com\\.android.*"); includeGroupByRegex("com\\.google.*"); includeGroupByRegex("androidx.*") } }
        mavenCentral()
        maven("https://maven-central.storage-download.googleapis.com/maven2/")
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Google's mirror of Maven Central. Kept as a fallback because the
        // primary host rate-limits CI and sandboxed builds.
        maven("https://maven-central.storage-download.googleapis.com/maven2/")
    }
}

rootProject.name = "Akaar"

include(":app")
include(":core:common")
include(":core:designsystem")
include(":core:domain")
include(":core:data")
include(":feature:onboarding")
include(":feature:seller")
include(":feature:buyer")
include(":feature:cluster")
include(":feature:shared")
