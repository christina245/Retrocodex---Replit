/**
 * formerCountries.ts
 * Data for the "List of Former Countries (1930–2026)" page on theretrocodex.com
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
  yearEnded: string;
  formerNation: string;
  altName?: string;
  yearEstablished: string;
  presentNations: string;
  endedBy: EndedBy;
  summary: string;
  sourceUrl?: string;
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
    summary: `A nationalist agenda sought to shed the Greco-Roman colonial exonym of Persia and assert the name Persians had always used domestically. Iran was chosen to restore the nation's historical legacy with a name that was relatively free of outside control.`,
    sourceUrl: 'https://www.historyhit.com/when-did-persia-become-iran-and-why/',
  },

  {
    yearEnded: '1938',
    formerNation: 'First Austrian Republic',
    yearEstablished: '1919',
    presentNations: 'Germany (annexed); independent Austria restored 1945',
    endedBy: 'Annexed',
    summary: `Post-WWI economic devastation, domestic fascism, and pan-German nationalist sentiment eroded Austrian sovereignty. The democratic republic lacked the political will or military strength to resist Hitler's expansionist agenda.`,
  },

  {
    yearEnded: '1939',
    formerNation: 'Siam',
    altName: 'Kingdom of Siam',
    yearEstablished: '1238',
    presentNations: 'Thailand',
    endedBy: 'Renamed',
    summary: `The Thai dictator Phibun sought to shed the antiquated colonial name. The name Thailand was also purposely chosen to be exclusionary to the Chinese population within the country.`,
    sourceUrl: 'https://www.historytoday.com/archive/months-past/siam-becomes-thailand'
  },

 

  // ── 1940s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1945',
    formerNation: 'Manchukuo',
    altName: 'State of Manchuria / Manchukuo Empire',
    yearEstablished: '1932',
    presentNations: "China",
    endedBy: 'Military Defeat',
    summary: `Manchukuo was a puppet state in northeastern China controlled by the Japanese. It collapsed when it was invaded by the Soviets and when Japan was defeated in World War II in 1945.`,
    sourceUrl: 'https://www.nippon.com/en/in-depth/d00815/',
  },

  {
    yearEnded: '1946',
    formerNation: 'Kingdom of Italy',
    yearEstablished: '1861',
    presentNations: 'Italy',
    endedBy: 'Renamed',
    summary: `The monarchy had enabled Mussolini's 1922 rise to power and was deeply complicit in Italy's disastrous WWII losses. Italians, disgusted by its collaboration with fascism, voted to abolish the institution in a 1946 referendum and establish a republic.`,
  },

  {
    yearEnded: '1947',
    formerNation: 'British India',
    altName: 'British Raj',
    yearEstablished: '1858',
    presentNations: 'India, Pakistan, Bangladesh',
    endedBy: 'Split',
    summary: `After India became independent of the British in 1947, it sought to divide along religious lines to separate Hindus and Muslims. However, the demarcation was rushed, messy, and harmful, for example cutting through and dividing the Sikh population in the state of Punjab.`,
    sourceUrl: 'https://www.britannica.com/event/Partition-of-India',
  },

  {
    yearEnded: '1949',
    formerNation: 'Dutch East Indies',
    yearEstablished: '1800',
    presentNations: 'Republic of Indonesia',
    endedBy: 'Independence War',
    summary: `Japan's wartime occupation had destroyed the myth of Dutch colonial invincibility. Sukarno's independence movement had broad mass support, and sustained US and UN pressure made military reconquest politically untenable for the Netherlands.`,
    sourceUrl: 'https://www.britannica.com/place/Dutch-East-Indies',
      },
 

  // ── 1950s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1950',
    formerNation: 'Tibet',
    altName: 'De facto independent state, 1913–1950',
    yearEstablished: '1913',
    presentNations: "People's Republic of China (Tibet Autonomous Region)",
    endedBy: 'Annexed',
    summary: `China had never accepted Tibetan independence as legitimate. Tibet's military weakness, geographic isolation, and complete lack of international support — no major power was willing to confront Mao's China over Tibet — left it unable to resist.`,
  },

  {
    yearEnded: '1954',
    formerNation: 'French Indochina',
    yearEstablished: '1887',
    presentNations: 'Vietnam (North and South), Laos, Cambodia',
    endedBy: 'Split',
    summary: `Ho Chi Minh's Viet Minh blended nationalist and communist appeal with effective guerrilla tactics. French public opinion tired of a costly unwinnable war, and the catastrophic defeat at Dien Bien Phu destroyed remaining political will to continue.`,
  },

  // ── 1960s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1962',
    formerNation: 'Ruanda-Urundi',
    altName: 'Belgian trust territory',
    yearEstablished: '1916',
    presentNations: 'Rwanda, Burundi',
    endedBy: 'Split',
    summary: `Belgium had always administered Rwanda and Burundi as legally distinct kingdoms with separate ethnic and political dynamics. UN-driven decolonization pressure left splitting them into two independent states as the only practical path to independence.`,
  },

  {
    yearEnded: '1964',
    formerNation: 'Tanganyika',
    yearEstablished: '1961',
    presentNations: 'United Republic of Tanzania',
    endedBy: 'Merged',
    summary: `Nyerere's pan-African vision and strategic concern about Cold War influence from revolutionary Zanzibar made union attractive. Tanganyika saw stability and regional authority as the gains from absorbing the volatile island.`,
  },

  {
    yearEnded: '1964',
    formerNation: 'Zanzibar',
    altName: "People's Republic of Zanzibar",
    yearEstablished: '1963',
    presentNations: 'United Republic of Tanzania (retains significant internal autonomy)',
    endedBy: 'Merged',
    summary: `Centuries of Arab minority domination over an African majority had created explosive resentment. After revolution toppled the Arab sultan, the new government sought the security and legitimacy of mainland union to consolidate its hold on power.`,
  },

  // ── 1970s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1970',
    formerNation: 'Republic of Biafra',
    yearEstablished: '1967',
    presentNations: 'Nigeria',
    endedBy: 'Military Defeat',
    summary: `Anti-Igbo pogroms in 1966 convinced Igbo leaders that survival required separation. The federal government refused to negotiate, and control of the oil-rich east made both sides fight to the end. Nigeria's superior size and resources prevailed.`,
  },

  {
    yearEnded: '1971',
    formerNation: 'East Pakistan',
    yearEstablished: '1947',
    presentNations: 'Bangladesh',
    endedBy: 'Independence War',
    summary: `East Pakistan's Awami League won the 1970 elections outright, but the military junta refused to hand over power. Decades of discrimination and economic exploitation meant only full independence would satisfy Bengali leaders.`,
  },

  {
    yearEnded: '1971',
    formerNation: 'United Arab Republic',
    altName: 'UAR; joint Egypt–Syria state 1958–1961',
    yearEstablished: '1958',
    presentNations: 'Egypt (Arab Republic of Egypt), Syria',
    endedBy: 'Renamed',
    summary: `Nasser imposed Egyptian dominance over Syria, generating deep resentment among Syrian officers who staged a coup in 1961. The union had been driven by ideology rather than genuine integration and had no structural foundation.`,
  },

  {
    yearEnded: '1972',
    formerNation: 'Ceylon',
    altName: 'Dominion of Ceylon',
    yearEstablished: '1948',
    presentNations: 'Sri Lanka',
    endedBy: 'Renamed',
    summary: `Post-independence Sinhalese Buddhist nationalism sought to shed a name of Portuguese colonial origin and assert a pre-colonial identity. The 1972 republican constitution provided the political moment to complete that break.`,
  },

  {
    yearEnded: '1975',
    formerNation: 'South Vietnam',
    altName: 'Republic of Vietnam',
    yearEstablished: '1955',
    presentNations: 'Socialist Republic of Vietnam',
    endedBy: 'Military Defeat',
    summary: `The Paris Peace Accords removed U.S. military involvement, leaving South Vietnam dependent on aid Congress later cut. Without American air power or funding, and hobbled by endemic corruption, the ARVN could not withstand a North Vietnamese offensive.`,
  },

  {
    yearEnded: '1975',
    formerNation: 'Kingdom of Sikkim',
    yearEstablished: '1642',
    presentNations: 'India (22nd state)',
    endedBy: 'Annexed',
    summary: `India had long viewed Sikkim as a critical Himalayan buffer against China. When pro-India political parties won elections and the Chogyal proved unable to build popular support, India exploited the opening to engineer incorporation into the union.`,
  },

  {
    yearEnded: '1976',
    formerNation: 'North Vietnam',
    altName: 'Democratic Republic of Vietnam',
    yearEstablished: '1945',
    presentNations: 'Socialist Republic of Vietnam',
    endedBy: 'Merged',
    summary: `The ideological goal of a unified Vietnam under communist rule had driven the entire conflict. Military victory removed the last obstacle; no force capable of resisting reunification remained, and Hanoi had the will to complete it.`,
  },

  // ── 1980s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1980',
    formerNation: 'Rhodesia',
    altName: 'Also "Zimbabwe Rhodesia" (1979)',
    yearEstablished: '1965',
    presentNations: 'Republic of Zimbabwe',
    endedBy: 'Independence Transition',
    summary: `A white minority of under 5% could not indefinitely deny political rights to the majority. Guerrilla war, sanctions, and loss of rear bases after Mozambique's independence eroded the regime until negotiation was unavoidable.`,
  },

  {
    yearEnded: '1984',
    formerNation: 'Upper Volta',
    altName: 'Republic of Upper Volta',
    yearEstablished: '1960',
    presentNations: 'Burkina Faso',
    endedBy: 'Renamed',
    summary: `Thomas Sankara believed nations must decolonize psychologically by rejecting European-imposed names. 'Upper Volta' named the country after a French river measurement — to Sankara, a humiliating colonial relic with no African meaning.`,
  },

  {
    yearEnded: '1989',
    formerNation: 'Burma',
    altName: 'Union of Burma',
    yearEstablished: '1948',
    presentNations: 'Myanmar',
    endedBy: 'Renamed',
    summary: `The military junta sought to delegitimize the pro-democracy opposition — 'Burma' had become associated with Aung San Suu Kyi's movement — and to impose a new national identity under military control, detached from the legacy of democratic governance.`,
  },

  {
    yearEnded: '1989',
    formerNation: 'Kampuchea',
    altName: "Democratic Kampuchea / People's Republic of Kampuchea",
    yearEstablished: '1975',
    presentNations: 'Kingdom of Cambodia',
    endedBy: 'Renamed',
    summary: `'Kampuchea' was inseparable from the Khmer Rouge genocide. The Vietnamese-installed government, and later the UN peace process, required restoring a name untainted by mass atrocity to achieve the legitimacy needed for reconstruction aid.`,
  },

  // ── 1990s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1990',
    formerNation: 'East Germany',
    altName: 'German Democratic Republic (GDR)',
    yearEstablished: '1949',
    presentNations: 'Federal Republic of Germany',
    endedBy: 'Reunified',
    summary: `The communist economic model had visibly failed; East Germans could see West German prosperity on television. When Gorbachev signalled no Soviet intervention, the regime had no legitimate basis to survive and the population simply walked away.`,
  },

  {
    yearEnded: '1990',
    formerNation: 'South Yemen',
    altName: "People's Democratic Republic of Yemen",
    yearEstablished: '1967',
    presentNations: 'Republic of Yemen',
    endedBy: 'Merged',
    summary: `South Yemen's Marxist economy was wholly dependent on Soviet subsidies. When Gorbachev cut aid during Perestroika, the economy collapsed. A 1986 internal power struggle had also decimated the leadership, leaving the state too weak to survive alone.`,
  },

  {
    yearEnded: '1990',
    formerNation: 'North Yemen',
    altName: 'Yemen Arab Republic',
    yearEstablished: '1962',
    presentNations: 'Republic of Yemen',
    endedBy: 'Merged',
    summary: `Oil discoveries in the border region created economic incentive for unity. President Saleh calculated that absorbing the weakened south would extend his political control, while South Yemen's leadership saw union as the only path to survival.`,
  },

  {
    yearEnded: '1991',
    formerNation: 'Soviet Union',
    altName: 'Union of Soviet Socialist Republics (USSR)',
    yearEstablished: '1922',
    presentNations: 'Russia, Ukraine, Belarus, and 12 other independent republics',
    endedBy: 'Split',
    summary: `Decades of economic stagnation left the USSR unable to compete with the West. Gorbachev's reforms unleashed independence movements he could not control; the failed August 1991 coup then destroyed the Communist Party's last shred of legitimacy.`,
  },

  {
    yearEnded: '1991–1992',
    formerNation: 'Yugoslavia',
    altName: 'Socialist Federal Republic of Yugoslavia',
    yearEstablished: '1945',
    presentNations: 'Slovenia, Croatia, Bosnia-Herzegovina, North Macedonia, Serbia, Montenegro, Kosovo',
    endedBy: 'Split',
    summary: `Tito's death left a power vacuum; economic crisis deepened ethnic grievances; Milošević weaponised Serbian nationalism. Wealthier republics saw more future in European integration than in a Serb-dominated federation, and armed conflict followed.`,
  },

  {
    yearEnded: '1992',
    formerNation: 'Czechoslovakia',
    yearEstablished: '1918',
    presentNations: 'Czech Republic (Czechia), Slovakia',
    endedBy: 'Split',
    summary: `After communism fell, Czech leaders pushed rapid privatization while Slovak leaders favoured gradualism. Neither side was willing to renegotiate the federal structure, and separation proved easier than compromise for both sides.`,
  },

  {
    yearEnded: '1994',
    formerNation: 'South African Bantustans',
    altName: 'Transkei (1976), Bophuthatswana (1977), Venda (1979), Ciskei (1981)',
    yearEstablished: '1976',
    presentNations: 'South Africa',
    endedBy: 'Reintegrated',
    summary: `The homelands were always a legal fiction with no genuine economy or sovereignty. When apartheid collapsed under internal resistance, international sanctions, and economic pressure, the homelands had no independent basis for existence.`,
  },

  {
    yearEnded: '1997',
    formerNation: 'Zaire',
    yearEstablished: '1971',
    presentNations: 'Democratic Republic of the Congo (DRC)',
    endedBy: 'Renamed',
    summary: `Mobutu's three decades of kleptocracy had gutted every state institution. The 1994 Rwandan genocide destabilized eastern Congo with a million refugees; Rwanda and Uganda backed Kabila's rebellion, exploiting a state too hollowed-out to defend itself.`,
  },

  // ── 2000s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '2003',
    formerNation: 'Federal Republic of Yugoslavia',
    yearEstablished: '1992',
    presentNations: 'Serbia and Montenegro (itself dissolved in 2006 into Serbia and Montenegro)',
    endedBy: 'Renamed',
    summary: `Montenegro increasingly chafed at a union that tied its EU integration prospects to Serbia's complicated Kosovo situation. The EU brokered the 2003 restructuring as a stepping stone, as the FRY name was an untenable claim to Yugoslavia's succession.`,
  },

  {
    yearEnded: '2006',
    formerNation: 'Serbia and Montenegro',
    altName: 'Formerly Federal Republic of Yugoslavia (1992–2003)',
    yearEstablished: '2003',
    presentNations: 'Serbia, Montenegro',
    endedBy: 'Split',
    summary: `Montenegro's coastal economy was naturally aligned with Europe, but EU and NATO integration was blocked while linked to Serbia's Kosovo complications. When the EU set a referendum mechanism, 55.5% of Montenegrins voted to go their own way.`,
  },

  // ── 2010s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '2010',
    formerNation: 'Netherlands Antilles',
    yearEstablished: '1954',
    presentNations: "Curaçao, Sint Maarten (autonomous countries); Bonaire, Sint Eustatius, Saba (Dutch special municipalities)",
    endedBy: 'Dissolved',
    summary: `The six islands had fundamentally different sizes, economies, and political interests that made collective governance unworkable. Curaçao wanted autonomy; smaller islands wanted direct Dutch protection. No federation could satisfy all parties.`,
  },

];
