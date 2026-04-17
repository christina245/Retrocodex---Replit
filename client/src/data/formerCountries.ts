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
    summary: `Japan's 1945-1949 occupation of the Dutch East Indies weakened Dutch colonial rule. By then, Indonesians resented centuries of Dutch exploitation, forced labor, and resource extraction. `,
    sourceUrl: 'https://www.britannica.com/place/Dutch-East-Indies',
      },
 

  // ── 1950s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1950',
    formerNation: 'Tibet',
    
    yearEstablished: '1913',
    presentNations: "People's Republic of China (Tibet Autonomous Region)",
    endedBy: 'Annexed',
    summary: `China sought control over Tibet under the guise of "liberating" it from theocracy while actually positioning it as a geographical buffer zone for disputes with its southern neighbor, India. `,
    sourceUrl: 'https://savetibet.org/why-tibet/history/',
  },
  
    

  {
    yearEnded: '1954',
    formerNation: 'French Indochina',
    yearEstablished: '1887',
    presentNations: 'Vietnam, Laos, Cambodia',
    endedBy: 'Split',
    summary: `French rule failed to significantly improve quality of local life. Japanese occupation of Indochina briefly toppled French rule, suggesting they could be defeated.`,
    sourceUrl: 'https://history.state.gov/milestones/1953-1960/dien-bien-phu',
  },

  // ── 1960s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1962',
    formerNation: 'Ruanda-Urundi',
    altName: 'Belgian trust territory',
    yearEstablished: '1916',
    presentNations: 'Rwanda, Burundi',
    endedBy: 'Split',
    summary: `They were already distinct kingdoms before colonial rule. After independence from the Belgians, each territory differed in its interethnic relations between the Hutus and Tutsis.`,
    sourceUrl: 'https://history.state.gov/milestones/1953-1960/dien-bien-phu',
  },

  {
    yearEnded: '1964',
    formerNation: 'Tanganyika',
    yearEstablished: '1961',
    presentNations: 'Tanzania',
    endedBy: 'Merged',
    summary: `Tanganyika merged with Zanzibar after gaining independence. The people of each had prior sociocultural and economic ties. Zanzibar's popularity as a tourist destination would give Tanganyika an economic boost.`,
    sourceUrl: 'https://theconversation.com/tanganyika-and-zanzibar-tanzanias-60-year-old-union-may-need-a-restructure-229933',
  },

  {
    yearEnded: '1964',
    formerNation: 'Zanzibar',
    altName: "People's Republic of Zanzibar",
    yearEstablished: '1963',
    presentNations: 'Tanzania (retains significant internal autonomy)',
    endedBy: 'Merged',
    summary: `After independence from Arab rule, the new independent government merged with Tanganyika strengthen its ties to the African mainland.`,
  },

  // ── 1970s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1970',
    formerNation: 'Biafra',
    yearEstablished: '1967',
    presentNations: 'Nigeria',
    endedBy: 'Military Defeat',
    summary: `Biafra was a seccesionist state that declared independence from the nation of Nigeria in 1967 due to resentment against its predominantly Igbo population. In 1970, it was defeated by the Nigerian federal government who wanted it back.`,
    sourceUrl: 'https://www.britannica.com/place/Biafra',
  },

  {
    yearEnded: '1971',
    formerNation: 'East Pakistan',
    yearEstablished: '1947',
    presentNations: 'Bangladesh',
    endedBy: 'Renamed',
    summary: `East Pakistan was the eastern province of Pakistan between 1956 and 1971. Upon gaining independence from Western Pakistan, it was renamed Bangladesh after its predominant Bengali population.`,
    sourceUrl:'https://www.nationalarchives.gov.uk/education/resources/the-independence-of-bangladesh-in-1971/',
  },

  {
    yearEnded: '1971',
    formerNation: 'United Arab Republic',
    
    yearEstablished: '1958',
    presentNations: 'Egypt, Syria',
    endedBy: 'Split',
    summary: `Egypt and Syria merged to form the United Arab Republic in 1958. A marginalized Syria seceded in 1961, leaving Egypt alone to retain the name United Arab Republic until 1971.`,
  },

  {
    yearEnded: '1972',
    formerNation: 'Ceylon',
   
    yearEstablished: '1948',
    presentNations: 'Sri Lanka',
    endedBy: 'Renamed',
    summary: `Post-independence nationalist sentiments sought to shed a name of Portuguese and British colonial origin, choosing a name similar to the country's original name of Sinhala. "Sri" is an honorific.`,
    sourceUrl:'https://www.bbc.com/news/world-south-asia-12099596',
  },

  {
    yearEnded: '1975',
    formerNation: 'South Vietnam',
    
    yearEstablished: '1955',
    presentNations: 'Vietnam',
    endedBy: 'Military Defeat, Merged',
    summary: `After losing support from the United States, South Vietnam was defeated by the military forces of North Vietnam on April 30, 1975. It merged with North Vietnam to form the Socialist Republic of Vietnam.`,
    sourceUrl:'https://www.britannica.com/event/Fall-of-Saigon',
  },

  {
    yearEnded: '1975',
    formerNation: 'Kingdom of Sikkim',
    yearEstablished: '1642',
    presentNations: 'India (22nd state)',
    endedBy: 'Annexed',
    summary: `India had long viewed Sikkim as a critical Himalayan buffer against China. Sikkim felt threatened by its neighbors Nepal and China, prompting it to seek support from a more powerful entity. `,
    sourceUrl:'https://indianexpress.com/article/explained/explained-sikkim-history-culture-became-a-part-of-india-7920790/',
  },

  {
    yearEnded: '1976',
    formerNation: 'North Vietnam',
    
    yearEstablished: '1945',
    presentNations: 'Vietnam',
    endedBy: 'Military Conquest, Merged',
    summary: `After South Vietnam's 1975 defeat, North Vietnam and South Vietnam were officially reunified in 1976. North Vietnam established "re-education camps" for former South Vietnamese officials.`,
    sourceUrl:'https://www.ebsco.com/research-starters/history/north-and-south-vietnam-are-reunited',
  },

  // ── 1980s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1980',
    formerNation: 'Rhodesia',
    
    yearEstablished: '1965',
    presentNations: 'Zimbabwe',
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
