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
      "A Southeast Asian-American woman affiliated with gang culture or the import car scene.  ⚠️ Several social media users insist on using the term only in its original context.",
    currentMeaning:
      "East or Southeast-Asian women with a specific aesthetic: dramatic makeup, bleached or ombré hair, boba tea, rave culture, and bold fashion — with no gang affiliation implied or expected.  ⚠️ It is often considered derogatory due to its association with a lower socioeconomic class.",
    directionOfShift: "Broadened",
  },
  {
    era: "2010s",
    term: "Baddie",
    sourceUrl: "https://www.merriam-webster.com/slang/baddie",
    originatedFrom: "Early 20th century colloquial speech → AAVE → 2010s social media",
    originalMeaning:
      "A villain, criminal, or dangerous person — someone literally \"bad,\" often used in gang and street culture contexts.",
    currentMeaning:
      "An attractive, confident, put-together woman whose appearance commands attention. It generally may be a compliment unless intended otherwise.",
    directionOfShift: "Softened",
  },
  {
    era: "2020s",
    term: "Bimbo",
    sourceUrl: "https://aesthetics.fandom.com/wiki/Bimbocore",
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
    originatedFrom: "Sports culture, hip-hop",
    originalMeaning:
      "Short for scapegoat — someone to blame when things go wrong.",
    currentMeaning:
      "Greatest Of All Time: a compliment for anyone's skill or legacy, applied freely across sports, music, food, and everyday life.",
    directionOfShift: "Reversed",
  },
  {
    era: "2000s",
    term: "Otaku (オタク)",
    sourceUrl: "https://en.wikipedia.org/wiki/Otaku",
    originatedFrom: "Japan  → exported globally through anime fandom",
    originalMeaning:
      "A socially dysfunctional, antisocial person consumed by obsessive hobbies — a serious social stigma in Japan.",
    currentMeaning:
      "Globally: an enthusiastic, knowledgeable fan of anime, manga, gaming, or Japanese pop culture. Used as a proud self-identifier with little negative connotation.",
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
      "Anyone who pioneered something, such as a subculture, commanding a respected legacy. Generally used warmly across all contexts.",
    directionOfShift: "Diluted",
  },
  {
    era: "1990s",
    term: "Queer",
    sourceUrl: "https://en.wikipedia.org/wiki/Queer",
    originatedFrom: "Early English (\"strange/odd\") → 20th-century homophobic slur → reclaimed by LGBTQIA+ communities",
    originalMeaning:
      "Strange, odd, or peculiar — a general adjective with no sexual connotation. By the late 19th century it had become a homophobic slur targeting gay men.",
    currentMeaning:
      "A reclaimed, inclusive umbrella term for identities that are not strictly heterosexual or cisgender.",
    directionOfShift: "Reclaimed",
  },
  {
    era: "2010s",
    term: "Desi",
    sourceUrl: "https://en.wikipedia.org/wiki/Desi",
    originatedFrom: "The Sanskrit word deśa (\"homeland\") → South Asian diaspora communities (US, UK, Canada)",
    originalMeaning:
      "In diaspora contexts: a mildly dismissive label for someone seen as too traditionally South Asian, unsophisticated, or insufficiently assimilated and \"fresh off the boat.\"",
    currentMeaning:
      "'Desi' is generally intended to be proud pan-ethnic identifier for the South Asians diaspora throughout the world, describing people and cultural traditions such as art and music. ⚠️ Some may not consider it inclusive enough due to disproportionate representation of North Indian cultures.",
    directionOfShift: "Reclaimed",
  },
  {
    era: "1940s",
    term: "Straight",
    sourceUrl: "https://www.etymonline.com/word/straight",
    originatedFrom: "14th century English to the LGBTQIA+ community",
    originalMeaning:
      "Conventional, law-abiding, conservative",
    currentMeaning:
    'This slang definition of "straight" evolved to "straight-laced" when "straight" was claimed by the LGBTQIA+ community to mean "heterosexual."',
    directionOfShift: "Diluted",
  },
  {
    era: "2010s",
    term: "Stan",
    sourceUrl: "https://en.wikipedia.org/wiki/Stan_(slang)",
    originatedFrom: "A 2000 song by Eminem about a stalker who kills his idol",
    originalMeaning:
      "A dangerously obsessive, unstable fan who spirals into violence upon not eliciting a response from their targeted idol.",
    currentMeaning:
      "Any enthusiastic, devoted fan, usually self-applied and celebratory, with no implication of danger. \"I stan\" is generally a positive declaration. Entered the Oxford English Dictionary in 2017.",
    directionOfShift: "Softened",
  },
  {
    era: "2010s",
    term: "Woke",
    sourceUrl: "https://en.wikipedia.org/wiki/Woke",
    originatedFrom: "African American Vernacular English (AAVE) / Civil rights tradition",
    originalMeaning:
      "Being alert to racial injustice and systemic oppression. Early usage traces back to 1938.",
    currentMeaning:
      "A contested, casual term often used similarly to its original meaning to commend consciousness of social justice issues, but is often used pejoratively to mean overly sensitive or ideologically rigid.",
    directionOfShift: "Politicized",
  },
]
