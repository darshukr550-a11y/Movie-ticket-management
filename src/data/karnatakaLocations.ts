export interface TalukLocation {
  district: string;
  taluk: string;
  theatreId: string;
  theatreName: string;
  nearbyLocation: string;
  address: string;
  screens: number;
}

interface DistrictSeed {
  district: string;
  taluks: {
    taluk: string;
    theatreName?: string;
    nearbyLocation?: string;
  }[];
}

const DISTRICT_SEEDS: DistrictSeed[] = [
  {
    district: 'Bagalkote',
    taluks: [
      { taluk: 'Bagalkote', theatreName: 'Shakti Cineplex Bagalkote', nearbyLocation: 'Near Navanagar Sector 14 Bus Terminal' },
      { taluk: 'Badami', theatreName: 'Chalukya Talkies Badami', nearbyLocation: 'Near Badami Cave Temple Road & Railway Station' },
      { taluk: 'Bilagi', theatreName: 'Siddheshwara Theatre Bilagi', nearbyLocation: 'Near Bilagi Main Bus Stand Circle' },
      { taluk: 'Hungund', theatreName: 'Sangameshwar Cinemas Hungund', nearbyLocation: 'Near NH-50 Bypass & Taluk Office' },
      { taluk: 'Ilkal', theatreName: 'Vijaya Chitra Mandira Ilkal', nearbyLocation: 'Near Ilkal Weaver Market & KSRTC Stand' },
      { taluk: 'Jamkhandi', theatreName: 'Srinivas Theatre Jamkhandi', nearbyLocation: 'Near Jamkhandi Palace Circle' },
      { taluk: 'Mudhol', theatreName: 'Gajanana Cinemas Mudhol', nearbyLocation: 'Near Mudhol Sugar Factory Road' },
      { taluk: 'Rabkavi-Banhatti', theatreName: 'Mallikarjuna Talkies Banhatti', nearbyLocation: 'Near Banhatti Main Bazaar Circle' },
      { taluk: 'Guledgudda', theatreName: 'Kamaleshwar Theatre Guledgudda', nearbyLocation: 'Near Guledgudda Old Town Bus Stop' },
    ],
  },
  {
    district: 'Ballari',
    taluks: [
      { taluk: 'Ballari', theatreName: 'CineVault Royal Square Ballari', nearbyLocation: 'Near Royal Circle & Parvathi Nagar Main Road' },
      { taluk: 'Kampli', theatreName: 'Tungabhadra Talkies Kampli', nearbyLocation: 'Near Kampli Kottal Bus Stand' },
      { taluk: 'Kurugodu', theatreName: 'Basaveshwara Theatre Kurugodu', nearbyLocation: 'Near Kurugodu Fort Road Circle' },
      { taluk: 'Sandur', theatreName: 'Kumaraswamy Cinemas Sandur', nearbyLocation: 'Near Sandur Palace Bus Terminal' },
      { taluk: 'Siruguppa', theatreName: 'Venkateshwara Talkies Siruguppa', nearbyLocation: 'Near Siruguppa Gandhi Chowk' },
    ],
  },
  {
    district: 'Belagavi',
    taluks: [
      { taluk: 'Belagavi', theatreName: 'CineVault INOX Chandan Belagavi', nearbyLocation: 'Near Tilakwadi Cross & Congress Road' },
      { taluk: 'Athani', theatreName: 'Raghavendra Theatre Athani', nearbyLocation: 'Near Athani KSRTC Bus Depot' },
      { taluk: 'Bailhongal', theatreName: 'Kittur Rani Channamma Talkies', nearbyLocation: 'Near Sangolli Rayanna Circle, Bailhongal' },
      { taluk: 'Chikkodi', theatreName: 'Prakash Cineplex Chikkodi', nearbyLocation: 'Near Chikkodi Main Bus Stand Road' },
      { taluk: 'Gokak', theatreName: 'Shree Laxmi Cinemas Gokak', nearbyLocation: 'Near Gokak Falls Road & Market Yard' },
      { taluk: 'Hukkeri', theatreName: 'Hiranyakeshi Theatre Hukkeri', nearbyLocation: 'Near Hukkeri Court Circle' },
      { taluk: 'Kagwad', theatreName: 'Krishna Talkies Kagwad', nearbyLocation: 'Near Kagwad State Highway Junction' },
      { taluk: 'Khanapur', theatreName: 'Malaprabha Cinemas Khanapur', nearbyLocation: 'Near Khanapur Railway Station Road' },
      { taluk: 'Kittur', theatreName: 'Channamma Fort Theatre Kittur', nearbyLocation: 'Near Kittur Fort Entrance & NH-48' },
      { taluk: 'Mudalagi', theatreName: 'Bharati Talkies Mudalagi', nearbyLocation: 'Near Mudalagi APMC Market' },
      { taluk: 'Nippani', theatreName: 'Anand Cineplex Nippani', nearbyLocation: 'Near Nippani Central Bus Stand' },
      { taluk: 'Raibag', theatreName: 'Mahalakshmi Theatre Raibag', nearbyLocation: 'Near Raibag Station Road' },
      { taluk: 'Ramdurg', theatreName: 'Nataraj Talkies Ramdurg', nearbyLocation: 'Near Ramdurg Bridge Circle' },
      { taluk: 'Savadatti', theatreName: 'Renuka Cinemas Savadatti', nearbyLocation: 'Near Yellamma Temple Approach Road' },
      { taluk: 'Yargatti', theatreName: 'Kalika Talkies Yargatti', nearbyLocation: 'Near Yargatti Cross Bus Stand' },
    ],
  },
  {
    district: 'Bengaluru Rural',
    taluks: [
      { taluk: 'Devanahalli', theatreName: 'CineVault Airport Galleria', nearbyLocation: 'Near Kempegowda International Airport Trumpet Flyover' },
      { taluk: 'Doddaballapura', theatreName: 'Vaibhav Cinemas Doddaballapura', nearbyLocation: 'Near Doddaballapura Railway Overbridge & Bus Stand' },
      { taluk: 'Hosakote', theatreName: 'Sri Lakshmi Multiplex Hosakote', nearbyLocation: 'Near Hosakote Toll Plaza & Old Madras Road' },
      { taluk: 'Nelamangala', theatreName: 'Sapthagiri Cineplex Nelamangala', nearbyLocation: 'Near Nelamangala TB Cross Junction' },
    ],
  },
  {
    district: 'Bengaluru Urban',
    taluks: [
      { taluk: 'Bengaluru North', theatreName: 'CineVault IMAX Orion Mall', nearbyLocation: 'Near Sandal Soap Factory Metro & Brigade Gateway, Malleswaram' },
      { taluk: 'Bengaluru South', theatreName: 'CineVault Vega City Jayanagar', nearbyLocation: 'Near Bannerghatta Road & Jayadeva Flyover' },
      { taluk: 'Bengaluru East', theatreName: 'CineVault Luxe Indiranagar', nearbyLocation: 'Near 100 Feet Road & Indiranagar Metro Station' },
      { taluk: 'Yelahanka', theatreName: 'CineVault Galleria Yelahanka', nearbyLocation: 'Near Yelahanka New Town Police Station Circle' },
      { taluk: 'Anekal', theatreName: 'Surya Cineplex Anekal', nearbyLocation: 'Near Anekal Main Bus Stand & Electronic City Phase 2 Road' },
    ],
  },
  {
    district: 'Bidar',
    taluks: [
      { taluk: 'Bidar', theatreName: 'Sapna Cineplex Bidar', nearbyLocation: 'Near Ambedkar Circle & Bidar Fort Road' },
      { taluk: 'Aurad', theatreName: 'Amba Bhavani Talkies Aurad', nearbyLocation: 'Near Aurad Central Bus Stand' },
      { taluk: 'Basavakalyan', theatreName: 'Anubhava Mantapa Cinemas', nearbyLocation: 'Near Basavakalyan Fort & Main Market' },
      { taluk: 'Bhalki', theatreName: 'Prabhat Theatre Bhalki', nearbyLocation: 'Near Bhalki Railway Gate Circle' },
      { taluk: 'Chitgoppa', theatreName: 'Nataraj Talkies Chitgoppa', nearbyLocation: 'Near Chitgoppa Main Bazaar' },
      { taluk: 'Humnabad', theatreName: 'Manik Prabhu Cinemas Humnabad', nearbyLocation: 'Near Humnabad NH-65 Bus Stand' },
      { taluk: 'Hulsoor', theatreName: 'Shiva Talkies Hulsoor', nearbyLocation: 'Near Hulsoor Town Square' },
      { taluk: 'Kamalnagar', theatreName: 'Ganesh Theatre Kamalnagar', nearbyLocation: 'Near Kamalnagar Railway Crossing' },
    ],
  },
  {
    district: 'Chamarajanagara',
    taluks: [
      { taluk: 'Chamarajanagara', theatreName: 'Bhramaramba Cineplex', nearbyLocation: 'Near Chamarajanagara District Stadium & Bus Stand' },
      { taluk: 'Gundlupet', theatreName: 'Nilgiri Talkies Gundlupet', nearbyLocation: 'Near Gundlupet Highway Junction (Ooty-Mysuru Road)' },
      { taluk: 'Hanur', theatreName: 'Malai Mahadeshwara Cinemas', nearbyLocation: 'Near Hanur Main Bus Stand' },
      { taluk: 'Kollegal', theatreName: 'Sri Shanthala Theatre Kollegal', nearbyLocation: 'Near Kollegal M.G.S.V. College Road' },
      { taluk: 'Yelandur', theatreName: 'Biligiri Talkies Yelandur', nearbyLocation: 'Near Yelandur Taluk Office Circle' },
    ],
  },
  {
    district: 'Chikkaballapura',
    taluks: [
      { taluk: 'Chikkaballapura', theatreName: 'Nandi Cineplex Chikkaballapura', nearbyLocation: 'Near Sir M.V. Bus Terminal & BB Road' },
      { taluk: 'Bagepalli', theatreName: 'Venkatesha Talkies Bagepalli', nearbyLocation: 'Near Bagepalli NH-44 Circle' },
      { taluk: 'Chelur', theatreName: 'Lakshmi Theatre Chelur', nearbyLocation: 'Near Chelur Main Cross Bus Stop' },
      { taluk: 'Chintamani', theatreName: 'Kailash Cinemas Chintamani', nearbyLocation: 'Near Chintamani MG Road & Silk Market' },
      { taluk: 'Gauribidanur', theatreName: 'Shankar Talkies Gauribidanur', nearbyLocation: 'Near Gauribidanur Railway Station' },
      { taluk: 'Gudibande', theatreName: 'Byraveshwara Theatre Gudibande', nearbyLocation: 'Near Gudibande Fort Road' },
      { taluk: 'Manchenahalli', theatreName: 'Srinivasa Talkies Manchenahalli', nearbyLocation: 'Near Manchenahalli Bus Stand' },
      { taluk: 'Sidlaghatta', theatreName: 'Mayura Cinemas Sidlaghatta', nearbyLocation: 'Near Sidlaghatta Silk Market Circle' },
    ],
  },
  {
    district: 'Chikkamagaluru',
    taluks: [
      { taluk: 'Chikkamagaluru', theatreName: 'Milan Cineplex Chikkamagaluru', nearbyLocation: 'Near MG Road & Azad Park Circle' },
      { taluk: 'Ajjampura', theatreName: 'Basava Theatre Ajjampura', nearbyLocation: 'Near Ajjampura Railway Station' },
      { taluk: 'Kadur', theatreName: 'Bharathi Talkies Kadur', nearbyLocation: 'Near Kadur KSRTC Bus Stand & NH-206' },
      { taluk: 'Kalasa', theatreName: 'Bhadra Coffee Cinemas Kalasa', nearbyLocation: 'Near Kalasa Town Bus Stand' },
      { taluk: 'Koppa', theatreName: 'Sahyadri Theatre Koppa', nearbyLocation: 'Near Koppa Main Market Road' },
      { taluk: 'Mudigere', theatreName: 'Hemavathi Cinemas Mudigere', nearbyLocation: 'Near Mudigere Handpost Circle' },
      { taluk: 'Narasimharajapura', theatreName: 'Bhadra Talkies N.R. Pura', nearbyLocation: 'Near N.R. Pura Main Bus Stand' },
      { taluk: 'Sringeri', theatreName: 'Tunga Chitra Mandira Sringeri', nearbyLocation: 'Near Sringeri Sharada Mutt Approach Road' },
      { taluk: 'Tarikere', theatreName: 'Prabhu Theatre Tarikere', nearbyLocation: 'Near Tarikere BH Road Bus Stand' },
    ],
  },
  {
    district: 'Chitradurga',
    taluks: [
      { taluk: 'Chitradurga', theatreName: 'Basaveshwara Cineplex Chitradurga', nearbyLocation: 'Near Onake Obavva Circle & Fort Road' },
      { taluk: 'Challakere', theatreName: 'Gayathri Talkies Challakere', nearbyLocation: 'Near Challakere Nehru Circle & Bellary Road' },
      { taluk: 'Hiriyur', theatreName: 'Vani Vilas Cinemas Hiriyur', nearbyLocation: 'Near Hiriyur Vedavathi Bridge & NH-48' },
      { taluk: 'Holalkere', theatreName: 'Prakash Theatre Holalkere', nearbyLocation: 'Near Holalkere Main Bus Stand' },
      { taluk: 'Hosadurga', theatreName: 'Sri Ranganatha Talkies Hosadurga', nearbyLocation: 'Near Hosadurga Gandhi Circle' },
      { taluk: 'Molakalmuru', theatreName: 'Nunkappa Cinemas Molakalmuru', nearbyLocation: 'Near Molakalmuru Silk Market Road' },
    ],
  },
  {
    district: 'Dakshina Kannada',
    taluks: [
      { taluk: 'Mangaluru', theatreName: 'CineVault Bharat Mall Mangaluru', nearbyLocation: 'Near Bejai Kapikad & Lalbagh Junction' },
      { taluk: 'Bantwal', theatreName: 'Nethravathi Cinemas B.C. Road', nearbyLocation: 'Near B.C. Road Bus Terminal & Flyover' },
      { taluk: 'Belthangady', theatreName: 'Bharath Theatre Belthangady', nearbyLocation: 'Near Belthangady Main Bus Stand' },
      { taluk: 'Kadaba', theatreName: 'Kumaradhara Talkies Kadaba', nearbyLocation: 'Near Kadaba Main Market Junction' },
      { taluk: 'Moodabidri', theatreName: 'Amarshree Cineplex Moodabidri', nearbyLocation: 'Near Thousand Pillars Basadi Road & Bus Stand' },
      { taluk: 'Mulki', theatreName: 'Shambhavi Talkies Mulki', nearbyLocation: 'Near Mulki NH-66 Bus Stop' },
      { taluk: 'Puttur', theatreName: 'Aruna Cineplex Puttur', nearbyLocation: 'Near Puttur Court Road & KSRTC Stand' },
      { taluk: 'Sullia', theatreName: 'Santhosh Theatre Sullia', nearbyLocation: 'Near Sullia KVG Main Road' },
      { taluk: 'Ullal', theatreName: 'Someshwara Cinemas Ullal', nearbyLocation: 'Near Thokkottu Junction & Ullal Dargah Road' },
    ],
  },
  {
    district: 'Davanagere',
    taluks: [
      { taluk: 'Davanagere', theatreName: 'CineVault SS Mall Davanagere', nearbyLocation: 'Near Shamanur Road & Glass House' },
      { taluk: 'Channagiri', theatreName: 'Shanti Sagar Talkies Channagiri', nearbyLocation: 'Near Channagiri Bus Stand' },
      { taluk: 'Harihara', theatreName: 'Jayashree Cinemas Harihara', nearbyLocation: 'Near Harihara Railway Station & Tungabhadra Bridge' },
      { taluk: 'Honnali', theatreName: 'Raghavendra Theatre Honnali', nearbyLocation: 'Near Honnali Tunga Bridge Circle' },
      { taluk: 'Jagaluru', theatreName: 'Kottureshwara Talkies Jagaluru', nearbyLocation: 'Near Jagaluru Main Market' },
      { taluk: 'Nyamati', theatreName: 'Sri Devi Cinemas Nyamati', nearbyLocation: 'Near Nyamati Bus Terminal' },
    ],
  },
  {
    district: 'Dharwad',
    taluks: [
      { taluk: 'Dharwad', theatreName: 'Sangam Cineplex Dharwad', nearbyLocation: 'Near Jubilee Circle & Court Road' },
      { taluk: 'Hubballi Urban', theatreName: 'CineVault Urban Oasis Mall Hubballi', nearbyLocation: 'Near Gokul Road & Hubballi Airport Approach' },
      { taluk: 'Hubballi Rural', theatreName: 'Apsara Cinemas Hubballi', nearbyLocation: 'Near Kittur Chennamma Circle & Old Bus Stand' },
      { taluk: 'Alnavar', theatreName: 'Kalavati Talkies Alnavar', nearbyLocation: 'Near Alnavar Railway Junction' },
      { taluk: 'Annigeri', theatreName: 'Amruteshwara Theatre Annigeri', nearbyLocation: 'Near Annigeri Main Road' },
      { taluk: 'Kalghatgi', theatreName: 'Shanthi Cinemas Kalghatgi', nearbyLocation: 'Near Kalghatgi NH-63 Circle' },
      { taluk: 'Kundgol', theatreName: 'Sawai Gandharva Talkies Kundgol', nearbyLocation: 'Near Kundgol Railway Station' },
      { taluk: 'Navalgund', theatreName: 'Renuka Theatre Navalgund', nearbyLocation: 'Near Navalgund Bus Stand' },
    ],
  },
  {
    district: 'Gadag',
    taluks: [
      { taluk: 'Gadag', theatreName: 'Mahalakshmi Cineplex Gadag', nearbyLocation: 'Near Gandhi Circle & Mulgund Naka' },
      { taluk: 'Gajendragad', theatreName: 'Kalikamba Talkies Gajendragad', nearbyLocation: 'Near Gajendragad Bus Stand' },
      { taluk: 'Lakshmeshwar', theatreName: 'Someshwara Cinemas Lakshmeshwar', nearbyLocation: 'Near Lakshmeshwar Bazaar Road' },
      { taluk: 'Mundargi', theatreName: 'Kappatagudda Talkies Mundargi', nearbyLocation: 'Near Mundargi Main Circle' },
      { taluk: 'Nargund', theatreName: 'Venkateshwara Theatre Nargund', nearbyLocation: 'Near Nargund Fort Hill Road' },
      { taluk: 'Ron', theatreName: 'Dronacharya Cinemas Ron', nearbyLocation: 'Near Ron Taluk Office Circle' },
      { taluk: 'Shirahatti', theatreName: 'Fakkireshwara Talkies Shirahatti', nearbyLocation: 'Near Shirahatti Bus Stand' },
    ],
  },
  {
    district: 'Hassan',
    taluks: [
      { taluk: 'Hassan', theatreName: 'Sahyadri Cineplex Hassan', nearbyLocation: 'Near B.M. Road & Hassan New Bus Stand' },
      { taluk: 'Alur', theatreName: 'Hemavathi Theatre Alur', nearbyLocation: 'Near Alur Town Circle' },
      { taluk: 'Arkalgud', theatreName: 'Kaveri Talkies Arkalgud', nearbyLocation: 'Near Arkalgud Main Bus Stand' },
      { taluk: 'Arsikere', theatreName: 'Jayanthi Cinemas Arsikere', nearbyLocation: 'Near Arsikere Railway Junction & BH Road' },
      { taluk: 'Belur', theatreName: 'Chennakeshava Theatre Belur', nearbyLocation: 'Near Belur Temple Gate & Bus Stand' },
      { taluk: 'Channarayapatna', theatreName: 'Kalpavriksha Cineplex', nearbyLocation: 'Near Channarayapatna Bypass & Bus Terminal' },
      { taluk: 'Holenarasipura', theatreName: 'Lakshmi Narasimha Talkies', nearbyLocation: 'Near Holenarasipura Bus Stand' },
      { taluk: 'Sakleshpur', theatreName: 'Manjarabad Cinemas Sakleshpur', nearbyLocation: 'Near Sakleshpur B.M. Road & Bus Stand' },
    ],
  },
  {
    district: 'Haveri',
    taluks: [
      { taluk: 'Haveri', theatreName: 'Magavi Cineplex Haveri', nearbyLocation: 'Near P.B. Road & Haveri Central Bus Stand' },
      { taluk: 'Byadgi', theatreName: 'Mirchi Market Talkies Byadgi', nearbyLocation: 'Near Byadgi APMC Yard' },
      { taluk: 'Hanagal', theatreName: 'Tarakeshwara Theatre Hanagal', nearbyLocation: 'Near Hanagal Fort Circle' },
      { taluk: 'Hirekerur', theatreName: 'Sarvajna Cinemas Hirekerur', nearbyLocation: 'Near Hirekerur Main Road' },
      { taluk: 'Ranebennur', theatreName: 'Shankar Cineplex Ranebennur', nearbyLocation: 'Near Ranebennur Railway Station & PB Road' },
      { taluk: 'Rattihalli', theatreName: 'Kumudvathi Talkies Rattihalli', nearbyLocation: 'Near Rattihalli Bus Stop' },
      { taluk: 'Savanur', theatreName: 'Nawab Theatre Savanur', nearbyLocation: 'Near Savanur Baobab Circle' },
      { taluk: 'Shiggaon', theatreName: 'Utsav Cinemas Shiggaon', nearbyLocation: 'Near Shiggaon NH-48 Junction' },
    ],
  },
  {
    district: 'Kalaburagi',
    taluks: [
      { taluk: 'Kalaburagi', theatreName: 'CineVault Asian Mall Kalaburagi', nearbyLocation: 'Near Super Market & Sardar Vallabhbhai Patel Chowk' },
      { taluk: 'Afzalpur', theatreName: 'Bhima Talkies Afzalpur', nearbyLocation: 'Near Afzalpur Main Bus Stand' },
      { taluk: 'Aland', theatreName: 'Laadle Mashak Cinemas Aland', nearbyLocation: 'Near Aland Checkpost Circle' },
      { taluk: 'Chincholi', theatreName: 'Chandrampalli Theatre Chincholi', nearbyLocation: 'Near Chincholi Main Market' },
      { taluk: 'Chittapur', theatreName: 'Kagini Talkies Chittapur', nearbyLocation: 'Near Chittapur Railway Station' },
      { taluk: 'Jewargi', theatreName: 'Basava Cinemas Jewargi', nearbyLocation: 'Near Jewargi NH-50 Cross' },
      { taluk: 'Kalagi', theatreName: 'Neelakantha Talkies Kalagi', nearbyLocation: 'Near Kalagi Bus Terminal' },
      { taluk: 'Kamalapur', theatreName: 'Nava Kalyan Theatre Kamalapur', nearbyLocation: 'Near Kamalapur Highway Bus Stop' },
      { taluk: 'Sedam', theatreName: 'Vasavadatta Cinemas Sedam', nearbyLocation: 'Near Sedam Railway Station Road' },
      { taluk: 'Shahabad', theatreName: 'Kagina Talkies Shahabad', nearbyLocation: 'Near Shahabad Main Bazaar' },
      { taluk: 'Yedrami', theatreName: 'Sharanabasava Theatre Yedrami', nearbyLocation: 'Near Yedrami Cross' },
    ],
  },
  {
    district: 'Kodagu',
    taluks: [
      { taluk: 'Madikeri', theatreName: 'Cauvery Cineplex Madikeri', nearbyLocation: 'Near Raja Seat Road & Madikeri Private Bus Stand' },
      { taluk: 'Kushalnagar', theatreName: 'Nisarga Cinemas Kushalnagar', nearbyLocation: 'Near Kushalnagar Kaveri Bridge & BM Road' },
      { taluk: 'Ponnampet', theatreName: 'Kodava Heritage Talkies Ponnampet', nearbyLocation: 'Near Ponnampet Main Road' },
      { taluk: 'Somwarpet', theatreName: 'Pushpagiri Theatre Somwarpet', nearbyLocation: 'Near Somwarpet Market Circle' },
      { taluk: 'Virajpet', theatreName: 'Subrahmanya Cinemas Virajpet', nearbyLocation: 'Near Virajpet Clock Tower & Bus Stand' },
    ],
  },
  {
    district: 'Kolar',
    taluks: [
      { taluk: 'Kolar', theatreName: 'Narayani Cineplex Kolar', nearbyLocation: 'Near Kolar Gold Fields Cross & Tekal Road' },
      { taluk: 'Bangarapet', theatreName: 'Sri Ram Talkies Bangarapet', nearbyLocation: 'Near Bangarapet Railway Junction' },
      { taluk: 'KGF (Robertsonpet)', theatreName: 'Olympia Heritage Cinemas KGF', nearbyLocation: 'Near Robertsonpet Geetha Road & Gandhi Circle' },
      { taluk: 'Malur', theatreName: 'Channakeshava Talkies Malur', nearbyLocation: 'Near Malur Railway Station Road' },
      { taluk: 'Mulbagal', theatreName: 'Anjaneya Cinemas Mulbagal', nearbyLocation: 'Near Mulbagal NH-75 Bypass' },
      { taluk: 'Srinivaspur', theatreName: 'Mango City Theatre Srinivaspur', nearbyLocation: 'Near Srinivaspur APMC Market' },
    ],
  },
  {
    district: 'Koppal',
    taluks: [
      { taluk: 'Koppal', theatreName: 'Gavisiddheshwara Cineplex Koppal', nearbyLocation: 'Near Jawahar Road & Ashoka Circle' },
      { taluk: 'Gangavathi', theatreName: 'Kanakadasa Cinemas Gangavathi', nearbyLocation: 'Near CBS Circle & Islampur Main Road' },
      { taluk: 'Kanakagiri', theatreName: 'Kanakachalapathi Talkies', nearbyLocation: 'Near Kanakagiri Temple Road' },
      { taluk: 'Karatagi', theatreName: 'Tungabhadra Rice Bowl Cinemas', nearbyLocation: 'Near Karatagi Bus Stand' },
      { taluk: 'Kukanoor', theatreName: 'Mahamaya Talkies Kukanoor', nearbyLocation: 'Near Kukanoor Main Cross' },
      { taluk: 'Kushtagi', theatreName: 'Maruthi Cinemas Kushtagi', nearbyLocation: 'Near Kushtagi NH-50 Circle' },
      { taluk: 'Yelburga', theatreName: 'Sridhara Theatre Yelburga', nearbyLocation: 'Near Yelburga Bus Stand' },
    ],
  },
  {
    district: 'Mandya',
    taluks: [
      { taluk: 'Mandya', theatreName: 'Sanjay Cineplex Mandya', nearbyLocation: 'Near Mandya Railway Station & MC Road' },
      { taluk: 'Krishnarajapet', theatreName: 'Hemavathi Cinemas K.R. Pet', nearbyLocation: 'Near K.R. Pet Main Bus Stand' },
      { taluk: 'Maddur', theatreName: 'Shimsha Talkies Maddur', nearbyLocation: 'Near Maddur Bengaluru-Mysuru Expressway Exit' },
      { taluk: 'Malavalli', theatreName: 'Gaganachukki Theatre Malavalli', nearbyLocation: 'Near Malavalli Main Market Circle' },
      { taluk: 'Nagamangala', theatreName: 'Adi Chunchanagiri Cinemas', nearbyLocation: 'Near Nagamangala TB Circle' },
      { taluk: 'Pandavapura', theatreName: 'Kunti Betta Talkies Pandavapura', nearbyLocation: 'Near Pandavapura Railway Station Road' },
      { taluk: 'Srirangapatna', theatreName: 'Ranganatha Heritage Cinemas', nearbyLocation: 'Near Srirangapatna Fort Gate & Kaveri Bridge' },
    ],
  },
  {
    district: 'Mysuru',
    taluks: [
      { taluk: 'Mysuru', theatreName: 'CineVault Forum Mall Mysuru', nearbyLocation: 'Near Nazarbad Main Road & Mysuru Zoo' },
      { taluk: 'Heggadadevanakote', theatreName: 'Kabini Talkies H.D. Kote', nearbyLocation: 'Near H.D. Kote Main Bus Stand' },
      { taluk: 'Hunsur', theatreName: 'Lakshmanatirtha Cinemas Hunsur', nearbyLocation: 'Near Hunsur BM Road & KSRTC Terminal' },
      { taluk: 'Krishnarajanagara', theatreName: 'Kaveri Cineplex K.R. Nagar', nearbyLocation: 'Near K.R. Nagar Old Bridge Road' },
      { taluk: 'Nanjangud', theatreName: 'Srikanteshwara Cinemas Nanjangud', nearbyLocation: 'Near Nanjangud Temple Street & Rashtrapathi Road' },
      { taluk: 'Periyapatna', theatreName: 'Bylakuppe Road Talkies Periyapatna', nearbyLocation: 'Near Periyapatna Main Bus Stand' },
      { taluk: 'Saligrama', theatreName: 'Sri Ramanatha Theatre Saligrama', nearbyLocation: 'Near Saligrama Town Circle' },
      { taluk: 'Sargur', theatreName: 'Nugu Cinemas Sargur', nearbyLocation: 'Near Sargur Main Bazaar' },
      { taluk: 'Tirumakudalu Narasipura', theatreName: 'Triveni Sangama Talkies T. Narasipura', nearbyLocation: 'Near T. Narasipura Kaveri-Kabini Sangam Road' },
    ],
  },
  {
    district: 'Raichur',
    taluks: [
      { taluk: 'Raichur', theatreName: 'Padmavathi Cineplex Raichur', nearbyLocation: 'Near Station Road & Ambedkar Circle' },
      { taluk: 'Devadurga', theatreName: 'Krishna Talkies Devadurga', nearbyLocation: 'Near Devadurga Bus Stand' },
      { taluk: 'Lingsugur', theatreName: 'Hatti Gold Cinemas Lingsugur', nearbyLocation: 'Near Lingsugur Central Bus Terminal' },
      { taluk: 'Manvi', theatreName: 'Jagannatha Dasa Theatre Manvi', nearbyLocation: 'Near Manvi Main Road' },
      { taluk: 'Maski', theatreName: 'Ashoka Rock Cinemas Maski', nearbyLocation: 'Near Maski Bazaar Circle' },
      { taluk: 'Sindhanur', theatreName: 'Balarama Cineplex Sindhanur', nearbyLocation: 'Near Sindhanur PWD Camp & Gangavathi Road' },
      { taluk: 'Sirwar', theatreName: 'Shiva Talkies Sirwar', nearbyLocation: 'Near Sirwar Bus Stop' },
    ],
  },
  {
    district: 'Ramanagara',
    taluks: [
      { taluk: 'Ramanagara', theatreName: 'Sholay Hills Cineplex Ramanagara', nearbyLocation: 'Near Ijoor Circle & Mysuru Road' },
      { taluk: 'Channapatna', theatreName: 'Toy City Cinemas Channapatna', nearbyLocation: 'Near Channapatna BM Road & Railway Station' },
      { taluk: 'Kanakapura', theatreName: 'Arkavathi Talkies Kanakapura', nearbyLocation: 'Near Kanakapura KSRTC Bus Stand' },
      { taluk: 'Magadi', theatreName: 'Kempegowda Theatre Magadi', nearbyLocation: 'Near Magadi Fort Circle' },
    ],
  },
  {
    district: 'Shivamogga',
    taluks: [
      { taluk: 'Shivamogga', theatreName: 'CineVault City Centre Shivamogga', nearbyLocation: 'Near B.H. Road & Shivappa Nayaka Circle' },
      { taluk: 'Bhadravati', theatreName: 'Vishweshwaraiah Cineplex Bhadravati', nearbyLocation: 'Near New Town & Paper Town Circle' },
      { taluk: 'Hosanagara', theatreName: 'Sharavathi Talkies Hosanagara', nearbyLocation: 'Near Hosanagara Main Bus Stand' },
      { taluk: 'Sagara', theatreName: 'Jog Falls Cinemas Sagara', nearbyLocation: 'Near Sagara J.C. Road & Bus Terminal' },
      { taluk: 'Shikaripura', theatreName: 'Allama Prabhu Theatre Shikaripura', nearbyLocation: 'Near Shikaripura Main Circle' },
      { taluk: 'Soraba', theatreName: 'Varada Talkies Soraba', nearbyLocation: 'Near Soraba Town Bus Stand' },
      { taluk: 'Thirthahalli', theatreName: 'Kuvempu Sahyadri Cinemas Thirthahalli', nearbyLocation: 'Near Thirthahalli Tunga Bridge & Bus Stand' },
    ],
  },
  {
    district: 'Tumakuru',
    taluks: [
      { taluk: 'Tumakuru', theatreName: 'CineVault Maruthi Grand Tumakuru', nearbyLocation: 'Near B.H. Road & Town Hall Circle' },
      { taluk: 'Chikkanayakanahalli', theatreName: 'Tirtharameshwara Talkies C.N. Halli', nearbyLocation: 'Near C.N. Halli Main Bus Stand' },
      { taluk: 'Gubbi', theatreName: 'Channabasaveshwara Theatre Gubbi', nearbyLocation: 'Near Gubbi Railway Station Road' },
      { taluk: 'Koratagere', theatreName: 'Goravanahalli Cinemas Koratagere', nearbyLocation: 'Near Koratagere Main Circle' },
      { taluk: 'Kunigal', theatreName: 'Stud Farm Talkies Kunigal', nearbyLocation: 'Near Kunigal NH-75 Bus Terminal' },
      { taluk: 'Madhugiri', theatreName: 'Monolith Hill Cinemas Madhugiri', nearbyLocation: 'Near Madhugiri Fort Gate & Bus Stand' },
      { taluk: 'Pavagada', theatreName: 'Shani Mahatma Theatre Pavagada', nearbyLocation: 'Near Pavagada Main Bazaar' },
      { taluk: 'Sira', theatreName: 'Kasturi Rangappa Cinemas Sira', nearbyLocation: 'Near Sira NH-48 Bypass & Bus Stand' },
      { taluk: 'Tiptur', theatreName: 'Kalpataru Cineplex Tiptur', nearbyLocation: 'Near Tiptur Copra Market & BH Road' },
      { taluk: 'Turuvekere', theatreName: 'Mayasandra Talkies Turuvekere', nearbyLocation: 'Near Turuvekere Bus Stand' },
    ],
  },
  {
    district: 'Udupi',
    taluks: [
      { taluk: 'Udupi', theatreName: 'CineVault Canara Mall Manipal-Udupi', nearbyLocation: 'Near Tiger Circle Manipal & Kalsanka Junction' },
      { taluk: 'Brahmavar', theatreName: 'Varahi Cinemas Brahmavar', nearbyLocation: 'Near Brahmavar NH-66 Bus Stand' },
      { taluk: 'Byndoor', theatreName: 'Ottinene Talkies Byndoor', nearbyLocation: 'Near Byndoor Mookambika Road Station' },
      { taluk: 'Hebri', theatreName: 'Seethanadi Theatre Hebri', nearbyLocation: 'Near Hebri Agumbe Cross' },
      { taluk: 'Kapu', theatreName: 'Marigudi Cinemas Kapu', nearbyLocation: 'Near Kapu Lighthouse Approach & NH-66' },
      { taluk: 'Karkala', theatreName: 'Bahubali Cineplex Karkala', nearbyLocation: 'Near Karkala Ananthashayana Temple Circle' },
      { taluk: 'Kundapura', theatreName: 'Panchagangavali Cinemas Kundapura', nearbyLocation: 'Near Kundapura Shastri Circle & Bus Stand' },
    ],
  },
  {
    district: 'Uttara Kannada',
    taluks: [
      { taluk: 'Karwar', theatreName: 'Rabindranath Tagore Beach Cinemas', nearbyLocation: 'Near Karwar Green Street & Coastal Bus Stand' },
      { taluk: 'Ankola', theatreName: 'Pooja Talkies Ankola', nearbyLocation: 'Near Ankola NH-66 Junction' },
      { taluk: 'Bhatkal', theatreName: 'Shamsuddin Cinemas Bhatkal', nearbyLocation: 'Near Bhatkal Shamsuddin Circle & Bus Stand' },
      { taluk: 'Dandeli', theatreName: 'Kali River Cineplex Dandeli', nearbyLocation: 'Near Dandeli J.N. Road & Paper Mill Gate' },
      { taluk: 'Haliyal', theatreName: 'Shivaji Theatre Haliyal', nearbyLocation: 'Near Haliyal Main Market' },
      { taluk: 'Honnavar', theatreName: 'Sharavathi Bridge Talkies Honnavar', nearbyLocation: 'Near Honnavar Prabhat Nagar Bus Stand' },
      { taluk: 'Joida', theatreName: 'Supa Dam Cinemas Joida', nearbyLocation: 'Near Joida Main Cross' },
      { taluk: 'Kumta', theatreName: 'Gita Cineplex Kumta', nearbyLocation: 'Near Kumta Gibb High School Road' },
      { taluk: 'Mundgod', theatreName: 'Tibetan Valley Talkies Mundgod', nearbyLocation: 'Near Mundgod Bus Stand' },
      { taluk: 'Siddapur', theatreName: 'Aghnashini Cinemas Siddapur', nearbyLocation: 'Near Siddapur Main Circle' },
      { taluk: 'Sirsi', theatreName: 'Nataraj Cineplex Sirsi', nearbyLocation: 'Near Sirsi Marikamba Temple Road & Hubballi Circle' },
      { taluk: 'Yellapur', theatreName: 'Satoddi Talkies Yellapur', nearbyLocation: 'Near Yellapur NH-63 Bus Stand' },
    ],
  },
  {
    district: 'Vijayanagara',
    taluks: [
      { taluk: 'Hosapete', theatreName: 'Hampi Heritage Cineplex Hosapete', nearbyLocation: 'Near College Road & Hosapete KSRTC Terminal' },
      { taluk: 'Hadagali', theatreName: 'Mylaralingeshwara Talkies Hadagali', nearbyLocation: 'Near Huvina Hadagali Bus Stand' },
      { taluk: 'Hagaribommanahalli', theatreName: 'Tungabhadra Cinemas H.B. Halli', nearbyLocation: 'Near H.B. Halli Main Road' },
      { taluk: 'Harapanahalli', theatreName: 'Uchangidurga Talkies Harapanahalli', nearbyLocation: 'Near Harapanahalli Circle' },
      { taluk: 'Kudligi', theatreName: 'Mahadev Theatre Kudligi', nearbyLocation: 'Near Kudligi NH-50 Bypass' },
      { taluk: 'Kotturu', theatreName: 'Kottureshwara Cineplex Kotturu', nearbyLocation: 'Near Kotturu Railway Station Road' },
    ],
  },
  {
    district: 'Vijayapura',
    taluks: [
      { taluk: 'Vijayapura', theatreName: 'Gol Gumbaz Cineplex Vijayapura', nearbyLocation: 'Near Station Road & Siddheshwar Temple' },
      { taluk: 'Almel', theatreName: 'Bhima River Talkies Almel', nearbyLocation: 'Near Almel Main Cross' },
      { taluk: 'Babaleshwar', theatreName: 'Gurupadeshwara Theatre Babaleshwar', nearbyLocation: 'Near Babaleshwar Bus Stand' },
      { taluk: 'Basavana Bagewadi', theatreName: 'Basava Janmabhoomi Cinemas', nearbyLocation: 'Near Basavana Bagewadi Main Circle' },
      { taluk: 'Chadchan', theatreName: 'Sangameshwara Talkies Chadchan', nearbyLocation: 'Near Chadchan Solapur Road' },
      { taluk: 'Devara Hippargi', theatreName: 'Kalkaleshwara Theatre', nearbyLocation: 'Near Devara Hippargi NH-50' },
      { taluk: 'Indi', theatreName: 'Shanteshwara Cineplex Indi', nearbyLocation: 'Near Indi Railway Station & Bus Stand' },
      { taluk: 'Kolhar', theatreName: 'Almatti Backwater Talkies Kolhar', nearbyLocation: 'Near Kolhar Bridge Approach' },
      { taluk: 'Muddebihal', theatreName: 'Siddharoodha Cinemas Muddebihal', nearbyLocation: 'Near Muddebihal Main Bazaar' },
      { taluk: 'Nidagundi', theatreName: 'Lal Bahadur Talkies Nidagundi', nearbyLocation: 'Near Nidagundi NH-50 Cross' },
      { taluk: 'Sindagi', theatreName: 'Sangameshwar Theatre Sindagi', nearbyLocation: 'Near Sindagi Central Bus Stand' },
      { taluk: 'Talikoti', theatreName: 'Doni River Cinemas Talikoti', nearbyLocation: 'Near Talikoti Market Circle' },
      { taluk: 'Tikota', theatreName: 'Draksha Nagari Talkies Tikota', nearbyLocation: 'Near Tikota Main Road' },
    ],
  },
  {
    district: 'Yadgir',
    taluks: [
      { taluk: 'Yadgir', theatreName: 'Bheema Cineplex Yadgir', nearbyLocation: 'Near Subhash Chowk & Yadgir Station Road' },
      { taluk: 'Gurmitkal', theatreName: 'Nallakonda Talkies Gurmitkal', nearbyLocation: 'Near Gurmitkal Bus Stand' },
      { taluk: 'Hunsagi', theatreName: 'Narayanpur Dam Cinemas Hunsagi', nearbyLocation: 'Near Hunsagi Main Circle' },
      { taluk: 'Shahapur', theatreName: 'Sleeping Buddha Theatre Shahapur', nearbyLocation: 'Near Shahapur Char Kaman & Bus Stand' },
      { taluk: 'Shorapur', theatreName: 'Venugopala Cinemas Shorapur', nearbyLocation: 'Near Shorapur Palace Road' },
      { taluk: 'Wadagera', theatreName: 'Krishna River Talkies Wadagera', nearbyLocation: 'Near Wadagera Cross' },
    ],
  },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export const KARNATAKA_DISTRICTS: string[] = DISTRICT_SEEDS.map((d) => d.district);

export const KARNATAKA_TALUK_LOCATIONS: TalukLocation[] = DISTRICT_SEEDS.flatMap((d) =>
  d.taluks.map((t, index) => ({
    district: d.district,
    taluk: t.taluk,
    theatreId: `tht_ka_${slugify(d.district)}_${slugify(t.taluk)}`,
    theatreName: t.theatreName || `CineVault ${t.taluk} Talkies`,
    nearbyLocation: t.nearbyLocation || `Near ${t.taluk} Central Bus Stand`,
    address: `${t.nearbyLocation || `Near ${t.taluk} Central Bus Stand`}, ${t.taluk} Taluk, ${d.district} District, Karnataka`,
    screens: index === 0 ? 6 : 3,
  }))
);

export function getTaluksByDistrict(district: string): TalukLocation[] {
  return KARNATAKA_TALUK_LOCATIONS.filter(
    (loc) => loc.district.toLowerCase() === district.toLowerCase()
  );
}

export function searchKarnatakaLocations(query: string): TalukLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return KARNATAKA_TALUK_LOCATIONS;
  return KARNATAKA_TALUK_LOCATIONS.filter(
    (loc) =>
      loc.district.toLowerCase().includes(q) ||
      loc.taluk.toLowerCase().includes(q) ||
      loc.theatreName.toLowerCase().includes(q) ||
      loc.nearbyLocation.toLowerCase().includes(q)
  );
}
