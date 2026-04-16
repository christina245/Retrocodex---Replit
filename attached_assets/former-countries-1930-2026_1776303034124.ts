/**
 * former-countries-1930-2026.ts
 * Data for the "List of Former Countries (1930–2026)" page on theretrocodex.com
 *
 * Ended By terms map to the colour-coded legend:
 *   Split / Dissolved        →  'Split' | 'Dissolved'
 *   Merged / Unified         →  'Merged'
 *   Reunified                →  'Reunified'
 *   Annexed                  →  'Annexed'
 *   Military Defeat          →  'Military Defeat' | 'Independence War' | 'Independence Transition' | 'Reintegrated'
 *   Renamed                  →  'Renamed'
 *
 * Summary field: max 250 characters.
 */

export type EndedBy =
  | 'Split'
  | 'Dissolved'
  | 'Merged'
  | 'Reunified'
  | 'Annexed'
  | 'Military Defeat'
  | 'Independence War'
  | 'Independence Transition'
  | 'Reintegrated'
  | 'Renamed';

export interface FormerCountry {
  /** Year (or year range) the nation ceased to exist, e.g. "1991" or "1991–1992" */
  yearEnded: string;
  formerNation: string;
  /** Optional formal or alternative name */
  altName?: string;
  /** Year the nation was established or first internationally recognised */
  yearEstablished: string;
  /** Present-day nation(s) that occupy the same territory */
  presentNations: string;
  endedBy: EndedBy;
  /** Max 250 characters */
  summary: string;
}

