/* ============================================================
   SETTINGS
   ------------------------------------------------------------
   useLocalImages    Look for your own poster files first.
                     Put them in the images/ folder, named after
                     the film's id (see POSTER-FILENAMES.txt).
   imageFolder       Folder name. Change it if you like.
   imageExtensions   File types to try, in this order.
   posterSources     Where to look for films you HAVEN'T supplied
                     an image for, tried in this order:

                       'tmdb'       The Movie Database. Best
                                    coverage and the sharpest
                                    artwork. Needs a free key -
                                    see tmdbApiKey below.
                       'wikipedia'  No key needed, but a lower
                                    hit rate and softer images.

                     Set it to [] to switch automatic lookup off
                     entirely - the site then never touches the
                     network and uses only your own images.

   tmdbApiKey        Free from themoviedb.org: make an account,
                     then Settings -> API -> request a key. Copy
                     the "API Key (v3 auth)" value in here. You
                     can also paste it into Settings on the site
                     instead, which keeps it out of your repo.

   lookupConcurrency How many lookups run at once. 4 is polite
                     and quick. Lower it if you get rate limited.
   ============================================================ */

const CONFIG = {
  useLocalImages: true,
  imageFolder: 'images',
  imageExtensions: ['jpg', 'jpeg', 'png', 'webp'],

  posterSources: ['tmdb', 'wikipedia'],
  tmdbApiKey: '',
  lookupConcurrency: 4
};


/* ============================================================
   MOVIE DATA  -  this is the file you edit
   ------------------------------------------------------------
   One film per line, fields separated by the | character:

     Title | Year | Runtime | Genres | Director | WikipediaTitle

   ONLY THE TITLE IS REQUIRED. Everything after it can be left
   out, and you can stop at any point:

     Sicario|2015|121|Thriller,Crime|Denis Villeneuve|
     Sicario|2015|121|Thriller,Crime|            <- no director
     Sicario|2015                                <- just year
     Sicario                                     <- bare minimum

   Notes on each field:
     Year      Used for sorting and the decade filter.
     Runtime   In minutes. 0 or blank shows as unknown.
     Genres    Comma separated, e.g. Sci-Fi,Drama. These feed the
               genre filter and the Top 25 scope dropdown.
     Director  Shown on the film's panel; also searchable.
     Wikipedia Only needed when the article has a different name
               than the film, e.g. Gladiator (2000 film). Leave it
               blank and the title is used.

   To add a film, add a line. To remove one, delete its line.
   Order doesn't matter - the site sorts it - but it is what the
   "My list order" sort option uses.

   CAREFUL: a film's rating and its poster filename are both keyed
   to its title. Renaming a title orphans its rating and its image.
   ============================================================ */

