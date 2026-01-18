export interface BourbonBrand {
  id: string;
  name: string;
  distillery?: string;
}

export interface BourbonProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  avgPrice?: number;
}

export const bourbonBrands: BourbonBrand[] = [
  { id: "1", name: "Blanton's", distillery: "Buffalo Trace" },
  { id: "2", name: "Pappy Van Winkle", distillery: "Old Rip Van Winkle" },
  { id: "3", name: "Weller", distillery: "Buffalo Trace" },
  { id: "4", name: "Eagle Rare", distillery: "Buffalo Trace" },
  { id: "5", name: "E.H. Taylor", distillery: "Buffalo Trace" },
  { id: "6", name: "Buffalo Trace", distillery: "Buffalo Trace" },
  { id: "7", name: "Stagg Jr.", distillery: "Buffalo Trace" },
  { id: "8", name: "George T. Stagg", distillery: "Buffalo Trace" },
  { id: "9", name: "Sazerac", distillery: "Buffalo Trace" },
  { id: "10", name: "Elmer T. Lee", distillery: "Buffalo Trace" },
  { id: "11", name: "Maker's Mark", distillery: "Maker's Mark" },
  { id: "12", name: "Woodford Reserve", distillery: "Brown-Forman" },
  { id: "13", name: "Old Forester", distillery: "Brown-Forman" },
  { id: "14", name: "Jack Daniel's", distillery: "Jack Daniel's" },
  { id: "15", name: "Jim Beam", distillery: "Beam Suntory" },
  { id: "16", name: "Knob Creek", distillery: "Beam Suntory" },
  { id: "17", name: "Booker's", distillery: "Beam Suntory" },
  { id: "18", name: "Baker's", distillery: "Beam Suntory" },
  { id: "19", name: "Basil Hayden", distillery: "Beam Suntory" },
  { id: "20", name: "Wild Turkey", distillery: "Campari Group" },
  { id: "21", name: "Russell's Reserve", distillery: "Campari Group" },
  { id: "22", name: "Four Roses", distillery: "Kirin" },
  { id: "23", name: "Bulleit", distillery: "Diageo" },
  { id: "24", name: "I.W. Harper", distillery: "Diageo" },
  { id: "25", name: "Michter's", distillery: "Michter's" },
  { id: "26", name: "Angel's Envy", distillery: "Bacardi" },
  { id: "27", name: "Larceny", distillery: "Heaven Hill" },
  { id: "28", name: "Elijah Craig", distillery: "Heaven Hill" },
  { id: "29", name: "Henry McKenna", distillery: "Heaven Hill" },
  { id: "30", name: "Evan Williams", distillery: "Heaven Hill" },
  { id: "31", name: "Old Fitzgerald", distillery: "Heaven Hill" },
  { id: "32", name: "Pikesville", distillery: "Heaven Hill" },
  { id: "33", name: "Rittenhouse", distillery: "Heaven Hill" },
  { id: "34", name: "Heaven Hill", distillery: "Heaven Hill" },
  { id: "35", name: "1792", distillery: "Barton 1792" },
  { id: "36", name: "Very Old Barton", distillery: "Barton 1792" },
  { id: "37", name: "Widow Jane", distillery: "Widow Jane" },
  { id: "38", name: "Kentucky Owl", distillery: "Stoli Group" },
  { id: "39", name: "Whistlepig", distillery: "WhistlePig" },
  { id: "40", name: "High West", distillery: "High West" },
  { id: "41", name: "New Riff", distillery: "New Riff" },
  { id: "42", name: "Old Elk", distillery: "Old Elk" },
  { id: "43", name: "Belle Meade", distillery: "Nelson's Green Brier" },
  { id: "44", name: "Smooth Ambler", distillery: "Smooth Ambler" },
  { id: "45", name: "Yellowstone", distillery: "Limestone Branch" },
  { id: "46", name: "Minor Case", distillery: "Limestone Branch" },
  { id: "47", name: "Barrell", distillery: "Barrell Craft Spirits" },
  { id: "48", name: "Redemption", distillery: "Bardstown Bourbon Co." },
  { id: "49", name: "Bardstown Bourbon Co.", distillery: "Bardstown Bourbon Co." },
  { id: "50", name: "Wilderness Trail", distillery: "Wilderness Trail" },
];

