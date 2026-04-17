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
    endedBy: 'Independence',
    summary: `Japan's 1945-1949 occupation of the Dutch East Indies weakened Dutch colonial rule. By then, Indonesians resented centuries of Dutch exploitation, forced labor, and resource extraction. `,
    sourceUrl: 'https://www.britannica.com/place/Dutch-East-Indies',
      },
 

  // ── 1950s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1950',
    formerNation: 'Tibet',
    
    yearEstablished: '1913',
    presentNations: "part of China",
    endedBy: 'Annexed',
    summary: `China sought control over Tibet under the guise of "liberating" it from theocracy while actually positioning it as a geographical buffer zone for disputes with its southern neighbor, India. `,
    sourceUrl: 'https://savetibet.org/why-tibet/history/',
  },
  
    

  {
    yearEnded: '1954',
    formerNation: 'French Indochina',
    yearEstablished: '1887',
    presentNations: 'Vietnam, Laos, Cambodia',
    endedBy: 'Independence, Split',
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
    endedBy: 'Independence, Split',
    summary: `They were already distinct kingdoms before colonial rule. After independence from the Belgians, each territory differed in its interethnic relations between the Hutus and Tutsis.`,
    sourceUrl: 'https://history.state.gov/milestones/1953-1960/dien-bien-phu',
  },

  {
    yearEnded: '1964',
    formerNation: 'Tanganyika',
    yearEstablished: '1961',
    presentNations: 'Tanzania',
    endedBy: 'Independence, Merged',
    summary: `Tanganyika merged with Zanzibar after gaining independence. The people of each had prior sociocultural and economic ties. Zanzibar's popularity as a tourist destination would give Tanganyika an economic boost.`,
    sourceUrl: 'https://theconversation.com/tanganyika-and-zanzibar-tanzanias-60-year-old-union-may-need-a-restructure-229933',
  },

  {
    yearEnded: '1964',
    formerNation: 'Zanzibar',
    altName: "People's Republic of Zanzibar",
    yearEstablished: '1963',
    presentNations: 'Tanzania (retains significant internal autonomy)',
    endedBy: 'Independence, Merged',
    summary: `After independence from Arab rule, the new independent government merged with Tanganyika strengthen its ties to the African mainland.`,
    sourceUrl: 'https://theconversation.com/tanganyika-and-zanzibar-tanzanias-60-year-old-union-may-need-a-restructure-229933',
  },

  // ── 1970s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1970',
    formerNation: 'Biafra',
    yearEstablished: '1967',
    presentNations: 'part of Nigeria',
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
    endedBy: 'Independence, Renamed',
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
    presentNations: 'part of India',
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
    endedBy: 'Independence',
    summary: `Ruled by the British, a white minority held a disproportionate amount of political and social power in Rhodesia. The Black population pushed back, causing white emigration. It became Black-ruled and independent in 1980 as Zimbabwe.`,
    sourceUrl:'https://courses.lumenlearning.com/suny-worldhistory/chapter/zimbabwe/',
  },

  {
    yearEnded: '1984',
    formerNation: 'Upper Volta',
    
    yearEstablished: '1960',
    presentNations: 'Burkina Faso',
    endedBy: 'Independence, Renamed',
    summary: `Upon gaining independence, the nation's first president Thomas Sankara saw the European-imposed name of Upper Volta as a colonial relic.`,
    sourceUrl:'https://digitalcommons.usf.edu/etd/4612/',
  },

  {
    yearEnded: '1989',
    formerNation: 'Burma',
    
    yearEstablished: '1948',
    presentNations: 'Myanmar',
    endedBy: 'Renamed',
    summary: `Myanmar was seen as more inclusive of the country's ethnic minorities and relatively detached from colonial ties.`,
    sourceUrl:'https://apnews.com/article/myanmar-burma-different-names-explained-8af64e33cf89c565b074eec9cbe22b72'
  },

  {
    yearEnded: '1989',
    formerNation: 'Kampuchea',
    
    yearEstablished: '1975',
    presentNations: 'Cambodia',
    endedBy: 'Renamed',
    summary: `The name 'Kampuchea' echoed from the Cambodian Genocide. The new government required a name untainted by mass atrocity to achieve the legitimacy needed for reconstruction aid.`,
    sourceUrl:'https://www.asianstudies.org/publications/eaa/archives/the-rise-and-fall-of-democratic-kampuchea/'
  },

  // ── 1990s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '1990',
    formerNation: 'East Germany',
   
    yearEstablished: '1949',
    presentNations: 'Germany',
    endedBy: 'Reunified',
    summary: `Germany previously split into a capitalist West Germany and communist East Germany. The people of East Germany felt that their government was behind relative to West Germany and wanted a more prosperous environment to keep their skilled workers from emigrating.`,
     sourceUrl:'https://www.britannica.com/topic/German-reunification'
  },

  {
    yearEnded: '1990',
    formerNation: 'South Yemen',
    
    yearEstablished: '1967',
    presentNations: 'Republic of Yemen',
    endedBy: 'Merged',
    summary: `South Yemen was relatively destitute and saw unification as a potential economic boost. It already had many shared cultural norms with North Yemen.`,
     sourceUrl:'https://www.remitly.com/blog/lifestyle-culture/yemen-unity-day-history-and-meaning/'
  },

  {
    yearEnded: '1990',
    formerNation: 'North Yemen',
    
    yearEstablished: '1962',
    presentNations: 'Republic of Yemen',
    endedBy: 'Merged',
    summary: `Oil discoveries in the border region created economic incentive for unity. North Yemen's leader Ali Abdullah Saleh felt that absorbing the south would exacerbate his power, while South Yemen's leadership saw union as a substantial survival strategy.`,
    sourceUrl:'https://www.merip.org/1991/05/yemen-unification-and-the-gulf-war/'
  },

  {
    yearEnded: '1991',
    formerNation: 'Soviet Union',
    altName: 'Union of Soviet Socialist Republics (USSR)',
    yearEstablished: '1922',
    presentNations: 'Russia, Ukraine, Belarus, Estonia, Latvia, Lithuania, Moldova, Georgia, Armenia, Azerbaijan, Kazakhstan, Kyrgyzstan, Uzbekistan, Turkmenistan, and Tajikistan',
    endedBy: 'Split',
    summary: `The Soviet Union collapsed for several reasons, including economic destitution under communism, opposition to war with Afghanistan, the Chernobyl incident, and influences by the relatively democratic, capitalist, and liberal United States.`,
    sourceUrl:'https://www.britannica.com/story/why-did-the-soviet-union-collapse'
  },

  {
    yearEnded: '1991–1992',
    formerNation: 'Yugoslavia',
  
    yearEstablished: '1945',
    presentNations: 'Slovenia, Croatia, Bosnia-Herzegovina, Macedonia, Serbia, Montenegro, Kosovo',
    endedBy: 'Split',
    summary: `Yugoslavia was divided by ethnic and religious tensions. The fall of the Soviet Union removed much of its threat and thus its incentive to stay unionized.`,
    sourceUrl:'https://history.state.gov/milestones/1989-1992/breakup-yugoslavia'
  },

  {
    yearEnded: '1992',
    formerNation: 'Czechoslovakia',
    yearEstablished: '1918',
    presentNations: 'Czech Republic (Czechia), Slovakia',
    endedBy: 'Split',
    summary: `The Czechs were economically prosperous relative to the Slovaks, who felt marginalized, dominated, and sought greater autonomy.`,
    sourceUrl:'https://scalar.usc.edu/works/dissolution-of-czechoslovakia/the-dissolution-of-czechoslovakia'
  },

  {
    yearEnded: '1994',
    formerNation: 'South African Bantustans',
    altName: 'Transkei (1976), Bophuthatswana (1977), Venda (1979), Ciskei (1981), etc',
    yearEstablished: '1976',
    presentNations: 'South Africa',
    endedBy: 'Reintegrated',
    summary: `The Bantustans were pseudo-national lands designated for South Africa's Black population under apartheid. They attempted to, but never became independent states and were dismantled when apartheid ended.`,
    sourceUrl:'https://www.britannica.com/topic/Bantustan'
  },

  {
    yearEnded: '1997',
    formerNation: 'Zaire',
    yearEstablished: '1971',
    presentNations: 'Congo',
    endedBy: 'Renamed',
    summary: `Congo was renamed Zaire in 1971 by leader Joseph Mobutu. After he was overthrown, its name was reverted to Congo to distance the country from his inefficient, corrupt rule.`,
    sourceUrl:'https://emro.libraries.psu.edu/record/index.php?id=958'
  },

  // ── 2000s ──────────────────────────────────────────────────────────────────
  {
    yearEnded: '2002',
    formerNation: 'East Timor (part of Indonesia)',
    yearEstablished: 'Unknown',
    presentNations: "Timor-Leste",
    endedBy: 'Independence',
    summary: `Indonesian occupation of East Timor had proved harmful, leading to violence and famine. After Indonesia and Portugal sign an agreement allowing the Timorese to vote for independence after decades of struggle, 78% of its people voted yes.`,
    sourceUrl:'https://www.ebsco.com/research-starters/history/east-timor-declares-independence-annexed-indonesia'
  },
  
  
  
  {
    yearEnded: '2006',
    formerNation: 'Serbia and Montenegro',
    yearEstablished: '1992',
    presentNations: 'Serbia, Montenegro',
    endedBy: 'Split',
    summary: `Montenegro did not want to stay involved in Serbia's conflict with Kosovo and sought greater economic autonomy.`,
    sourceUrl:'https://www.pbs.org/newshour/world/former-allies-serbia-and-montenegro-agree-to-repair-strained-relations'
  },

  

  // ── 2010s ──────────────────────────────────────────────────────────────────

  {
    yearEnded: '2010',
    formerNation: 'Netherlands Antilles',
    yearEstablished: '1954',
    presentNations: "Curaçao, Sint Maarten (autonomous countries); Bonaire, Sint Eustatius, Saba (Dutch special municipalities)",
    endedBy: 'Dissolved',
    summary: `The six islands had fundamentally different sizes, economies, and political interests that made collective governance unworkable. Curaçao wanted autonomy; smaller islands wanted direct Dutch protection. No federation could satisfy all parties.`,
    sourceUrl:'https://www.britannica.com/place/Netherlands-Antilles'
  },

  {
    yearEnded: '2018',
    formerNation: 'Swaziland',
    yearEstablished: '1968',
    presentNations: "Eswatini",
    endedBy: 'Renamed',
    summary: `Africa's last absolute monarch, King Mswati III, renamed the country Eswatini, which means "Land of the Swazis". He claimed that "Swaziland" was often confused with "Switzerland" abroad.`,
    sourceUrl:'https://www.bbc.com/news/world-africa-43821512'
  },
  {
    yearEnded: '2019',
    formerNation: 'Macedonia',
    yearEstablished: '1991',
    presentNations: "North Macedonia",
    endedBy: 'Renamed',
    summary: `Macedonia renamed to North Macedonia in 2019 to resolve a long dispute with Greece, which objected to the name “Macedonia” due to historical and regional claims tied to its own region.`,
    sourceUrl:'https://history.state.gov/countries/macedonia'
  },

];