const MOVIE_SOURCE = `
We're the Millers|2013|110|Comedy,Crime|Rawson Marshall Thurber|
The Other Guys|2010|107|Action,Comedy|Adam McKay|
Blade Runner 2049|2017|164|Sci-Fi,Drama|Denis Villeneuve|
Shutter Island|2010|138|Thriller,Mystery|Martin Scorsese|Shutter Island (film)
Dune|2021|155|Sci-Fi,Adventure|Denis Villeneuve|Dune (2021 film)
Dune: Part Two|2024|166|Sci-Fi,Adventure|Denis Villeneuve|
Top Gun: Maverick|2022|130|Action,Drama|Joseph Kosinski|
Horrible Bosses|2011|98|Comedy,Crime|Seth Gordon|
22 Jump Street|2014|112|Action,Comedy|Lord & Miller|
21 Jump Street|2012|109|Action,Comedy|Lord & Miller|21 Jump Street (film)
The Nice Guys|2016|116|Action,Comedy,Crime|Shane Black|
Due Date|2010|95|Comedy|Todd Phillips|
The Invisible Man|2020|124|Horror,Thriller|Leigh Whannell|The Invisible Man (2020 film)
The Shawshank Redemption|1994|142|Drama|Frank Darabont|
The Godfather|1972|175|Crime,Drama|Francis Ford Coppola|
The Dark Knight|2008|152|Action,Crime,Drama|Christopher Nolan|
Schindler's List|1993|195|Drama,History,War|Steven Spielberg|
Pulp Fiction|1994|154|Crime,Drama|Quentin Tarantino|
Forrest Gump|1994|142|Drama,Romance|Robert Zemeckis|
Fight Club|1999|139|Drama,Thriller|David Fincher|
Inception|2010|148|Sci-Fi,Action,Thriller|Christopher Nolan|
Star Wars: Episode I - The Phantom Menace|1999|136|Sci-Fi,Adventure|George Lucas|Star Wars: Episode I – The Phantom Menace
Star Wars: Episode II - Attack of the Clones|2002|142|Sci-Fi,Adventure|George Lucas|Star Wars: Episode II – Attack of the Clones
Star Wars: Episode III - Revenge of the Sith|2005|140|Sci-Fi,Adventure|George Lucas|Star Wars: Episode III – Revenge of the Sith
Star Wars: Episode IV - A New Hope|1977|121|Sci-Fi,Adventure|George Lucas|Star Wars (film)
Star Wars: Episode V - The Empire Strikes Back|1980|124|Sci-Fi,Adventure|Irvin Kershner|The Empire Strikes Back
Star Wars: Episode VI - Return of the Jedi|1983|132|Sci-Fi,Adventure|Richard Marquand|Return of the Jedi
Star Wars: Episode VII - The Force Awakens|2015|138|Sci-Fi,Adventure|J.J. Abrams|Star Wars: The Force Awakens
Star Wars: Episode VIII - The Last Jedi|2017|152|Sci-Fi,Adventure|Rian Johnson|Star Wars: The Last Jedi
Star Wars: Episode IX - The Rise of Skywalker|2019|142|Sci-Fi,Adventure|J.J. Abrams|Star Wars: The Rise of Skywalker
The Matrix|1999|136|Sci-Fi,Action|The Wachowskis|
Interstellar|2014|169|Sci-Fi,Drama|Christopher Nolan|Interstellar (film)
Se7en|1995|127|Crime,Thriller,Mystery|David Fincher|Seven (1995 film)
Saving Private Ryan|1998|169|War,Drama|Steven Spielberg|
The Green Mile|1999|189|Drama,Fantasy,Crime|Frank Darabont|The Green Mile (film)
The Terminator|1984|107|Sci-Fi,Action|James Cameron|
Terminator 2: Judgment Day|1991|137|Sci-Fi,Action|James Cameron|
Back to the Future|1985|116|Sci-Fi,Adventure,Comedy|Robert Zemeckis|
Back to the Future Part II|1989|108|Sci-Fi,Adventure,Comedy|Robert Zemeckis|
Back to the Future Part III|1990|118|Sci-Fi,Adventure,Comedy|Robert Zemeckis|
Gladiator|2000|155|Action,Drama,History|Ridley Scott|Gladiator (2000 film)
The Pianist|2002|150|Drama,War,Biography|Roman Polanski|The Pianist (2002 film)
The Lion King|1994|88|Animation,Adventure,Drama|Allers & Minkoff|
The Departed|2006|151|Crime,Thriller,Drama|Martin Scorsese|
Whiplash|2014|106|Drama,Music|Damien Chazelle|Whiplash (2014 film)
The Prestige|2006|130|Drama,Mystery,Sci-Fi|Christopher Nolan|The Prestige (film)
Spider-Man: Across the Spider-Verse|2023|140|Animation,Action,Adventure|Joaquim Dos Santos|
Spider-Man: Into the Spider-Verse|2018|117|Animation,Action,Adventure|Bob Persichetti|
The Intouchables|2011|112|Comedy,Drama,Biography|Nakache & Toledano|
Django Unchained|2012|165|Western,Drama|Quentin Tarantino|
Alien|1979|117|Horror,Sci-Fi|Ridley Scott|Alien (film)
Aliens|1986|137|Action,Sci-Fi,Horror|James Cameron|Aliens (film)
Alien 3|1992|114|Sci-Fi,Horror|David Fincher|
Alien Resurrection|1997|109|Sci-Fi,Horror|Jean-Pierre Jeunet|
Prometheus|2012|124|Sci-Fi,Horror|Ridley Scott|Prometheus (2012 film)
Alien: Covenant|2017|122|Sci-Fi,Horror|Ridley Scott|
Alien: Romulus|2024|119|Sci-Fi,Horror|Fede Alvarez|
WALL-E|2008|98|Animation,Sci-Fi,Adventure|Andrew Stanton|
Memento|2000|113|Thriller,Mystery|Christopher Nolan|Memento (film)
The Odyssey|2026|0|Adventure,Drama|Christopher Nolan|The Odyssey (2026 film)
The Shining|1980|146|Horror,Drama|Stanley Kubrick|The Shining (film)
Inglourious Basterds|2009|153|War,Drama|Quentin Tarantino|
Good Will Hunting|1997|126|Drama|Gus Van Sant|
Toy Story|1995|81|Animation,Comedy,Adventure|John Lasseter|
Toy Story 2|1999|92|Animation,Comedy,Adventure|John Lasseter|
Toy Story 3|2010|103|Animation,Comedy,Adventure|Lee Unkrich|
Toy Story 4|2019|100|Animation,Comedy,Adventure|Josh Cooley|
Toy Story 5|2026|0|Animation,Comedy,Adventure|Andrew Stanton|
The Dark Knight Rises|2012|165|Action,Crime,Drama|Christopher Nolan|
Joker|2019|122|Crime,Drama,Thriller|Todd Phillips|Joker (2019 film)
Reservoir Dogs|1992|99|Crime,Thriller|Quentin Tarantino|
2001: A Space Odyssey|1968|149|Sci-Fi,Adventure|Stanley Kubrick|2001: A Space Odyssey (film)
Up|2009|96|Animation,Adventure,Comedy|Pete Docter|Up (2009 film)
Full Metal Jacket|1987|116|War,Drama|Stanley Kubrick|
Die Hard|1988|132|Action,Thriller|John McTiernan|
Raiders of the Lost Ark|1981|115|Action,Adventure|Steven Spielberg|
Indiana Jones and the Temple of Doom|1984|118|Action,Adventure|Steven Spielberg|
Indiana Jones and the Last Crusade|1989|127|Action,Adventure|Steven Spielberg|
Indiana Jones and the Kingdom of the Crystal Skull|2008|122|Action,Adventure|Steven Spielberg|
1917|2019|119|War,Drama|Sam Mendes|1917 (2019 film)
The Wolf of Wall Street|2013|180|Biography,Comedy,Crime|Martin Scorsese|The Wolf of Wall Street (2013 film)
The Truman Show|1998|103|Drama,Comedy,Sci-Fi|Peter Weir|
Green Book|2018|130|Drama,Comedy,Biography|Peter Farrelly|Green Book (film)
Jurassic Park|1993|127|Sci-Fi,Adventure|Steven Spielberg|Jurassic Park (film)
The Lost World: Jurassic Park|1997|129|Sci-Fi,Adventure|Steven Spielberg|
Jurassic Park III|2001|92|Sci-Fi,Adventure|Joe Johnston|
Jurassic World|2015|124|Sci-Fi,Adventure|Colin Trevorrow|
Jurassic World: Fallen Kingdom|2018|128|Sci-Fi,Adventure|J. A. Bayona|
Jurassic World Dominion|2022|147|Sci-Fi,Adventure|Colin Trevorrow|
Batman Begins|2005|140|Action,Crime,Drama|Christopher Nolan|
Oppenheimer|2023|180|Biography,Drama,History|Christopher Nolan|Oppenheimer (film)
The Sixth Sense|1999|107|Thriller,Mystery,Drama|M. Night Shyamalan|
The Thing|1982|109|Horror,Sci-Fi|John Carpenter|The Thing (1982 film)
No Country for Old Men|2007|122|Crime,Thriller,Drama|Coen Brothers|
Prisoners|2013|153|Thriller,Crime,Drama|Denis Villeneuve|Prisoners (2013 film)
A Beautiful Mind|2001|135|Biography,Drama|Ron Howard|A Beautiful Mind (film)
Project Hail Mary|2026|0|Sci-Fi,Adventure|Lord & Miller|Project Hail Mary (film)
Finding Nemo|2003|100|Animation,Adventure,Comedy|Andrew Stanton|
Catch Me If You Can|2002|141|Biography,Crime,Drama|Steven Spielberg|
Inside Out|2015|95|Animation,Adventure,Comedy|Pete Docter|Inside Out (2015 film)
Inside Out 2|2024|96|Animation,Adventure,Comedy|Kelsey Mann|
Hacksaw Ridge|2016|139|War,Biography,Drama|Mel Gibson|
Mad Max: Fury Road|2015|120|Action,Sci-Fi,Adventure|George Miller|
Furiosa: A Mad Max Saga|2024|148|Action,Sci-Fi,Adventure|George Miller|
Ratatouille|2007|111|Animation,Comedy,Adventure|Brad Bird|Ratatouille (film)
How to Train Your Dragon|2010|98|Animation,Adventure,Fantasy|DeBlois & Sanders|How to Train Your Dragon (2010 film)
The Grand Budapest Hotel|2014|99|Comedy,Drama|Wes Anderson|
Monsters, Inc.|2001|92|Animation,Comedy,Adventure|Pete Docter|
Ford v Ferrari|2019|152|Biography,Drama,Action|James Mangold|
Spider-Man|2002|121|Action,Adventure|Sam Raimi|Spider-Man (2002 film)
Spider-Man 2|2004|127|Action,Adventure|Sam Raimi|
Spider-Man 3|2007|139|Action,Adventure|Sam Raimi|
The Amazing Spider-Man|2012|136|Action,Adventure|Marc Webb|The Amazing Spider-Man (film)
The Amazing Spider-Man 2|2014|142|Action,Adventure|Marc Webb|
Spider-Man: Homecoming|2017|133|Action,Adventure|Jon Watts|
Spider-Man: Far From Home|2019|129|Action,Adventure|Jon Watts|
Spider-Man: No Way Home|2021|148|Action,Adventure|Jon Watts|
Spider-Man: Brand New Day|2026|0|Action,Adventure|Destin Daniel Cretton|
Logan|2017|137|Action,Drama,Sci-Fi|James Mangold|Logan (film)
Pirates of the Caribbean: The Curse of the Black Pearl|2003|143|Adventure,Fantasy,Action|Gore Verbinski|
The Big Lebowski|1998|117|Comedy,Crime|Coen Brothers|
The Incredibles|2004|115|Animation,Action,Adventure|Brad Bird|
Incredibles 2|2018|118|Animation,Action,Adventure|Brad Bird|
A Bug's Life|1998|95|Animation,Adventure,Comedy|John Lasseter|
Cars|2006|117|Animation,Comedy,Adventure|John Lasseter|Cars (film)
Cars 2|2011|106|Animation,Comedy,Adventure|John Lasseter|
Brave|2012|93|Animation,Adventure,Fantasy|Andrews & Chapman|Brave (2012 film)
Monsters University|2013|104|Animation,Comedy,Adventure|Dan Scanlon|
The Good Dinosaur|2015|93|Animation,Adventure,Comedy|Peter Sohn|
Finding Dory|2016|97|Animation,Adventure,Comedy|Andrew Stanton|
Cars 3|2017|102|Animation,Comedy,Adventure|Brian Fee|
Lightyear|2022|105|Animation,Sci-Fi,Adventure|Angus MacLane|Lightyear (film)
Robin Hood|1973|83|Animation,Adventure,Comedy|Wolfgang Reitherman|Robin Hood (1973 film)
The Little Mermaid|1989|83|Animation,Musical,Fantasy|Clements & Musker|The Little Mermaid (1989 film)
Beauty and the Beast|1991|84|Animation,Musical,Fantasy|Trousdale & Wise|Beauty and the Beast (1991 film)
Aladdin|1992|90|Animation,Musical,Fantasy|Clements & Musker|Aladdin (1992 Disney film)
James and the Giant Peach|1996|79|Animation,Adventure,Fantasy|Henry Selick|James and the Giant Peach (film)
Mulan|1998|88|Animation,Adventure,Musical|Bancroft & Cook|Mulan (1998 film)
Tarzan|1999|88|Animation,Adventure,Drama|Buck & Lima|Tarzan (1999 film)
Dinosaur|2000|82|Animation,Adventure,Family|Leighton & Zondag|Dinosaur (film)
Treasure Planet|2002|95|Animation,Sci-Fi,Adventure|Clements & Musker|
The Jungle Book|1967|78|Animation,Adventure,Musical|Wolfgang Reitherman|The Jungle Book (1967 film)
Chicken Little|2005|81|Animation,Comedy,Sci-Fi|Mark Dindal|Chicken Little (2005 film)
Bolt|2008|96|Animation,Adventure,Comedy|Williams & Howard|Bolt (2008 film)
Tangled|2010|100|Animation,Musical,Adventure|Greno & Howard|
Frankenweenie|2012|87|Animation,Horror,Comedy|Tim Burton|Frankenweenie (2012 film)
Wreck-It Ralph|2012|101|Animation,Comedy,Adventure|Rich Moore|
Planes|2013|91|Animation,Adventure,Comedy|Klay Hall|Planes (film)
Frozen|2013|102|Animation,Musical,Adventure|Buck & Lee|Frozen (2013 film)
Big Hero 6|2014|102|Animation,Action,Comedy|Hall & Williams|Big Hero 6 (film)
Zootopia|2016|108|Animation,Comedy,Crime|Howard & Moore|
Zootopia 2|2025|108|Animation,Comedy,Crime|Jared Bush|
Moana|2016|107|Animation,Musical,Adventure|Clements & Musker|Moana (2016 film)
Ralph Breaks the Internet|2018|112|Animation,Comedy,Adventure|Moore & Johnston|
Ice Age|2002|81|Animation,Comedy,Adventure|Chris Wedge|Ice Age (2002 film)
Ice Age: The Meltdown|2006|91|Animation,Comedy,Adventure|Carlos Saldanha|
Ice Age: Dawn of the Dinosaurs|2009|94|Animation,Comedy,Adventure|Carlos Saldanha|
Ice Age: Continental Drift|2012|88|Animation,Comedy,Adventure|Martino & Thurmeier|
Ice Age: Collision Course|2016|94|Animation,Comedy,Adventure|Mike Thurmeier|
Night at the Museum|2006|108|Comedy,Adventure,Fantasy|Shawn Levy|
Night at the Museum: Battle of the Smithsonian|2009|105|Comedy,Adventure,Fantasy|Shawn Levy|
X-Men|2000|104|Action,Sci-Fi|Bryan Singer|X-Men (film)
X2|2003|134|Action,Sci-Fi|Bryan Singer|X2 (film)
Hulk|2003|138|Action,Sci-Fi|Ang Lee|Hulk (film)
Fantastic Four|2005|106|Action,Adventure,Sci-Fi|Tim Story|Fantastic Four (2005 film)
X-Men: The Last Stand|2006|104|Action,Sci-Fi|Brett Ratner|
Ghost Rider|2007|114|Action,Fantasy|Mark Steven Johnson|Ghost Rider (2007 film)
Fantastic Four: Rise of the Silver Surfer|2007|92|Action,Adventure,Sci-Fi|Tim Story|
Iron Man|2008|126|Action,Sci-Fi|Jon Favreau|Iron Man (2008 film)
Iron Man 2|2010|124|Action,Sci-Fi|Jon Favreau|
Iron Man 3|2013|130|Action,Sci-Fi|Shane Black|
The Incredible Hulk|2008|112|Action,Sci-Fi|Louis Leterrier|The Incredible Hulk (film)
X-Men Origins: Wolverine|2009|107|Action,Sci-Fi|Gavin Hood|
Thor|2011|115|Action,Fantasy|Kenneth Branagh|Thor (film)
X-Men: First Class|2011|132|Action,Sci-Fi|Matthew Vaughn|
Captain America: The First Avenger|2011|124|Action,Adventure|Joe Johnston|
The Avengers|2012|143|Action,Sci-Fi|Joss Whedon|The Avengers (2012 film)
Avengers: Age of Ultron|2015|141|Action,Sci-Fi|Joss Whedon|
Avengers: Infinity War|2018|149|Action,Sci-Fi|Russo Brothers|
Avengers: Endgame|2019|181|Action,Sci-Fi|Russo Brothers|
The Wolverine|2013|126|Action,Sci-Fi|James Mangold|The Wolverine (film)
Thor: The Dark World|2013|112|Action,Fantasy|Alan Taylor|
Captain America: The Winter Soldier|2014|136|Action,Thriller|Russo Brothers|
X-Men: Days of Future Past|2014|132|Action,Sci-Fi|Bryan Singer|
Guardians of the Galaxy|2014|121|Action,Sci-Fi,Comedy|James Gunn|Guardians of the Galaxy (film)
Ant-Man|2015|117|Action,Sci-Fi,Comedy|Peyton Reed|Ant-Man (film)
Fantastic Four (2015)|2015|100|Action,Sci-Fi|Josh Trank|Fantastic Four (2015 film)
Deadpool|2016|108|Action,Comedy|Tim Miller|Deadpool (film)
Deadpool 2|2018|119|Action,Comedy|David Leitch|
Deadpool & Wolverine|2024|128|Action,Comedy|Shawn Levy|
Captain America: Civil War|2016|147|Action,Sci-Fi|Russo Brothers|
X-Men: Apocalypse|2016|144|Action,Sci-Fi|Bryan Singer|
Doctor Strange|2016|115|Action,Fantasy|Scott Derrickson|Doctor Strange (2016 film)
Guardians of the Galaxy Vol. 2|2017|136|Action,Sci-Fi,Comedy|James Gunn|
Thor: Ragnarok|2017|130|Action,Fantasy,Comedy|Taika Waititi|
Black Panther|2018|134|Action,Sci-Fi|Ryan Coogler|Black Panther (film)
Ant-Man and the Wasp|2018|118|Action,Sci-Fi,Comedy|Peyton Reed|
Venom|2018|112|Action,Sci-Fi|Ruben Fleischer|Venom (2018 film)
Captain Marvel|2019|123|Action,Sci-Fi|Boden & Fleck|Captain Marvel (film)
Dark Phoenix|2019|113|Action,Sci-Fi|Simon Kinberg|Dark Phoenix (film)
Venom: Let There Be Carnage|2021|97|Action,Sci-Fi|Andy Serkis|
Black Widow|2021|134|Action,Sci-Fi|Cate Shortland|Black Widow (2021 film)
Eternals|2021|156|Action,Sci-Fi|Chloe Zhao|Eternals (film)
Morbius|2022|104|Action,Horror,Sci-Fi|Daniel Espinosa|Morbius (film)
Shang-Chi and the Legend of the Ten Rings|2021|132|Action,Fantasy|Destin Daniel Cretton|
Doctor Strange in the Multiverse of Madness|2022|126|Action,Fantasy,Horror|Sam Raimi|
Thor: Love and Thunder|2022|118|Action,Fantasy,Comedy|Taika Waititi|
Black Panther: Wakanda Forever|2022|161|Action,Drama|Ryan Coogler|
Guardians of the Galaxy Vol. 3|2023|150|Action,Sci-Fi,Comedy|James Gunn|
The Fantastic Four: First Steps|2025|115|Action,Adventure,Sci-Fi|Matt Shakman|
Ant-Man and the Wasp: Quantumania|2023|124|Action,Sci-Fi,Comedy|Peyton Reed|

# ---- added in the September update ----
Over the Hedge|2006|83|Animation,Comedy,Adventure|Johnson & Kirkpatrick|Over the Hedge (film)
The BFG|2016|117|Fantasy,Adventure,Family|Steven Spielberg|The BFG (2016 film)
Transformers|2007|144|Action,Sci-Fi|Michael Bay|Transformers (film)
Transformers: Revenge of the Fallen|2009|150|Action,Sci-Fi|Michael Bay|
Transformers: Dark of the Moon|2011|154|Action,Sci-Fi|Michael Bay|
Transformers: Age of Extinction|2014|165|Action,Sci-Fi|Michael Bay|
Transformers: The Last Knight|2017|154|Action,Sci-Fi|Michael Bay|
I Am Legend|2007|101|Sci-Fi,Horror,Drama|Francis Lawrence|I Am Legend (film)
Now You See Me|2013|115|Thriller,Crime|Louis Leterrier|Now You See Me (film)
Borat|2006|84|Comedy|Larry Charles|Borat
Borat Subsequent Moviefilm|2020|95|Comedy|Jason Woliner|
Dallas Buyers Club|2013|117|Biography,Drama|Jean-Marc Vallee|
Grown Ups|2010|102|Comedy|Dennis Dugan|Grown Ups (film)
Grown Ups 2|2013|101|Comedy|Dennis Dugan|
Shark Tale|2004|90|Animation,Comedy,Adventure|Bergeron & Letterman|
Kung Fu Panda|2008|92|Animation,Action,Comedy|Osborne & Stevenson|Kung Fu Panda (film)
Kung Fu Panda 2|2011|91|Animation,Action,Comedy|Jennifer Yuh Nelson|
Kung Fu Panda 3|2016|95|Animation,Action,Comedy|Nelson & Carloni|
Kung Fu Panda 4|2024|94|Animation,Action,Comedy|Mike Mitchell|
Shrek|2001|90|Animation,Comedy,Fantasy|Adamson & Jenson|Shrek
Shrek 2|2004|93|Animation,Comedy,Fantasy|Adamson, Asbury & Vernon|
Shrek the Third|2007|93|Animation,Comedy,Fantasy|Miller & Hui|
Shrek Forever After|2010|93|Animation,Comedy,Fantasy|Mike Mitchell|
Kingsman: The Secret Service|2014|129|Action,Comedy,Thriller|Matthew Vaughn|
Kingsman: The Golden Circle|2017|141|Action,Comedy,Thriller|Matthew Vaughn|
Deepwater Horizon|2016|107|Drama,Thriller,History|Peter Berg|Deepwater Horizon (film)
Tron: Legacy|2010|125|Sci-Fi,Action|Joseph Kosinski|
Tron: Ares|2025|119|Sci-Fi,Action|Joachim Ronning|
Pacific Rim|2013|131|Sci-Fi,Action|Guillermo del Toro|Pacific Rim (film)
The Hateful Eight|2015|168|Western,Crime,Drama|Quentin Tarantino|
Once Upon a Time in Hollywood|2019|161|Comedy,Drama|Quentin Tarantino|
Maleficent|2014|97|Fantasy,Adventure|Robert Stromberg|Maleficent (film)
Superbad|2007|113|Comedy|Greg Mottola|Superbad (film)
Pineapple Express|2008|111|Comedy,Action,Crime|David Gordon Green|Pineapple Express (film)
This Is the End|2013|107|Comedy|Rogen & Goldberg|
The Interview|2014|112|Comedy|Rogen & Goldberg|The Interview
Cloverfield|2008|85|Sci-Fi,Horror,Thriller|Matt Reeves|
10 Cloverfield Lane|2016|103|Thriller,Sci-Fi,Horror|Dan Trachtenberg|
Teenage Mutant Ninja Turtles|2014|101|Action,Adventure,Comedy|Jonathan Liebesman|Teenage Mutant Ninja Turtles (2014 film)
Sausage Party|2016|89|Animation,Comedy|Vernon & Tiernan|
Harold & Kumar Go to White Castle|2004|88|Comedy,Adventure|Danny Leiner|
Harold & Kumar Escape from Guantanamo Bay|2008|107|Comedy,Adventure|Hurwitz & Schlossberg|
American Pie|1999|95|Comedy|Weitz Brothers|American Pie (film)
American Pie 2|2001|108|Comedy|J.B. Rogers|
American Wedding|2003|103|Comedy|Jesse Dylan|
American Reunion|2012|113|Comedy|Hurwitz & Schlossberg|
Bad Neighbours|2014|97|Comedy|Nicholas Stoller|Neighbors (2014 film)
Bad Neighbours 2|2016|92|Comedy|Nicholas Stoller|Neighbors 2: Sorority Rising
The Green Hornet|2011|119|Action,Comedy|Michel Gondry|The Green Hornet (2011 film)
The 40-Year-Old Virgin|2005|116|Comedy,Romance|Judd Apatow|
Oblivion|2013|124|Sci-Fi,Action|Joseph Kosinski|Oblivion (2013 film)
The Hitman's Wife's Bodyguard|2021|100|Action,Comedy|Patrick Hughes|
Going in Style|2017|96|Comedy,Crime|Zach Braff|Going in Style (2017 film)
Now You See Me 2|2016|129|Thriller,Crime|Jon M. Chu|
Ted|2012|106|Comedy|Seth MacFarlane|Ted (film)
Ted 2|2015|115|Comedy|Seth MacFarlane|
Lucy|2014|89|Sci-Fi,Action|Luc Besson|Lucy (2014 film)
Transcendence|2014|119|Sci-Fi,Drama|Wally Pfister|Transcendence (2014 film)
The Lego Movie|2014|100|Animation,Comedy,Adventure|Lord & Miller|
Olympus Has Fallen|2013|119|Action,Thriller|Antoine Fuqua|
The Bucket List|2007|97|Comedy,Drama|Rob Reiner|
War of the Worlds|2005|116|Sci-Fi,Thriller|Steven Spielberg|War of the Worlds (2005 film)
Ender's Game|2013|114|Sci-Fi,Action|Gavin Hood|Ender's Game (film)
Real Steel|2011|127|Sci-Fi,Action,Drama|Shawn Levy|
Rise of the Planet of the Apes|2011|105|Sci-Fi,Action|Rupert Wyatt|
Dawn of the Planet of the Apes|2014|130|Sci-Fi,Action|Matt Reeves|
War for the Planet of the Apes|2017|140|Sci-Fi,Action|Matt Reeves|
Kingdom of the Planet of the Apes|2024|145|Sci-Fi,Action|Wes Ball|
Predator|1987|107|Sci-Fi,Action,Horror|John McTiernan|Predator (film)
Edge of Tomorrow|2014|113|Sci-Fi,Action|Doug Liman|Edge of Tomorrow (film)
District 9|2009|112|Sci-Fi,Thriller|Neill Blomkamp|
Elysium|2013|109|Sci-Fi,Action|Neill Blomkamp|Elysium (film)
E.T. the Extra-Terrestrial|1982|115|Sci-Fi,Adventure,Family|Steven Spielberg|
Ex Machina|2014|108|Sci-Fi,Drama,Thriller|Alex Garland|Ex Machina (film)
The Martian|2015|144|Sci-Fi,Adventure,Drama|Ridley Scott|The Martian (film)
Avatar|2009|162|Sci-Fi,Adventure|James Cameron|Avatar (2009 film)
Avatar: The Way of Water|2022|192|Sci-Fi,Adventure|James Cameron|
Close Encounters of the Third Kind|1977|135|Sci-Fi,Drama|Steven Spielberg|
Star Trek|2009|127|Sci-Fi,Action|J.J. Abrams|Star Trek (film)
RoboCop|1987|102|Sci-Fi,Action|Paul Verhoeven|RoboCop
Total Recall|1990|113|Sci-Fi,Action|Paul Verhoeven|Total Recall (1990 film)
Sunshine|2007|107|Sci-Fi,Thriller|Danny Boyle|Sunshine (2007 film)
The Fly|1986|96|Horror,Sci-Fi|David Cronenberg|The Fly (1986 film)
Dredd|2012|95|Sci-Fi,Action|Pete Travis|
Godzilla|2014|123|Sci-Fi,Action|Gareth Edwards|Godzilla (2014 film)
Independence Day|1996|145|Sci-Fi,Action|Roland Emmerich|Independence Day (1996 film)
John Carter|2012|132|Sci-Fi,Adventure|Andrew Stanton|John Carter (film)
Waterworld|1995|135|Sci-Fi,Adventure|Kevin Reynolds|
The Day After Tomorrow|2004|124|Sci-Fi,Action,Thriller|Roland Emmerich|

# ---- second update ----
Zathura: A Space Adventure|2005|101|Sci-Fi,Adventure,Family|Jon Favreau|
The Mummy Returns|2001|130|Action,Adventure,Fantasy|Stephen Sommers|
Race to Witch Mountain|2009|99|Sci-Fi,Adventure|Andy Fickman|
Tooth Fairy|2010|101|Comedy,Family,Fantasy|Michael Lembeck|Tooth Fairy (2010 film)
The Fast and the Furious|2001|106|Action,Crime|Rob Cohen|The Fast and the Furious (2001 film)
2 Fast 2 Furious|2003|107|Action,Crime|John Singleton|
The Fast and the Furious: Tokyo Drift|2006|104|Action,Crime|Justin Lin|
Fast & Furious|2009|107|Action,Crime|Justin Lin|Fast & Furious (2009 film)
Fast Five|2011|130|Action,Crime|Justin Lin|
Fast & Furious 6|2013|130|Action,Crime|Justin Lin|
Furious 7|2015|137|Action,Crime|James Wan|
The Fate of the Furious|2017|136|Action,Crime|F. Gary Gray|
F9|2021|143|Action,Crime|Justin Lin|F9 (film)
Journey 2: The Mysterious Island|2012|94|Adventure,Fantasy|Brad Peyton|
Journey to the Center of the Earth|2008|93|Adventure,Fantasy|Eric Brevig|Journey to the Center of the Earth (2008 film)
Pain & Gain|2013|129|Action,Comedy,Crime|Michael Bay|
San Andreas|2015|114|Action,Thriller|Brad Peyton|San Andreas (film)
Central Intelligence|2016|107|Action,Comedy|Rawson Marshall Thurber|
Jumanji: Welcome to the Jungle|2017|119|Action,Adventure,Comedy|Jake Kasdan|
Jumanji: The Next Level|2019|123|Action,Adventure,Comedy|Jake Kasdan|
Baywatch|2017|116|Action,Comedy|Seth Gordon|Baywatch (film)
Rampage|2018|107|Action,Sci-Fi|Brad Peyton|Rampage (2018 film)
Skyscraper|2018|102|Action,Thriller|Rawson Marshall Thurber|Skyscraper (2018 film)
Fast & Furious Presents: Hobbs & Shaw|2019|137|Action,Comedy|David Leitch|
Red Notice|2021|118|Action,Comedy,Crime|Rawson Marshall Thurber|Red Notice (film)
Black Adam|2022|125|Action,Fantasy|Jaume Collet-Serra|Black Adam (film)
The Secret Life of Pets|2016|87|Animation,Comedy,Adventure|Chris Renaud|
Get Hard|2015|100|Comedy|Etan Cohen|
Ride Along|2014|99|Action,Comedy|Tim Story|Ride Along (film)
Little Fockers|2010|98|Comedy|Paul Weitz|
Failure to Launch|2006|97|Comedy,Romance|Tom Dey|
Tropic Thunder|2008|107|Action,Comedy|Ben Stiller|
Titanic|1997|194|Drama,Romance|James Cameron|Titanic (1997 film)
Everest|2015|121|Adventure,Drama,Thriller|Baltasar Kormakur|Everest (2015 film)
Groundhog Day|1993|101|Comedy,Fantasy,Romance|Harold Ramis|Groundhog Day (film)
The Social Network|2010|120|Biography,Drama|David Fincher|
Rain Man|1988|133|Drama|Barry Levinson|
Cast Away|2000|143|Adventure,Drama|Robert Zemeckis|
Zodiac|2007|157|Crime,Thriller,Mystery|David Fincher|Zodiac (film)
127 Hours|2010|94|Biography,Adventure,Drama|Danny Boyle|
The Pursuit of Happyness|2006|117|Biography,Drama|Gabriele Muccino|
The Terminal|2004|128|Comedy,Drama|Steven Spielberg|
Tomorrowland|2015|130|Sci-Fi,Adventure|Brad Bird|Tomorrowland (film)
Moneyball|2011|133|Biography,Drama,Sport|Bennett Miller|Moneyball (film)
Knives Out|2019|130|Mystery,Comedy,Crime|Rian Johnson|
Glass Onion: A Knives Out Mystery|2022|139|Mystery,Comedy,Crime|Rian Johnson|Glass Onion
Wake Up Dead Man: A Knives Out Mystery|2025|0|Mystery,Comedy,Crime|Rian Johnson|Wake Up Dead Man
Fury|2014|134|War,Drama|David Ayer|Fury (2014 film)
Captain Phillips|2013|134|Biography,Thriller,Drama|Paul Greengrass|Captain Phillips (film)
Life|2017|104|Sci-Fi,Horror,Thriller|Daniel Espinosa|Life (2017 film)
Brokeback Mountain|2005|134|Drama,Romance|Ang Lee|
Nightcrawler|2014|118|Crime,Thriller,Drama|Dan Gilroy|Nightcrawler (film)
The Guilty|2021|90|Thriller,Crime|Antoine Fuqua|The Guilty (2021 American film)
Guy Ritchie's The Covenant|2023|123|War,Action,Drama|Guy Ritchie|
Bubble Boy|2001|84|Comedy,Adventure|Blair Hayes|Bubble Boy (film)
Beautiful Boy|2018|120|Biography,Drama|Felix van Groeningen|Beautiful Boy (2018 film)
Crazy, Stupid, Love|2011|118|Comedy,Romance,Drama|Ficarra & Requa|
The Big Short|2015|130|Biography,Comedy,Drama|Adam McKay|The Big Short (film)
Despicable Me|2010|95|Animation,Comedy,Adventure|Coffin & Renaud|
Despicable Me 2|2013|98|Animation,Comedy,Adventure|Coffin & Renaud|
Despicable Me 3|2017|89|Animation,Comedy,Adventure|Coffin & Balda|
Despicable Me 4|2024|94|Animation,Comedy,Adventure|Chris Renaud|
Anchorman: The Legend of Ron Burgundy|2004|94|Comedy|Adam McKay|
Anchorman 2: The Legend Continues|2013|119|Comedy|Adam McKay|
Minions|2015|91|Animation,Comedy,Adventure|Coffin & Balda|Minions (film)
Vice|2018|132|Biography,Comedy,Drama|Adam McKay|Vice (2018 film)
Horton Hears a Who!|2008|86|Animation,Comedy,Adventure|Hayward & Martino|Horton Hears a Who! (film)
Jackass: The Movie|2002|87|Comedy,Documentary|Jeff Tremaine|
Jackass Number Two|2006|92|Comedy,Documentary|Jeff Tremaine|
Jackass 3D|2010|94|Comedy,Documentary|Jeff Tremaine|
Jackass Forever|2022|96|Comedy,Documentary|Jeff Tremaine|
Jackass 4.5|2022|89|Comedy,Documentary|Jeff Tremaine|
The Lorax|2012|86|Animation,Comedy,Musical|Renaud & Balda|The Lorax (film)
Need for Speed|2014|132|Action,Crime|Scott Waugh|Need for Speed (film)
Ad Astra|2019|123|Sci-Fi,Drama|James Gray|Ad Astra (film)
The Maze Runner|2014|113|Sci-Fi,Action|Wes Ball|The Maze Runner (film)
Maze Runner: The Scorch Trials|2015|131|Sci-Fi,Action|Wes Ball|
Maze Runner: The Death Cure|2018|142|Sci-Fi,Action|Wes Ball|
The Hunger Games|2012|142|Sci-Fi,Action|Gary Ross|The Hunger Games (film)
The Hunger Games: Catching Fire|2013|146|Sci-Fi,Action|Francis Lawrence|
The Hunger Games: Mockingjay - Part 1|2014|123|Sci-Fi,Action|Francis Lawrence|The Hunger Games: Mockingjay – Part 1
The Hunger Games: Mockingjay - Part 2|2015|137|Sci-Fi,Action|Francis Lawrence|The Hunger Games: Mockingjay – Part 2
Divergent|2014|139|Sci-Fi,Action|Neil Burger|Divergent (film)
Insurgent|2015|119|Sci-Fi,Action|Robert Schwentke|The Divergent Series: Insurgent
The Hobbit: An Unexpected Journey|2012|169|Fantasy,Adventure|Peter Jackson|
The Hobbit: The Desolation of Smaug|2013|161|Fantasy,Adventure|Peter Jackson|
The Hobbit: The Battle of the Five Armies|2014|144|Fantasy,Adventure|Peter Jackson|
Annihilation|2018|115|Sci-Fi,Horror,Thriller|Alex Garland|Annihilation (film)
9|2009|79|Animation,Sci-Fi,Adventure|Shane Acker|9 (2009 animated film)
Gravity|2013|91|Sci-Fi,Thriller,Drama|Alfonso Cuaron|Gravity (2013 film)
Slumdog Millionaire|2008|120|Drama,Romance|Danny Boyle|
The Equalizer|2014|132|Action,Thriller,Crime|Antoine Fuqua|The Equalizer (film)
The Equalizer 2|2018|121|Action,Thriller,Crime|Antoine Fuqua|
John Wick|2014|101|Action,Thriller,Crime|Chad Stahelski|John Wick (film)
John Wick: Chapter 2|2017|122|Action,Thriller,Crime|Chad Stahelski|
The Revenant|2015|156|Adventure,Drama,Western|Alejandro G. Inarritu|The Revenant (2015 film)
Straight Outta Compton|2015|147|Biography,Drama,Music|F. Gary Gray|Straight Outta Compton (film)
American Sniper|2014|133|Biography,War,Drama|Clint Eastwood|
The Great Gatsby|2013|143|Drama,Romance|Baz Luhrmann|The Great Gatsby (2013 film)
Life of Pi|2012|127|Adventure,Drama,Fantasy|Ang Lee|Life of Pi (film)
Civil War|2024|109|Action,Drama,War|Alex Garland|Civil War (film)
Mickey 17|2025|137|Sci-Fi,Comedy,Drama|Bong Joon-ho|
A Quiet Place|2018|90|Horror,Thriller,Sci-Fi|John Krasinski|A Quiet Place (film)
A Quiet Place Part II|2020|97|Horror,Thriller,Sci-Fi|John Krasinski|
A Quiet Place: Day One|2024|99|Horror,Thriller,Sci-Fi|Michael Sarnoski|
Rocky|1976|120|Drama,Sport|John G. Avildsen|Rocky
Rocky II|1979|119|Drama,Sport|Sylvester Stallone|
Rocky III|1982|100|Drama,Sport|Sylvester Stallone|
Logan Lucky|2017|118|Comedy,Crime|Steven Soderbergh|
Paul|2011|104|Comedy,Sci-Fi|Greg Mottola|Paul (film)
Tenet|2020|150|Sci-Fi,Action,Thriller|Christopher Nolan|Tenet (film)
Uncut Gems|2019|135|Crime,Drama,Thriller|Safdie Brothers|
Bullet Train|2022|127|Action,Comedy,Thriller|David Leitch|Bullet Train (film)
The Notebook|2004|123|Romance,Drama|Nick Cassavetes|The Notebook (2004 film)
Aquaman|2018|143|Action,Fantasy,Adventure|James Wan|Aquaman (film)
Aquaman and the Lost Kingdom|2023|124|Action,Fantasy,Adventure|James Wan|
Man of Steel|2013|143|Action,Sci-Fi|Zack Snyder|Man of Steel (film)
Wonder Woman|2017|141|Action,Fantasy,Adventure|Patty Jenkins|Wonder Woman (2017 film)
Wonder Woman 1984|2020|151|Action,Fantasy,Adventure|Patty Jenkins|
World War Z|2013|116|Horror,Action,Thriller|Marc Forster|World War Z (film)
Limitless|2011|105|Thriller,Sci-Fi|Neil Burger|Limitless (film)
Notting Hill|1999|124|Romance,Comedy|Roger Michell|Notting Hill (film)
Voicemails for Isabelle
50 First Dates|2004|99|Comedy,Romance|Peter Segal|
Wedding Crashers|2005|119|Comedy,Romance|David Dobkin|
About Time|2013|123|Romance,Comedy,Drama|Richard Curtis|About Time (2013 film)
The Invention of Lying|2009|99|Comedy,Fantasy,Romance|Gervais & Robinson|
Midsommar|2019|148|Horror,Drama,Mystery|Ari Aster|
Dracula Untold|2014|92|Action,Fantasy,Horror|Gary Shore|
Frankenstein (2025)|2025|149|Horror,Drama,Sci-Fi|Guillermo del Toro|Frankenstein (2025 film)
Bird Box|2018|124|Horror,Thriller,Sci-Fi|Susanne Bier|Bird Box (film)
Us|2019|116|Horror,Thriller,Mystery|Jordan Peele|Us (2019 film)
Skyfall|2012|143|Action,Thriller|Sam Mendes|
Spectre|2015|148|Action,Thriller|Sam Mendes|Spectre (2015 film)
No Time to Die|2021|163|Action,Thriller|Cary Joji Fukunaga|
Zombieland|2009|88|Comedy,Horror|Ruben Fleischer|
The Conjuring|2013|112|Horror,Thriller,Mystery|James Wan|
The Pyramid|2014|89|Horror,Thriller|Gregory Levasseur|The Pyramid (2014 film)
The Blair Witch Project|1999|81|Horror,Mystery|Myrick & Sanchez|
Project X|2012|88|Comedy|Nima Nourizadeh|Project X (2012 film)
It|2017|135|Horror,Drama|Andy Muschietti|It (2017 film)
It Chapter Two|2019|169|Horror,Drama|Andy Muschietti|
The Platform|2019|94|Sci-Fi,Horror,Thriller|Galder Gaztelu-Urrutia|The Platform (film)
The Conjuring 2|2016|134|Horror,Thriller,Mystery|James Wan|
F1|2025|156|Action,Drama,Sport|Joseph Kosinski|F1 (film)
Ocean's Thirteen|2007|122|Comedy,Crime,Thriller|Steven Soderbergh|
Ocean's Eleven|2001|116|Comedy,Crime,Thriller|Steven Soderbergh|Ocean's Eleven (2001 film)
Ocean's Twelve|2004|125|Comedy,Crime,Thriller|Steven Soderbergh|
Meet Joe Black|1998|178|Drama,Fantasy,Romance|Martin Brest|
The Da Vinci Code|2006|149|Mystery,Thriller|Ron Howard|The Da Vinci Code (film)
Mission: Impossible 2|2000|123|Action,Thriller|John Woo|Mission: Impossible 2
Mission: Impossible III|2006|126|Action,Thriller|J.J. Abrams|
Mission: Impossible - Ghost Protocol|2011|133|Action,Thriller|Brad Bird|Mission: Impossible – Ghost Protocol
Mission: Impossible - Rogue Nation|2015|131|Action,Thriller|Christopher McQuarrie|Mission: Impossible – Rogue Nation
Mission: Impossible - Fallout|2018|147|Action,Thriller|Christopher McQuarrie|Mission: Impossible – Fallout
Mission: Impossible - Dead Reckoning Part One|2023|163|Action,Thriller|Christopher McQuarrie|Mission: Impossible – Dead Reckoning Part One
Mission: Impossible - The Final Reckoning|2025|169|Action,Thriller|Christopher McQuarrie|Mission: Impossible – The Final Reckoning

# ---- third update ----
Harry Potter and the Philosopher's Stone|2001|152|Fantasy,Adventure,Family|Chris Columbus|Harry Potter and the Philosopher's Stone (film)
Harry Potter and the Chamber of Secrets|2002|161|Fantasy,Adventure,Family|Chris Columbus|Harry Potter and the Chamber of Secrets (film)
Harry Potter and the Prisoner of Azkaban|2004|142|Fantasy,Adventure,Family|Alfonso Cuaron|Harry Potter and the Prisoner of Azkaban (film)
Harry Potter and the Goblet of Fire|2005|157|Fantasy,Adventure,Family|Mike Newell|Harry Potter and the Goblet of Fire (film)
Harry Potter and the Order of the Phoenix|2007|138|Fantasy,Adventure,Family|David Yates|Harry Potter and the Order of the Phoenix (film)
Harry Potter and the Half-Blood Prince|2009|153|Fantasy,Adventure,Family|David Yates|Harry Potter and the Half-Blood Prince (film)
Harry Potter and the Deathly Hallows - Part 1|2010|146|Fantasy,Adventure,Family|David Yates|Harry Potter and the Deathly Hallows – Part 1
Harry Potter and the Deathly Hallows - Part 2|2011|130|Fantasy,Adventure,Family|David Yates|Harry Potter and the Deathly Hallows – Part 2
King Kong|2005|187|Adventure,Drama,Fantasy|Peter Jackson|King Kong (2005 film)
Mortal Engines|2018|128|Sci-Fi,Adventure|Christian Rivers|Mortal Engines (film)
Bee Movie|2007|91|Animation,Comedy,Adventure|Hickner & Smith|
Cool Runnings|1993|98|Comedy,Sport,Drama|Jon Turteltaub|
American Made|2017|115|Biography,Crime,Comedy|Doug Liman|American Made (film)
Fantastic Mr. Fox|2009|87|Animation,Comedy,Adventure|Wes Anderson|Fantastic Mr. Fox (film)
The Spiderwick Chronicles|2008|96|Fantasy,Adventure,Family|Mark Waters|The Spiderwick Chronicles (film)
The Ant Bully|2006|88|Animation,Adventure,Family|John A. Davis|The Ant Bully (film)
Arthur and the Invisibles|2006|94|Animation,Adventure,Fantasy|Luc Besson|
Epic|2013|102|Animation,Adventure,Fantasy|Chris Wedge|Epic (2013 film)
The Blind Side|2009|129|Biography,Drama,Sport|John Lee Hancock|The Blind Side (film)
Megamind|2010|95|Animation,Action,Comedy|Tom McGrath|
Rango|2011|107|Animation,Comedy,Western|Gore Verbinski|Rango (2011 film)
Jason Bourne|2016|123|Action,Thriller|Paul Greengrass|Jason Bourne (film)
Herbie Fully Loaded|2005|101|Comedy,Family,Sport|Angela Robinson|
Space Chimps|2008|81|Animation,Adventure,Comedy|Kirk DeMicco|
Surf's Up|2007|85|Animation,Comedy,Sport|Brannon & Buck|Surf's Up (film)
Flushed Away|2006|85|Animation,Comedy,Adventure|Bowers & Fell|
Hellboy|2004|122|Action,Fantasy,Horror|Guillermo del Toro|Hellboy (2004 film)
Hellboy II: The Golden Army|2008|120|Action,Fantasy|Guillermo del Toro|
Alice in Wonderland|2010|108|Fantasy,Adventure,Family|Tim Burton|Alice in Wonderland (2010 film)
Percy Jackson & the Olympians: The Lightning Thief|2010|118|Fantasy,Adventure|Chris Columbus|
Percy Jackson: Sea of Monsters|2013|106|Fantasy,Adventure|Thor Freudenthal|
Clash of the Titans|2010|106|Fantasy,Action,Adventure|Louis Leterrier|Clash of the Titans (2010 film)
Gods of Egypt|2016|127|Fantasy,Action,Adventure|Alex Proyas|Gods of Egypt (film)
I, Robot|2004|115|Sci-Fi,Action,Thriller|Alex Proyas|I, Robot (film)
Alita: Battle Angel|2019|122|Sci-Fi,Action|Robert Rodriguez|
Men in Black|1997|98|Sci-Fi,Action,Comedy|Barry Sonnenfeld|Men in Black (1997 film)
Men in Black II|2002|88|Sci-Fi,Action,Comedy|Barry Sonnenfeld|
Men in Black 3|2012|106|Sci-Fi,Action,Comedy|Barry Sonnenfeld|
Men in Black: International|2019|114|Sci-Fi,Action,Comedy|F. Gary Gray|
Valerian and the City of a Thousand Planets|2017|137|Sci-Fi,Action,Adventure|Luc Besson|
Jupiter Ascending|2015|127|Sci-Fi,Action,Adventure|The Wachowskis|
The Lost City of Z|2016|141|Biography,Adventure,Drama|James Gray|The Lost City of Z (film)
The Hurt Locker|2008|131|War,Drama,Thriller|Kathryn Bigelow|
Dunkirk|2017|106|War,Action,Drama|Christopher Nolan|Dunkirk (2017 film)
Charlotte's Web|2006|97|Family,Comedy,Drama|Gary Winick|Charlotte's Web (2006 film)
Monster House|2006|91|Animation,Comedy,Horror|Gil Kenan|Monster House (film)
Happy Feet|2006|108|Animation,Comedy,Musical|George Miller|
Ready Player One|2018|140|Sci-Fi,Action,Adventure|Steven Spielberg|Ready Player One (film)
Predator: Badlands|2025|107|Sci-Fi,Action,Horror|Dan Trachtenberg|
The Peanut Butter Falcon|2019|97|Adventure,Comedy,Drama|Nilson & Schwartz|
Paddington|2014|95|Comedy,Family,Adventure|Paul King|Paddington (film)
Garfield: The Movie|2004|80|Animation,Comedy,Family|Peter Hewitt|Garfield (film)
Garfield: A Tail of Two Kitties|2006|78|Animation,Comedy,Family|Tim Hill|
Apollo 13|1995|140|Drama,History,Adventure|Ron Howard|Apollo 13 (film)
Robots|2005|91|Animation,Comedy,Adventure|Chris Wedge|Robots (2005 film)
Wallace & Gromit: The Curse of the Were-Rabbit|2005|85|Animation,Comedy,Adventure|Nick Park|
Chicken Run|2000|84|Animation,Comedy,Adventure|Lord & Park|
Chicken Run: Dawn of the Nugget|2023|101|Animation,Comedy,Adventure|Sam Fell|
Brother Bear|2003|85|Animation,Adventure,Drama|Blaise & Walker|
The Polar Express|2004|100|Animation,Adventure,Family|Robert Zemeckis|The Polar Express (film)
Madagascar|2005|86|Animation,Comedy,Adventure|Darnell & McGrath|Madagascar (2005 film)
Madagascar: Escape 2 Africa|2008|89|Animation,Comedy,Adventure|Darnell & McGrath|
Madagascar 3: Europe's Most Wanted|2012|93|Animation,Comedy,Adventure|Darnell & McGrath|
Free Birds|2013|91|Animation,Comedy,Adventure|Jimmy Hayward|
Open Season|2006|86|Animation,Comedy,Adventure|Allers & Culton|Open Season (2006 film)
Open Season 2|2008|76|Animation,Comedy,Adventure|Matthew O'Callaghan|
Open Season 3|2010|84|Animation,Comedy,Adventure|Cody Cameron|
The Housemaid|2025|0|Thriller,Drama|Paul Feig|The Housemaid (2025 film)
Diary of a Wimpy Kid|2010|94|Comedy,Family|Thor Freudenthal|Diary of a Wimpy Kid (2010 film)
`;

