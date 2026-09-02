package com.akaar.core.data.taxonomy

import com.akaar.core.domain.model.Craft
import com.akaar.core.domain.model.Translatable

/**
 * The craft vocabulary, bundled with the app.
 *
 * The offline strategy calls for taxonomy browse and search to work with no
 * network, because an artisan picking her craft is the very first thing that
 * happens and the one thing that must never fail. These entries mirror
 * supabase/migrations/..._seed_taxonomy.sql; the server copy stays the
 * authority and refreshes this by version check.
 *
 * Facts only - craft name, the regions it is practised in, and care guidance.
 * No heritage or authenticity claims, here or anywhere else.
 */
object BundledTaxonomy {

    val categories: List<Craft> = listOf(
        craft("textiles", null, "Textiles and weaving", "वस्त्र एवं बुनाई"),
        craft("embroidery", null, "Embroidery", "कढ़ाई"),
        craft("pottery", null, "Pottery and clay", "मिट्टी के बर्तन"),
        craft("metalwork", null, "Metal craft", "धातु शिल्प"),
        craft("woodwork", null, "Wood craft", "काष्ठ शिल्प"),
        craft("painting", null, "Traditional painting", "पारंपरिक चित्रकला"),
        craft("cane-bamboo", null, "Cane and bamboo", "बांस एवं बेंत"),
    )

    val crafts: List<Craft> = listOf(
        craft("banarasi-weaving", "textiles", "Banarasi weaving", "बनारसी बुनाई", "Uttar Pradesh"),
        craft("chanderi-weaving", "textiles", "Chanderi weaving", "चंदेरी बुनाई", "Madhya Pradesh"),
        craft("ikat-weaving", "textiles", "Ikat weaving", "इकत बुनाई", "Telangana", "Odisha", "Gujarat"),
        craft("pashmina-weaving", "textiles", "Pashmina weaving", "पश्मीना बुनाई", "Jammu and Kashmir", "Ladakh"),
        craft("bandhani", "textiles", "Bandhani tie-dye", "बांधनी", "Gujarat", "Rajasthan"),
        craft("ajrakh-printing", "textiles", "Ajrakh block printing", "अजरख छपाई", "Gujarat", "Rajasthan"),
        craft("kashidakari", "embroidery", "Kashidakari embroidery", "कशीदाकारी", "Rajasthan", "Jammu and Kashmir"),
        craft("chikankari", "embroidery", "Chikankari embroidery", "चिकनकारी", "Uttar Pradesh"),
        craft("phulkari", "embroidery", "Phulkari embroidery", "फुलकारी", "Punjab", "Haryana"),
        craft("kantha", "embroidery", "Kantha embroidery", "कांथा", "West Bengal", "Odisha"),
        craft("blue-pottery", "pottery", "Blue pottery", "नीली मिट्टी के बर्तन", "Rajasthan"),
        craft("terracotta", "pottery", "Terracotta craft", "टेराकोटा शिल्प", "West Bengal", "Tamil Nadu", "Uttar Pradesh"),
        craft("black-pottery", "pottery", "Black pottery", "काली मिट्टी के बर्तन", "Manipur", "Himachal Pradesh"),
        craft("bidriware", "metalwork", "Bidriware", "बिदरी", "Karnataka"),
        craft("dhokra", "metalwork", "Dhokra metal casting", "ढोकरा", "Chhattisgarh", "West Bengal", "Odisha", "Jharkhand"),
        craft("brass-work", "metalwork", "Brass work", "पीतल का काम", "Uttar Pradesh", "Gujarat"),
        craft("wood-carving", "woodwork", "Wood carving", "लकड़ी की नक्काशी", "Uttar Pradesh", "Kerala", "Karnataka"),
        craft("channapatna-toys", "woodwork", "Channapatna lacquered toys", "चन्नपटना खिलौने", "Karnataka"),
        craft("madhubani", "painting", "Madhubani painting", "मधुबनी चित्रकला", "Bihar"),
        craft("warli", "painting", "Warli painting", "वारली चित्रकला", "Maharashtra"),
        craft("pattachitra", "painting", "Pattachitra", "पट्टचित्र", "Odisha", "West Bengal"),
        craft("gond-art", "painting", "Gond painting", "गोंड चित्रकला", "Madhya Pradesh"),
        craft("kalamkari", "painting", "Kalamkari", "कलमकारी", "Andhra Pradesh", "Telangana"),
        craft("bamboo-craft", "cane-bamboo", "Bamboo craft", "बांस शिल्प", "Assam", "Tripura", "Meghalaya"),
        craft("cane-furniture", "cane-bamboo", "Cane furniture", "बेंत का फर्नीचर", "Assam", "Kerala"),
    )

    fun craftsIn(categorySlug: String) = crafts.filter { it.parentId == categorySlug }

    fun search(query: String, lang: String): List<Craft> {
        if (query.isBlank()) return crafts
        val q = query.trim().lowercase()
        return crafts.filter {
            it.nameEn.lowercase().contains(q) || it.nameHi.contains(q) || it.slug.contains(q)
        }
    }

    fun bySlug(slug: String): Craft? = (crafts + categories).firstOrNull { it.slug == slug }

    private fun craft(
        slug: String, parent: String?, en: String, hi: String, vararg regions: String,
    ) = Craft(
        id = slug, slug = slug, parentId = parent,
        nameEn = en, nameHi = hi,
        regions = regions.toList(), care = Translatable(),
    )
}

/** States offered in the region step. Districts are typed or spoken. */
object IndianStates {
    val all = listOf(
        "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
        "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
        "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    )
}
