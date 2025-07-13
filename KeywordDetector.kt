package com.example.boycottalert

object KeywordDetector {
    private val brands = listOf("Pepsi", "Nestle", "Starbucks", "Nike", "Coca Cola", "McDonald's", "Apple", "Amazon", "Google", "Meta")
    fun detectBrand(text: String): String? {
        return brands.firstOrNull { text.contains(it, ignoreCase = true) }
    }
}