export const bourbonProducts: BourbonProduct[] = [
  { id: "1", name: "Blanton's Single Barrel", brand: "Blanton's", category: "Single Barrel", avgPrice: 89.99 },
  { id: "2", name: "Blanton's Gold Edition", brand: "Blanton's", category: "Single Barrel", avgPrice: 149.99 },
  { id: "3", name: "Blanton's Straight From The Barrel", brand: "Blanton's", category: "Barrel Proof", avgPrice: 199.99 },
  
  { id: "4", name: "Pappy Van Winkle 10 Year", brand: "Pappy Van Winkle", category: "Wheated", avgPrice: 399.99 },
  { id: "5", name: "Pappy Van Winkle 12 Year", brand: "Pappy Van Winkle", category: "Wheated", avgPrice: 499.99 },
  { id: "6", name: "Pappy Van Winkle 15 Year", brand: "Pappy Van Winkle", category: "Wheated", avgPrice: 899.99 },
  { id: "7", name: "Pappy Van Winkle 20 Year", brand: "Pappy Van Winkle", category: "Wheated", avgPrice: 1999.99 },
  { id: "8", name: "Pappy Van Winkle 23 Year", brand: "Pappy Van Winkle", category: "Wheated", avgPrice: 2999.99 },
  { id: "9", name: "Van Winkle Special Reserve 12 Year", brand: "Pappy Van Winkle", category: "Wheated", avgPrice: 299.99 },
  { id: "10", name: "Old Rip Van Winkle 10 Year", brand: "Pappy Van Winkle", category: "Wheated", avgPrice: 199.99 },
  
  { id: "11", name: "Weller Special Reserve", brand: "Weller", category: "Wheated", avgPrice: 29.99 },
  { id: "12", name: "Weller Antique 107", brand: "Weller", category: "Wheated", avgPrice: 49.99 },
  { id: "13", name: "Weller 12 Year", brand: "Weller", category: "Wheated", avgPrice: 79.99 },
  { id: "14", name: "Weller Full Proof", brand: "Weller", category: "Wheated", avgPrice: 59.99 },
  { id: "15", name: "Weller Single Barrel", brand: "Weller", category: "Single Barrel", avgPrice: 69.99 },
  { id: "16", name: "Weller C.Y.P.B.", brand: "Weller", category: "Wheated", avgPrice: 899.99 },
  
  { id: "17", name: "Eagle Rare 10 Year", brand: "Eagle Rare", category: "Single Barrel", avgPrice: 34.99 },
  { id: "18", name: "Eagle Rare 17 Year", brand: "Eagle Rare", category: "Single Barrel", avgPrice: 299.99 },
  
  { id: "19", name: "Colonel E.H. Taylor Small Batch", brand: "E.H. Taylor", category: "Small Batch", avgPrice: 45.99 },
  { id: "20", name: "Colonel E.H. Taylor Single Barrel", brand: "E.H. Taylor", category: "Single Barrel", avgPrice: 79.99 },
  { id: "21", name: "Colonel E.H. Taylor Barrel Proof", brand: "E.H. Taylor", category: "Barrel Proof", avgPrice: 99.99 },
  { id: "22", name: "Colonel E.H. Taylor Four Grain", brand: "E.H. Taylor", category: "Four Grain", avgPrice: 89.99 },
  { id: "23", name: "Colonel E.H. Taylor Seasoned Wood", brand: "E.H. Taylor", category: "Limited Edition", avgPrice: 199.99 },
  { id: "24", name: "Colonel E.H. Taylor Warehouse C Tornado Surviving", brand: "E.H. Taylor", category: "Limited Edition", avgPrice: 999.99 },
  
  { id: "25", name: "Buffalo Trace", brand: "Buffalo Trace", category: "Standard", avgPrice: 29.99 },
  { id: "26", name: "Buffalo Trace Single Barrel", brand: "Buffalo Trace", category: "Single Barrel", avgPrice: 39.99 },
  
  { id: "27", name: "Stagg Jr. Batch 1-24", brand: "Stagg Jr.", category: "Barrel Proof", avgPrice: 69.99 },
  
  { id: "28", name: "George T. Stagg", brand: "George T. Stagg", category: "Barrel Proof", avgPrice: 299.99 },
  
  { id: "29", name: "Sazerac Rye", brand: "Sazerac", category: "Rye", avgPrice: 29.99 },
  { id: "30", name: "Sazerac 18 Year", brand: "Sazerac", category: "Rye", avgPrice: 299.99 },
  
  { id: "31", name: "Elmer T. Lee Single Barrel", brand: "Elmer T. Lee", category: "Single Barrel", avgPrice: 49.99 },
  
  { id: "32", name: "Maker's Mark", brand: "Maker's Mark", category: "Wheated", avgPrice: 29.99 },
  { id: "33", name: "Maker's Mark 46", brand: "Maker's Mark", category: "Wheated", avgPrice: 39.99 },
  { id: "34", name: "Maker's Mark Cask Strength", brand: "Maker's Mark", category: "Barrel Proof", avgPrice: 59.99 },
  { id: "35", name: "Maker's Mark Private Select", brand: "Maker's Mark", category: "Private Selection", avgPrice: 69.99 },
  { id: "36", name: "Maker's Mark 101", brand: "Maker's Mark", category: "Wheated", avgPrice: 34.99 },
  
  { id: "37", name: "Woodford Reserve", brand: "Woodford Reserve", category: "Standard", avgPrice: 34.99 },
  { id: "38", name: "Woodford Reserve Double Oaked", brand: "Woodford Reserve", category: "Double Oaked", avgPrice: 54.99 },
  { id: "39", name: "Woodford Reserve Rye", brand: "Woodford Reserve", category: "Rye", avgPrice: 39.99 },
  { id: "40", name: "Woodford Reserve Batch Proof", brand: "Woodford Reserve", category: "Barrel Proof", avgPrice: 129.99 },
  { id: "41", name: "Woodford Reserve Wheat", brand: "Woodford Reserve", category: "Wheated", avgPrice: 49.99 },
  { id: "42", name: "Woodford Reserve Malt", brand: "Woodford Reserve", category: "Malt", avgPrice: 49.99 },
  
  { id: "43", name: "Old Forester 86", brand: "Old Forester", category: "Standard", avgPrice: 24.99 },
  { id: "44", name: "Old Forester 100", brand: "Old Forester", category: "Bottled in Bond", avgPrice: 24.99 },
  { id: "45", name: "Old Forester 1870 Original Batch", brand: "Old Forester", category: "Whiskey Row Series", avgPrice: 54.99 },
  { id: "46", name: "Old Forester 1897 Bottled in Bond", brand: "Old Forester", category: "Whiskey Row Series", avgPrice: 54.99 },
  { id: "47", name: "Old Forester 1910 Old Fine Whisky", brand: "Old Forester", category: "Whiskey Row Series", avgPrice: 64.99 },
  { id: "48", name: "Old Forester 1920 Prohibition Style", brand: "Old Forester", category: "Whiskey Row Series", avgPrice: 64.99 },
  { id: "49", name: "Old Forester Single Barrel", brand: "Old Forester", category: "Single Barrel", avgPrice: 49.99 },
  { id: "50", name: "Old Forester Rye", brand: "Old Forester", category: "Rye", avgPrice: 27.99 },
  
  { id: "51", name: "Jack Daniel's Old No. 7", brand: "Jack Daniel's", category: "Tennessee Whiskey", avgPrice: 27.99 },
  { id: "52", name: "Jack Daniel's Single Barrel", brand: "Jack Daniel's", category: "Single Barrel", avgPrice: 49.99 },
  { id: "53", name: "Jack Daniel's Barrel Proof", brand: "Jack Daniel's", category: "Barrel Proof", avgPrice: 69.99 },
  { id: "54", name: "Jack Daniel's Gentleman Jack", brand: "Jack Daniel's", category: "Double Mellowed", avgPrice: 29.99 },
  { id: "55", name: "Jack Daniel's Tennessee Rye", brand: "Jack Daniel's", category: "Rye", avgPrice: 29.99 },
  
  { id: "56", name: "Jim Beam White Label", brand: "Jim Beam", category: "Standard", avgPrice: 19.99 },
  { id: "57", name: "Jim Beam Black", brand: "Jim Beam", category: "Extra Aged", avgPrice: 24.99 },
  { id: "58", name: "Jim Beam Double Oak", brand: "Jim Beam", category: "Double Oaked", avgPrice: 24.99 },
  { id: "59", name: "Jim Beam Rye", brand: "Jim Beam", category: "Rye", avgPrice: 22.99 },
  { id: "60", name: "Jim Beam Single Barrel", brand: "Jim Beam", category: "Single Barrel", avgPrice: 39.99 },
  
  { id: "61", name: "Knob Creek Small Batch", brand: "Knob Creek", category: "Small Batch", avgPrice: 34.99 },
  { id: "62", name: "Knob Creek Single Barrel", brand: "Knob Creek", category: "Single Barrel", avgPrice: 44.99 },
  { id: "63", name: "Knob Creek 12 Year", brand: "Knob Creek", category: "Aged", avgPrice: 59.99 },
  { id: "64", name: "Knob Creek 15 Year", brand: "Knob Creek", category: "Aged", avgPrice: 99.99 },
  { id: "65", name: "Knob Creek 18 Year", brand: "Knob Creek", category: "Aged", avgPrice: 169.99 },
  { id: "66", name: "Knob Creek Rye", brand: "Knob Creek", category: "Rye", avgPrice: 34.99 },
  { id: "67", name: "Knob Creek Cask Strength Rye", brand: "Knob Creek", category: "Barrel Proof Rye", avgPrice: 64.99 },
  
  { id: "68", name: "Booker's Bourbon", brand: "Booker's", category: "Barrel Proof", avgPrice: 89.99 },
  
  { id: "69", name: "Baker's 7 Year", brand: "Baker's", category: "Single Barrel", avgPrice: 59.99 },
  { id: "70", name: "Baker's 13 Year", brand: "Baker's", category: "Single Barrel", avgPrice: 79.99 },
  
  { id: "71", name: "Basil Hayden", brand: "Basil Hayden", category: "High Rye", avgPrice: 44.99 },
  { id: "72", name: "Basil Hayden Dark Rye", brand: "Basil Hayden", category: "Rye Blend", avgPrice: 44.99 },
  { id: "73", name: "Basil Hayden Toast", brand: "Basil Hayden", category: "Toasted Barrel", avgPrice: 49.99 },
  { id: "74", name: "Basil Hayden 10 Year", brand: "Basil Hayden", category: "High Rye", avgPrice: 69.99 },
  
  { id: "75", name: "Wild Turkey 81", brand: "Wild Turkey", category: "Standard", avgPrice: 22.99 },
  { id: "76", name: "Wild Turkey 101", brand: "Wild Turkey", category: "Standard", avgPrice: 27.99 },
  { id: "77", name: "Wild Turkey Rare Breed", brand: "Wild Turkey", category: "Barrel Proof", avgPrice: 49.99 },
  { id: "78", name: "Wild Turkey Kentucky Spirit", brand: "Wild Turkey", category: "Single Barrel", avgPrice: 54.99 },
  { id: "79", name: "Wild Turkey Master's Keep", brand: "Wild Turkey", category: "Limited Edition", avgPrice: 149.99 },
  
  { id: "80", name: "Russell's Reserve 10 Year", brand: "Russell's Reserve", category: "Small Batch", avgPrice: 39.99 },
  { id: "81", name: "Russell's Reserve Single Barrel", brand: "Russell's Reserve", category: "Single Barrel", avgPrice: 59.99 },
  { id: "82", name: "Russell's Reserve 13 Year", brand: "Russell's Reserve", category: "Limited Edition", avgPrice: 79.99 },
  
  { id: "83", name: "Four Roses Yellow Label", brand: "Four Roses", category: "Standard", avgPrice: 24.99 },
  { id: "84", name: "Four Roses Small Batch", brand: "Four Roses", category: "Small Batch", avgPrice: 34.99 },
  { id: "85", name: "Four Roses Single Barrel", brand: "Four Roses", category: "Single Barrel", avgPrice: 44.99 },
  { id: "86", name: "Four Roses Small Batch Select", brand: "Four Roses", category: "Small Batch", avgPrice: 64.99 },
  { id: "87", name: "Four Roses Limited Edition Small Batch", brand: "Four Roses", category: "Limited Edition", avgPrice: 149.99 },
  { id: "88", name: "Four Roses Limited Edition Single Barrel", brand: "Four Roses", category: "Limited Edition", avgPrice: 169.99 },
  
  { id: "89", name: "Bulleit Bourbon", brand: "Bulleit", category: "High Rye", avgPrice: 29.99 },
  { id: "90", name: "Bulleit Rye", brand: "Bulleit", category: "Rye", avgPrice: 29.99 },
  { id: "91", name: "Bulleit 10 Year", brand: "Bulleit", category: "High Rye", avgPrice: 49.99 },
  { id: "92", name: "Bulleit Barrel Strength", brand: "Bulleit", category: "Barrel Proof", avgPrice: 59.99 },
  
  { id: "93", name: "I.W. Harper 15 Year", brand: "I.W. Harper", category: "Aged", avgPrice: 79.99 },
  
  { id: "94", name: "Michter's US*1 Small Batch", brand: "Michter's", category: "Small Batch", avgPrice: 49.99 },
  { id: "95", name: "Michter's US*1 Single Barrel", brand: "Michter's", category: "Single Barrel", avgPrice: 59.99 },
  { id: "96", name: "Michter's 10 Year Single Barrel", brand: "Michter's", category: "Single Barrel", avgPrice: 179.99 },
  { id: "97", name: "Michter's 20 Year", brand: "Michter's", category: "Limited Edition", avgPrice: 899.99 },
  { id: "98", name: "Michter's 25 Year", brand: "Michter's", category: "Limited Edition", avgPrice: 1999.99 },
  { id: "99", name: "Michter's Barrel Strength", brand: "Michter's", category: "Barrel Proof", avgPrice: 89.99 },
  { id: "100", name: "Michter's Toasted Barrel", brand: "Michter's", category: "Toasted Barrel", avgPrice: 89.99 },
  
  { id: "101", name: "Angel's Envy", brand: "Angel's Envy", category: "Port Finished", avgPrice: 54.99 },
  { id: "102", name: "Angel's Envy Cask Strength", brand: "Angel's Envy", category: "Barrel Proof", avgPrice: 229.99 },
  { id: "103", name: "Angel's Envy Rye", brand: "Angel's Envy", category: "Rye", avgPrice: 89.99 },
  
  { id: "104", name: "Larceny Small Batch", brand: "Larceny", category: "Wheated", avgPrice: 29.99 },
  { id: "105", name: "Larceny Barrel Proof", brand: "Larceny", category: "Barrel Proof", avgPrice: 59.99 },
  
  { id: "106", name: "Elijah Craig Small Batch", brand: "Elijah Craig", category: "Small Batch", avgPrice: 29.99 },
  { id: "107", name: "Elijah Craig Barrel Proof", brand: "Elijah Craig", category: "Barrel Proof", avgPrice: 69.99 },
  { id: "108", name: "Elijah Craig 18 Year", brand: "Elijah Craig", category: "Aged", avgPrice: 149.99 },
  { id: "109", name: "Elijah Craig Toasted Barrel", brand: "Elijah Craig", category: "Toasted Barrel", avgPrice: 54.99 },
  { id: "110", name: "Elijah Craig Rye", brand: "Elijah Craig", category: "Rye", avgPrice: 34.99 },
  
  { id: "111", name: "Henry McKenna 10 Year Bottled in Bond", brand: "Henry McKenna", category: "Bottled in Bond", avgPrice: 39.99 },
  
  { id: "112", name: "Evan Williams Black Label", brand: "Evan Williams", category: "Standard", avgPrice: 16.99 },
  { id: "113", name: "Evan Williams Bottled in Bond", brand: "Evan Williams", category: "Bottled in Bond", avgPrice: 19.99 },
  { id: "114", name: "Evan Williams Single Barrel", brand: "Evan Williams", category: "Single Barrel", avgPrice: 29.99 },
  { id: "115", name: "Evan Williams 12 Year", brand: "Evan Williams", category: "Aged", avgPrice: 39.99 },
  
  { id: "116", name: "Old Fitzgerald Bottled in Bond", brand: "Old Fitzgerald", category: "Bottled in Bond", avgPrice: 99.99 },
  { id: "117", name: "Old Fitzgerald Decanter 8 Year", brand: "Old Fitzgerald", category: "Bottled in Bond", avgPrice: 89.99 },
  { id: "118", name: "Old Fitzgerald Decanter 9 Year", brand: "Old Fitzgerald", category: "Bottled in Bond", avgPrice: 99.99 },
  { id: "119", name: "Old Fitzgerald Decanter 11 Year", brand: "Old Fitzgerald", category: "Bottled in Bond", avgPrice: 119.99 },
  { id: "120", name: "Old Fitzgerald Decanter 13 Year", brand: "Old Fitzgerald", category: "Bottled in Bond", avgPrice: 139.99 },
  { id: "121", name: "Old Fitzgerald Decanter 14 Year", brand: "Old Fitzgerald", category: "Bottled in Bond", avgPrice: 149.99 },
  { id: "122", name: "Old Fitzgerald Decanter 15 Year", brand: "Old Fitzgerald", category: "Bottled in Bond", avgPrice: 169.99 },
  
  { id: "123", name: "Pikesville Rye", brand: "Pikesville", category: "Rye", avgPrice: 54.99 },
  
  { id: "124", name: "Rittenhouse Rye Bottled in Bond", brand: "Rittenhouse", category: "Rye", avgPrice: 29.99 },
  
  { id: "125", name: "Heaven Hill Bottled in Bond", brand: "Heaven Hill", category: "Bottled in Bond", avgPrice: 14.99 },
  { id: "126", name: "Heaven Hill 7 Year Bottled in Bond", brand: "Heaven Hill", category: "Bottled in Bond", avgPrice: 54.99 },
  
  { id: "127", name: "1792 Small Batch", brand: "1792", category: "Small Batch", avgPrice: 34.99 },
  { id: "128", name: "1792 Bottled in Bond", brand: "1792", category: "Bottled in Bond", avgPrice: 39.99 },
  { id: "129", name: "1792 Full Proof", brand: "1792", category: "Barrel Proof", avgPrice: 49.99 },
  { id: "130", name: "1792 Single Barrel", brand: "1792", category: "Single Barrel", avgPrice: 44.99 },
  { id: "131", name: "1792 12 Year", brand: "1792", category: "Aged", avgPrice: 54.99 },
  { id: "132", name: "1792 Sweet Wheat", brand: "1792", category: "Wheated", avgPrice: 39.99 },
  
  { id: "133", name: "Very Old Barton Bottled in Bond", brand: "Very Old Barton", category: "Bottled in Bond", avgPrice: 14.99 },
  
  { id: "134", name: "Widow Jane 10 Year", brand: "Widow Jane", category: "Small Batch", avgPrice: 79.99 },
  { id: "135", name: "Widow Jane The Vaults", brand: "Widow Jane", category: "Blend", avgPrice: 89.99 },
  { id: "136", name: "Widow Jane Decadence", brand: "Widow Jane", category: "Maple Finished", avgPrice: 79.99 },
  
  { id: "137", name: "Kentucky Owl Confiscated", brand: "Kentucky Owl", category: "Small Batch", avgPrice: 129.99 },
  { id: "138", name: "Kentucky Owl Batch #1-12", brand: "Kentucky Owl", category: "Small Batch", avgPrice: 249.99 },
  { id: "139", name: "Kentucky Owl Rye", brand: "Kentucky Owl", category: "Rye", avgPrice: 149.99 },
  
  { id: "140", name: "WhistlePig 10 Year", brand: "Whistlepig", category: "Rye", avgPrice: 89.99 },
  { id: "141", name: "WhistlePig 12 Year Old World", brand: "Whistlepig", category: "Rye", avgPrice: 139.99 },
  { id: "142", name: "WhistlePig 15 Year", brand: "Whistlepig", category: "Rye", avgPrice: 299.99 },
  { id: "143", name: "WhistlePig PiggyBack", brand: "Whistlepig", category: "Rye", avgPrice: 54.99 },
  { id: "144", name: "WhistlePig Boss Hog", brand: "Whistlepig", category: "Limited Edition", avgPrice: 499.99 },
  
  { id: "145", name: "High West Double Rye", brand: "High West", category: "Rye", avgPrice: 39.99 },
  { id: "146", name: "High West Rendezvous Rye", brand: "High West", category: "Rye", avgPrice: 79.99 },
  { id: "147", name: "High West Bourye", brand: "High West", category: "Blend", avgPrice: 79.99 },
  { id: "148", name: "High West Campfire", brand: "High West", category: "Blend", avgPrice: 69.99 },
  { id: "149", name: "High West American Prairie", brand: "High West", category: "Blend", avgPrice: 39.99 },
  { id: "150", name: "High West Yippee Ki-Yay", brand: "High West", category: "Rye Blend", avgPrice: 79.99 },
  
  { id: "151", name: "New Riff Bottled in Bond", brand: "New Riff", category: "Bottled in Bond", avgPrice: 44.99 },
  { id: "152", name: "New Riff Single Barrel", brand: "New Riff", category: "Single Barrel", avgPrice: 54.99 },
  { id: "153", name: "New Riff Rye", brand: "New Riff", category: "Rye", avgPrice: 44.99 },
  
  { id: "154", name: "Old Elk Blended Straight Bourbon", brand: "Old Elk", category: "Blend", avgPrice: 64.99 },
  { id: "155", name: "Old Elk Wheated Bourbon", brand: "Old Elk", category: "Wheated", avgPrice: 69.99 },
  { id: "156", name: "Old Elk Straight Rye", brand: "Old Elk", category: "Rye", avgPrice: 64.99 },
  
  { id: "157", name: "Belle Meade Classic", brand: "Belle Meade", category: "Small Batch", avgPrice: 39.99 },
  { id: "158", name: "Belle Meade Reserve", brand: "Belle Meade", category: "Small Batch", avgPrice: 69.99 },
  { id: "159", name: "Belle Meade Cask Strength Reserve", brand: "Belle Meade", category: "Barrel Proof", avgPrice: 69.99 },
  
  { id: "160", name: "Smooth Ambler Old Scout", brand: "Smooth Ambler", category: "Single Barrel", avgPrice: 49.99 },
  { id: "161", name: "Smooth Ambler Contradiction", brand: "Smooth Ambler", category: "Blend", avgPrice: 39.99 },
  
  { id: "162", name: "Yellowstone Select", brand: "Yellowstone", category: "Small Batch", avgPrice: 39.99 },
  { id: "163", name: "Yellowstone Limited Edition", brand: "Yellowstone", category: "Limited Edition", avgPrice: 99.99 },
  
  { id: "164", name: "Minor Case Sherry Cask", brand: "Minor Case", category: "Sherry Finished", avgPrice: 59.99 },
  { id: "165", name: "Minor Case Rye", brand: "Minor Case", category: "Rye", avgPrice: 54.99 },
  
  { id: "166", name: "Barrell Bourbon Batches", brand: "Barrell", category: "Barrel Proof", avgPrice: 89.99 },
  { id: "167", name: "Barrell Craft Spirits Private Release", brand: "Barrell", category: "Barrel Proof", avgPrice: 249.99 },
  { id: "168", name: "Barrell Dovetail", brand: "Barrell", category: "Blend", avgPrice: 89.99 },
  { id: "169", name: "Barrell Seagrass", brand: "Barrell", category: "Rye Blend", avgPrice: 79.99 },
  
  { id: "170", name: "Redemption High Rye Bourbon", brand: "Redemption", category: "High Rye", avgPrice: 29.99 },
  { id: "171", name: "Redemption Rye", brand: "Redemption", category: "Rye", avgPrice: 29.99 },
  { id: "172", name: "Redemption Barrel Proof Rye", brand: "Redemption", category: "Barrel Proof Rye", avgPrice: 59.99 },
  
  { id: "173", name: "Bardstown Bourbon Co. Discovery Series", brand: "Bardstown Bourbon Co.", category: "Blend", avgPrice: 129.99 },
  { id: "174", name: "Bardstown Bourbon Co. Fusion Series", brand: "Bardstown Bourbon Co.", category: "Blend", avgPrice: 64.99 },
  { id: "175", name: "Bardstown Bourbon Co. Origin Series", brand: "Bardstown Bourbon Co.", category: "Single Barrel", avgPrice: 69.99 },
  
  { id: "176", name: "Wilderness Trail Small Batch", brand: "Wilderness Trail", category: "Small Batch", avgPrice: 49.99 },
  { id: "177", name: "Wilderness Trail Single Barrel", brand: "Wilderness Trail", category: "Single Barrel", avgPrice: 59.99 },
  { id: "178", name: "Wilderness Trail Bottled in Bond", brand: "Wilderness Trail", category: "Bottled in Bond", avgPrice: 54.99 },
];

export const getProductsByBrand = (brandName: string): BourbonProduct[] => {
  return bourbonProducts.filter(product => product.brand === brandName);
};

export const searchBourbons = (query: string): BourbonProduct[] => {
  const lowercaseQuery = query.toLowerCase();
  return bourbonProducts.filter(
    product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery)
  );
};