/* Parse the block above into objects. `id` is a stable slug used as the
   localStorage key for your rating - don't rename titles casually or you
   will orphan a rating. */
/* Turn the block above into objects. Every field except the title is
   optional, and a line that can't be read is skipped with a note in the
   browser console rather than breaking the whole page. */

const seenIds = new Set();

const MOVIES = MOVIE_SOURCE
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0 && line[0] !== '#')   // # starts a comment
  .map((line, index) => {
    const parts = line.split('|').map(s => s.trim());
    const title = parts[0];

    if (!title) {
      console.warn('[cinevault] line ' + (index + 1) + ' has no title, skipped:', line);
      return null;
    }

    // The id keys your rating and your poster filename, so it must be unique.
    let id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (seenIds.has(id)) {
      console.warn('[cinevault] duplicate title "' + title + '" - rename one of them ' +
                   'or they will share a rating and a poster.');
      let n = 2;
      while (seenIds.has(id + '-' + n)) n++;
      id = id + '-' + n;
    }
    seenIds.add(id);

    const year = parseInt(parts[1], 10);

    return {
      id,
      title,
      year: isNaN(year) ? 0 : year,
      runtime: parseInt(parts[2], 10) || 0,
      genres: (parts[3] || '').split(',').map(g => g.trim()).filter(Boolean),
      director: parts[4] || '',
      wiki: parts[5] || title,
      order: index
    };
  })
  .filter(Boolean);

window.MOVIES = MOVIES;
