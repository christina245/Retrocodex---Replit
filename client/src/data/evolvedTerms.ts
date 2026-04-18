export type DirectionOfShift =
  | "Reclaimed"   // A slur or insult taken back and reframed by the affected group
  | "Reversed"    // The meaning flipped to its opposite (bad → good, or innocent → charged)
  | "Softened"    // Lost dangerous/criminal edge; became a milder or aesthetic version
  | "Diluted"     // Absorbed into mainstream use, losing specificity or original context
  | "Politicized" // Hijacked by broader political discourse; now contested across ideologies
  | "Broadened"   // Expanded beyond its original community or context to a wider audience

export interface EvolvedTerm {
  era: string              // Decade the meaning visibly shifted (e.g. "2010s")
  term: string             // Display name
  sourceUrl: string        // Linked when the term is clicked
  originatedFrom: string   // Community, genre, subculture, or language that coined it
  originalMeaning: string  // What it used to mean
  currentMeaning: string   // What it means now
  directionOfShift: DirectionOfShift
}

export const evolvedTermsPeople: EvolvedTerm[] = [
  {
    era: "2010s",
    term: "ABG (Asian Baby Girl)",
    sourceUrl: "https://aesthetics.fandom.com/wiki/Asian_Baby_Girl",
    originatedFrom: "Vietnamese American street communities (New York, Southern California)",
    originalMeaning:
      "An Asian American woman affiliated with gang culture or the import car scene.",
    currentMeaning:
      "An everyday aesthetic: dramatic makeup, bleached or ombré hair, boba tea, rave culture, and specific fashion sensibility — with no gang affiliation implied or expected. It still may be considered derogatory by some due to its association with a lower socioeconomic class.",
    directionOfShift: "Broadened",
  },
  {
    era: "2010s",
    term: "Baddie",
    sourceUrl: "https://www.revolt.tv/article/51-hip-hop-terms-that-went-mainstream",
    originatedFrom: "Black American slang, Hip-hop culture",
    originalMeaning:
      "A villain, criminal, or dangerous person — someone literally \"bad,\" often used in gang and street-culture contexts.",
    currentMeaning:
      "An attractive, confident, put-together person whose appearance commands attention. It generally may be a compliment unless intended otherwise.",
    directionOfShift: "Softened",
  },
  {
    era: "2020s",
    term: "Bimbo",
    sourceUrl: "https://en.wikipedia.org/wiki/Bimbo",
    originatedFrom: "Italian (bambino) → 1980s American tabloid culture → Gen Z TikTok (BimboTok)",
    originalMeaning:
      "A sexist insult for a conventionally attractive but unintelligent woman, weaponized especially in 1980s tabloid media. (Earlier still: a put-down for a dumb, brutish man.)",
    currentMeaning:
      "A reclaimed feminist-adjacent identity embracing hyper-femininity, bold style, and deliberate rejection of respectability politics — often politically aware and worn as a badge of pride.",
    directionOfShift: "Reclaimed",
  },
  {
    era: "2000s",
    term: "GOAT",
    sourceUrl: "https://www.dictionary.com/culture/slang/g-o-a-t",
    originatedFrom: "Sports culture / Hip-hop (popularized via Muhammad Ali's legacy and LL Cool J's 2000 album)",
    originalMeaning:
      "The animal; or colloquially, the person blamed when things go wrong — a scapegoat.",
    currentMeaning:
      "Greatest Of All Time — the highest possible compliment for anyone's skill or legacy, applied freely across sports, music, food, and everyday life.",
    directionOfShift: "Reversed",
  },
  {
    era: "2000s",
    term: "Otaku (オタク)",
    sourceUrl: "https://en.wikipedia.org/wiki/Otaku",
    originatedFrom: "Japan — stigmatized in the late 1980s after crimes linked to a self-described otaku; exported globally through anime fandom",
    originalMeaning:
      "A socially dysfunctional, antisocial person consumed by obsessive hobbies — a serious social stigma in Japan.",
    currentMeaning:
      "Globally: an enthusiastic, knowledgeable fan of anime, manga, gaming, or Japanese pop culture — used as a proud self-identifier with little negative connotation.",
    directionOfShift: "Reclaimed",
  },
  {
    era: "2010s",
    term: "OG",
    sourceUrl: "https://www.revolt.tv/article/51-hip-hop-terms-that-went-mainstream",
    originatedFrom: "Los Angeles gang culture / Hip-hop",
    originalMeaning:
      "Short for \"Original Gangster\" — a senior, respected, and feared member of a street gang.",
    currentMeaning:
      "Anyone who pioneered something or commands long-earned respect, used warmly across all contexts: sports, food, family, business. The gang origin is invisible to most current users.",
    directionOfShift: "Diluted",
  },
  {
    era: "1990s",
    term: "Queer",
    sourceUrl: "https://en.wikipedia.org/wiki/Queer",
    originatedFrom: "Early English (\"strange/odd\") → 20th-century homophobic slur → reclaimed by Queer Nation (1990) and LGBTQ+ activist communities",
    originalMeaning:
      "Strange, odd, or peculiar — a general adjective with no sexual connotation. By the late 19th century it had become a homophobic slur targeting gay men.",
    currentMeaning:
      "A reclaimed, inclusive umbrella term for LGBTQ+ identities — especially those that don't fit neatly into binary categories. Particularly embraced by Gen Z as a positive, flexible self-identifier.",
    directionOfShift: "Reclaimed",
  },
  {
    era: "2010s",
    term: "Desi",
    sourceUrl: "https://en.wikipedia.org/wiki/Desi",
    originatedFrom: "Sanskrit deśa (\"homeland\") → South Asian diaspora communities (US, UK, Canada)",
    originalMeaning:
      "In diaspora contexts: a mildly dismissive label for someone seen as too traditionally South Asian, unsophisticated, or insufficiently assimilated — \"fresh off the boat.\"",
    currentMeaning:
      "A proud pan-ethnic identifier for South Asians — anchoring music genres, fashion aesthetics, food culture, and community spaces, particularly in cities like Los Angeles, New York, and London.",
    directionOfShift: "Reclaimed",
  },
  {
    era: "1940s",
    term: "Straight",
    sourceUrl: "https://www.etymonline.com/word/straight",
    originatedFrom: "14th century English to the LGBTQIA+ community",
    originalMeaning:
      "Conventional, law-abiding",
    currentMeaning:
    'This slang definition of "straight" evolved to "straight-laced" when "straight" was claimed by the LGBTQIA+ community to mean "heterosexual."',
    directionOfShift: "Diluted",
  },
  {
    era: "2010s",
    term: "Stan",
    sourceUrl: "https://en.wikipedia.org/wiki/Stan_(slang)",
    originatedFrom: "Eminem's 2000 song \"Stan\",",
    originalMeaning:
      "A dangerously obsessive, unstable fan who spirals into violence upon not eliciting a response from their targeted idol.",
    currentMeaning:
      "Any enthusiastic, devoted fan — usually self-applied and celebratory, with no implication of danger. \"I stan\" is a positive declaration. Entered the Oxford English Dictionary in 2017.",
    directionOfShift: "Softened",
  },
  {
    era: "2010s",
    term: "Woke",
    sourceUrl: "https://en.wikipedia.org/wiki/Woke",
    originatedFrom: "African American Vernacular English (AAVE) / Civil rights tradition",
    originalMeaning:
      "Being alert to racial injustice and systemic oppression — serious political language rooted in the civil rights movement (\"stay woke\"). James Brown used it as early as 1938.",
    currentMeaning:
      "A contested buzzword. Used approvingly to commend consciousness of social justice issues; used pejoratively to mean overly sensitive or ideologically rigid.",
    directionOfShift: "Politicized",
  },
]