export const formerCountries: FormerCountry[] = [

  // ── 1930s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1935',
    formerNation: 'Persia',
    altName: 'Imperial State of Persia',
    yearEstablished: '1501',
    presentNations: 'Iran',
    endedBy: 'Renamed',
    summary: `Reza Shah formally requested foreign governments use 'Iran' — the name used domestically — instead of the Greco-Roman exonym 'Persia.' The change signalled rising nationalism and the Pahlavi monarchy's push to modernize its international image.`,
  },

  {
    yearEnded: '1938',
    formerNation: 'Austrian First Republic',
    yearEstablished: '1919',
    presentNations: 'Germany (annexed); independent Austria restored 1945',
    endedBy: 'Annexed',
    summary: `Annexed by Nazi Germany in the Anschluss of March 1938, driven by internal fascist pressure and German coercion. Though presented as a popular union, significant intimidation was involved. Austria was re-established as an independent state in 1945.`,
  },

  {
    yearEnded: '1939',
    formerNation: 'Siam',
    altName: 'Kingdom of Siam',
    yearEstablished: '1238',
    presentNations: 'Thailand',
    endedBy: 'Renamed',
    summary: `Prime Minister Phibunsongkhram renamed the country Thailand in 1939 as part of a nationalist agenda emphasising Tai identity and unity. It briefly reverted to Siam (1945–1949) following WWII, before the name Thailand was permanently restored.`,
  },

  {
    yearEnded: '1939',
    formerNation: 'Second Spanish Republic',
    yearEstablished: '1931',
    presentNations: 'Spain (Francoist State, 1939–1975; Kingdom of Spain thereafter)',
    endedBy: 'Military Defeat',
    summary: `The democratically elected Republic was overthrown after three years of brutal civil war. Nationalist forces backed by Nazi Germany and Fascist Italy defeated the Republicans; Francisco Franco ruled Spain as a dictator until his death in 1975.`,
  },

  // ── 1940s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1945',
    formerNation: 'Manchukuo',
    altName: 'State of Manchuria / Manchukuo Empire',
    yearEstablished: '1932',
    presentNations: "People's Republic of China (Manchuria / Northeast China)",
    endedBy: 'Military Defeat',
    summary: `A Japanese puppet state in northeast China (Manchuria), established after Japan's 1931 invasion. Ostensibly led by China's last Qing emperor Puyi but entirely controlled by Japan. Dissolved upon Japan's WWII defeat; territory reverted to China.`,
  },

  {
    yearEnded: '1945',
    formerNation: 'Third Reich',
    altName: 'Nazi Germany / Greater German Reich',
    yearEstablished: '1933',
    presentNations: 'West Germany (FRG) and East Germany (GDR); reunified as Federal Republic of Germany 1990',
    endedBy: 'Military Defeat',
    summary: `Nazi Germany was defeated in May 1945, ending twelve years of totalitarian rule responsible for the Holocaust and WWII. Germany was split into four Allied occupation zones, which became West Germany (FRG) and East Germany (GDR).`,
  },

  {
    yearEnded: '1946',
    formerNation: 'Kingdom of Italy',
    yearEstablished: '1861',
    presentNations: 'Italian Republic',
    endedBy: 'Renamed',
    summary: `Following Italy's defeat in WWII and the collapse of Mussolini's fascist government, Italians voted in a 1946 referendum to abolish the monarchy. On June 2 — now Italy's Republic Day — the Kingdom of Italy became the Italian Republic.`,
  },

  {
    yearEnded: '1947',
    formerNation: 'British India',
    altName: 'British Raj',
    yearEstablished: '1858',
    presentNations: 'India, Pakistan (Bangladesh subsequently separated from Pakistan in 1971)',
    endedBy: 'Split',
    summary: `The British Raj was partitioned into India and Pakistan in August 1947. The partition triggered one of history's largest mass migrations and severe sectarian violence that killed an estimated 200,000 to 2 million people.`,
  },

  {
    yearEnded: '1949',
    formerNation: 'Netherlands East Indies',
    yearEstablished: '1800',
    presentNations: 'Republic of Indonesia',
    endedBy: 'Independence War',
    summary: `Indonesian nationalists declared independence in 1945 after Japan's defeat. A four-year war against returning Dutch forces followed. The Netherlands formally recognized Indonesian sovereignty in December 1949 under sustained international pressure.`,
  },

  // ── 1950s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1950',
    formerNation: 'Tibet',
    altName: 'De facto independent state, 1913–1950',
    yearEstablished: '1913',
    presentNations: "People's Republic of China (Tibet Autonomous Region)",
    endedBy: 'Annexed',
    summary: `Tibet was de facto independent from 1913 until the PRC's 1950 invasion. After a failed 1959 uprising, the Dalai Lama fled to India and has led a government-in-exile from Dharamsala since. No UN member state formally recognizes Tibetan independence.`,
  },

  {
    yearEnded: '1954',
    formerNation: 'French Indochina',
    yearEstablished: '1887',
    presentNations: 'Vietnam (North and South), Laos, Cambodia',
    endedBy: 'Split',
    summary: `France's colonial federation — covering present-day Vietnam, Laos, and Cambodia — dissolved after defeat at Dien Bien Phu. The 1954 Geneva Accords divided Vietnam at the 17th parallel and recognized Laos and Cambodia as fully independent states.`,
  },

  // ── 1960s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1962',
    formerNation: 'Ruanda-Urundi',
    altName: 'Belgian trust territory',
    yearEstablished: '1916',
    presentNations: 'Rwanda, Burundi',
    endedBy: 'Split',
    summary: `Belgium's trust territory split into Rwanda and Burundi in 1962. Colonial policies had intentionally intensified Hutu–Tutsi ethnic divisions — a key contributing factor in the 1994 Rwandan genocide, in which approximately 800,000 were killed.`,
  },

  {
    yearEnded: '1964',
    formerNation: 'Tanganyika',
    yearEstablished: '1961',
    presentNations: 'United Republic of Tanzania',
    endedBy: 'Merged',
    summary: `The East African republic merged with the newly independent island of Zanzibar in April 1964 to form Tanzania — a portmanteau of both countries' names. The union followed Zanzibar's January revolution, which had overthrown its Arab sultanate.`,
  },

  {
    yearEnded: '1964',
    formerNation: 'Zanzibar',
    altName: "People's Republic of Zanzibar",
    yearEstablished: '1963',
    presentNations: 'United Republic of Tanzania (retains significant internal autonomy)',
    endedBy: 'Merged',
    summary: `Shortly after independence in December 1963, revolution overthrew Zanzibar's Arab sultan. The new Afro-Shirazi government negotiated union with Tanganyika, creating Tanzania in April 1964. Zanzibar retains significant internal autonomy today.`,
  },

  // ── 1970s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1970',
    formerNation: 'Republic of Biafra',
    yearEstablished: '1967',
    presentNations: 'Nigeria',
    endedBy: 'Military Defeat',
    summary: `Nigeria's Igbo-majority southeast declared independence in 1967 following military coups and anti-Igbo violence. The civil war lasted 30 months; some 1–3 million died, the majority from famine deliberately weaponized by the Nigerian government.`,
  },

  {
    yearEnded: '1971',
    formerNation: 'East Pakistan',
    yearEstablished: '1947',
    presentNations: 'Bangladesh',
    endedBy: 'Independence War',
    summary: `Declared independence as Bangladesh in 1971 after years of Bengali marginalization. Pakistani forces killed an estimated 300,000–3 million people. India intervened militarily, and Bangladesh was internationally recognized by December 1971.`,
  },

  {
    yearEnded: '1971',
    formerNation: 'United Arab Republic',
    altName: 'UAR; joint Egypt–Syria state 1958–1961',
    yearEstablished: '1958',
    presentNations: 'Egypt (Arab Republic of Egypt), Syria',
    endedBy: 'Renamed',
    summary: `Egypt and Syria merged in 1958 under Nasser's pan-Arab vision. Syria withdrew in 1961 following a coup, disillusioned by Egyptian dominance. Egypt retained the UAR name until 1971, when Sadat renamed the country the Arab Republic of Egypt.`,
  },

  {
    yearEnded: '1972',
    formerNation: 'Ceylon',
    altName: 'Dominion of Ceylon',
    yearEstablished: '1948',
    presentNations: 'Sri Lanka',
    endedBy: 'Renamed',
    summary: `Ceylon gained independence in 1948 as a Commonwealth dominion. In 1972, a new republican constitution removed the Crown as head of state and renamed the country the Republic of Sri Lanka, asserting its pre-colonial Sinhalese heritage.`,
  },

  {
    yearEnded: '1975',
    formerNation: 'South Vietnam',
    altName: 'Republic of Vietnam',
    yearEstablished: '1955',
    presentNations: 'Socialist Republic of Vietnam',
    endedBy: 'Military Defeat',
    summary: `South Vietnam fell to North Vietnamese forces on April 30, 1975 — the Fall of Saigon — following the U.S. withdrawal under the Paris Peace Accords. In 1976, the two Vietnams were formally unified as the Socialist Republic of Vietnam.`,
  },

  {
    yearEnded: '1975',
    formerNation: 'Kingdom of Sikkim',
    yearEstablished: '1642',
    presentNations: "India (22nd state)",
    endedBy: 'Annexed',
    summary: `The Himalayan kingdom came under increasing Indian political pressure in the early 1970s. A 1975 referendum — disputed by exiled royalists — voted for incorporation into India as its 22nd state. The monarchy was abolished and the king deposed.`,
  },

  {
    yearEnded: '1976',
    formerNation: 'North Vietnam',
    altName: 'Democratic Republic of Vietnam',
    yearEstablished: '1945',
    presentNations: 'Socialist Republic of Vietnam',
    endedBy: 'Merged',
    summary: `Following military victory over South Vietnam, Hanoi formally unified the country. On July 2, 1976, the Socialist Republic of Vietnam was proclaimed, ending North Vietnam's existence as a separate state.`,
  },

  // ── 1980s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1980',
    formerNation: 'Rhodesia',
    altName: 'Also "Zimbabwe Rhodesia" (1979)',
    yearEstablished: '1965',
    presentNations: 'Republic of Zimbabwe',
    endedBy: 'Independence Transition',
    summary: `Rhodesia's 1965 UDI was never internationally recognized. Years of guerrilla war (the Bush War) and international sanctions led to the Lancaster House Agreement. Majority-rule elections produced Zimbabwe, declared independent on April 18, 1980.`,
  },

  {
    yearEnded: '1984',
    formerNation: 'Upper Volta',
    altName: 'Republic of Upper Volta',
    yearEstablished: '1960',
    presentNations: 'Burkina Faso',
    endedBy: 'Renamed',
    summary: `Renamed Burkina Faso in August 1984 by revolutionary leader Thomas Sankara. The new name means 'Land of Incorruptible People' in both Mossi and Dioula, and symbolized a radical socialist break from the country's French colonial past.`,
  },

  {
    yearEnded: '1989',
    formerNation: 'Burma',
    altName: 'Union of Burma',
    yearEstablished: '1948',
    presentNations: 'Myanmar',
    endedBy: 'Renamed',
    summary: `In 1989, the military junta renamed the country Myanmar and the capital Rangoon to Yangon, without a referendum. The change remains contested: many governments, opposition groups, and Aung San Suu Kyi's party continued to use 'Burma' for years.`,
  },

  {
    yearEnded: '1989',
    formerNation: 'Kampuchea',
    altName: "Democratic Kampuchea / People's Republic of Kampuchea",
    yearEstablished: '1975',
    presentNations: 'Kingdom of Cambodia',
    endedBy: 'Renamed',
    summary: `Cambodia was renamed Democratic Kampuchea under the Khmer Rouge (1975–79), during which up to 2 million were killed. After Vietnam's invasion it became the People's Republic of Kampuchea (1979–89), before the name Cambodia was restored.`,
  },

  // ── 1990s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1990',
    formerNation: 'East Germany',
    altName: 'German Democratic Republic (GDR)',
    yearEstablished: '1949',
    presentNations: 'Federal Republic of Germany',
    endedBy: 'Reunified',
    summary: `The Berlin Wall's fall in 1989 triggered the rapid collapse of East Germany's communist government and mass emigration westward. On October 3, 1990, East Germany acceded to the Federal Republic of Germany — now celebrated as German Unity Day.`,
  },

  {
    yearEnded: '1990',
    formerNation: 'South Yemen',
    altName: "People's Democratic Republic of Yemen",
    yearEstablished: '1967',
    presentNations: 'Republic of Yemen',
    endedBy: 'Merged',
    summary: `The only Marxist state in the Arab world, South Yemen suffered economic collapse after losing Soviet patronage in the late 1980s. It merged with North Yemen on May 22, 1990, forming the Republic of Yemen. A failed southern secession followed in 1994.`,
  },

  {
    yearEnded: '1990',
    formerNation: 'North Yemen',
    altName: 'Yemen Arab Republic',
    yearEstablished: '1962',
    presentNations: 'Republic of Yemen',
    endedBy: 'Merged',
    summary: `The Yemen Arab Republic negotiated unity with South Yemen in 1990 as South Yemen's economy collapsed. North Yemen's Ali Abdullah Saleh became the first president of unified Yemen, which has since been engulfed in a devastating civil war.`,
  },

  {
    yearEnded: '1991',
    formerNation: 'Soviet Union',
    altName: 'Union of Soviet Socialist Republics (USSR)',
    yearEstablished: '1922',
    presentNations: 'Russia, Ukraine, Belarus, and 12 other independent republics',
    endedBy: 'Split',
    summary: `Economic stagnation, failed reforms, and independence movements brought down the USSR. The Belavezha Accords, signed by Russia, Ukraine, and Belarus in December 1991, formally dissolved it into 15 independent successor states.`,
  },

  {
    yearEnded: '1991–1992',
    formerNation: 'Yugoslavia',
    altName: 'Socialist Federal Republic of Yugoslavia',
    yearEstablished: '1945',
    presentNations: 'Slovenia, Croatia, Bosnia-Herzegovina, North Macedonia, Serbia, Montenegro, Kosovo',
    endedBy: 'Split',
    summary: `Communist collapse and ethnic nationalism sparked brutal wars of succession. Yugoslavia broke into Slovenia, Croatia, Bosnia-Herzegovina, North Macedonia, and a rump state that became the Federal Republic of Yugoslavia (later Serbia and Montenegro).`,
  },

  {
    yearEnded: '1992',
    formerNation: 'Czechoslovakia',
    yearEstablished: '1918',
    presentNations: 'Czech Republic (Czechia), Slovakia',
    endedBy: 'Split',
    summary: `Disagreements between Czech and Slovak leaders over the federal structure led to a negotiated dissolution. On January 1, 1993 — in the 'Velvet Divorce' — the Czech Republic and Slovakia became independent states; no public referendum was held.`,
  },

  {
    yearEnded: '1994',
    formerNation: 'South African Bantustans',
    altName: 'Transkei (1976), Bophuthatswana (1977), Venda (1979), Ciskei (1981)',
    yearEstablished: '1976',
    presentNations: 'South Africa',
    endedBy: 'Reintegrated',
    summary: `The four apartheid homelands — Transkei, Bophuthatswana, Venda, and Ciskei — were created to strip Black South Africans of citizenship. Recognized only by South Africa, all four were reintegrated following the democratic elections of April 1994.`,
  },

  {
    yearEnded: '1997',
    formerNation: 'Zaire',
    yearEstablished: '1971',
    presentNations: 'Democratic Republic of the Congo (DRC)',
    endedBy: 'Renamed',
    summary: `Mobutu renamed the country Zaire in 1971 as part of his 'Authenticité' Africanization campaign — even renaming himself from Joseph-Désiré Mobutu. When Kabila's forces overthrew him in 1997, the name was restored to Democratic Republic of the Congo.`,
  },

  // ── 2000s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '2003',
    formerNation: 'Federal Republic of Yugoslavia',
    yearEstablished: '1992',
    presentNations: 'Serbia and Montenegro (itself dissolved in 2006 into Serbia and Montenegro)',
    endedBy: 'Renamed',
    summary: `The FRY — comprising Serbia and Montenegro — was renamed in 2003 under a looser constitutional charter. The original name was contested internationally as an implicit claim to be the sole successor to the former Yugoslav federation.`,
  },

  {
    yearEnded: '2006',
    formerNation: 'Serbia and Montenegro',
    altName: 'Formerly Federal Republic of Yugoslavia (1992–2003)',
    yearEstablished: '2003',
    presentNations: 'Serbia, Montenegro',
    endedBy: 'Split',
    summary: `Montenegro declared independence on June 3, 2006, after a referendum in which 55.5% voted yes — just above the EU-required 55% threshold. Both became separate UN member states. Kosovo subsequently declared independence from Serbia in 2008.`,
  },

  // ── 2010s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '2010',
    formerNation: 'Netherlands Antilles',
    yearEstablished: '1954',
    presentNations: 'Curaçao, Sint Maarten (autonomous countries); Bonaire, Sint Eustatius, Saba (Dutch special municipalities)',
    endedBy: 'Dissolved',
    summary: `Failing to agree on a reformed federation, the islands dissolved on October 10, 2010. Curaçao and Sint Maarten became autonomous countries within the Kingdom of the Netherlands; Bonaire, Sint Eustatius, and Saba became special Dutch municipalities.`,
  },

];
