/* ============================================================
   CAST
   ------------------------------------------------------------
   Lead actors per film, used by the Statistics page to work out
   your top actors. Nothing else on the site reads this file, so
   a film missing from here still works everywhere else - it just
   doesn't contribute to the actor rankings.

   One film per line:
     Title|Actor, Actor, Actor

   The title must match movies.js exactly. Three or four billed
   leads is the right amount - adding the whole cast would drown
   the rankings in one-line parts.
   ============================================================ */

const CAST_SOURCE = `
We're the Millers|Jason Sudeikis, Jennifer Aniston, Emma Roberts
The Other Guys|Will Ferrell, Mark Wahlberg, Eva Mendes
Blade Runner 2049|Ryan Gosling, Harrison Ford, Ana de Armas
Shutter Island|Leonardo DiCaprio, Mark Ruffalo, Ben Kingsley
Dune|Timothee Chalamet, Rebecca Ferguson, Oscar Isaac
Dune: Part Two|Timothee Chalamet, Zendaya, Austin Butler
Top Gun: Maverick|Tom Cruise, Miles Teller, Jennifer Connelly
Horrible Bosses|Jason Bateman, Charlie Day, Jason Sudeikis
22 Jump Street|Jonah Hill, Channing Tatum, Ice Cube
21 Jump Street|Jonah Hill, Channing Tatum, Ice Cube
The Nice Guys|Ryan Gosling, Russell Crowe, Angourie Rice
Due Date|Robert Downey Jr., Zach Galifianakis, Michelle Monaghan
The Invisible Man|Elisabeth Moss, Oliver Jackson-Cohen, Aldis Hodge
The Shawshank Redemption|Tim Robbins, Morgan Freeman, Bob Gunton
The Godfather|Marlon Brando, Al Pacino, James Caan
The Dark Knight|Christian Bale, Heath Ledger, Aaron Eckhart
Schindler's List|Liam Neeson, Ben Kingsley, Ralph Fiennes
Pulp Fiction|John Travolta, Samuel L. Jackson, Uma Thurman
Forrest Gump|Tom Hanks, Robin Wright, Gary Sinise
Fight Club|Brad Pitt, Edward Norton, Helena Bonham Carter
Inception|Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page
Star Wars: Episode I - The Phantom Menace|Liam Neeson, Ewan McGregor, Natalie Portman
Star Wars: Episode II - Attack of the Clones|Ewan McGregor, Natalie Portman, Hayden Christensen
Star Wars: Episode III - Revenge of the Sith|Ewan McGregor, Natalie Portman, Hayden Christensen
Star Wars: Episode IV - A New Hope|Mark Hamill, Harrison Ford, Carrie Fisher
Star Wars: Episode V - The Empire Strikes Back|Mark Hamill, Harrison Ford, Carrie Fisher
Star Wars: Episode VI - Return of the Jedi|Mark Hamill, Harrison Ford, Carrie Fisher
Star Wars: Episode VII - The Force Awakens|Daisy Ridley, John Boyega, Harrison Ford
Star Wars: Episode VIII - The Last Jedi|Daisy Ridley, Mark Hamill, Adam Driver
Star Wars: Episode IX - The Rise of Skywalker|Daisy Ridley, Adam Driver, John Boyega
The Matrix|Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss
Interstellar|Matthew McConaughey, Anne Hathaway, Jessica Chastain
Se7en|Brad Pitt, Morgan Freeman, Kevin Spacey
Saving Private Ryan|Tom Hanks, Matt Damon, Tom Sizemore
The Green Mile|Tom Hanks, Michael Clarke Duncan, David Morse
The Terminator|Arnold Schwarzenegger, Linda Hamilton, Michael Biehn
Terminator 2: Judgment Day|Arnold Schwarzenegger, Linda Hamilton, Edward Furlong
Back to the Future|Michael J. Fox, Christopher Lloyd, Lea Thompson
Back to the Future Part II|Michael J. Fox, Christopher Lloyd, Lea Thompson
Back to the Future Part III|Michael J. Fox, Christopher Lloyd, Mary Steenburgen
Gladiator|Russell Crowe, Joaquin Phoenix, Connie Nielsen
The Pianist|Adrien Brody, Thomas Kretschmann, Frank Finlay
The Lion King|Matthew Broderick, James Earl Jones, Jeremy Irons
The Departed|Leonardo DiCaprio, Matt Damon, Jack Nicholson
Whiplash|Miles Teller, J.K. Simmons, Melissa Benoist
The Prestige|Christian Bale, Hugh Jackman, Scarlett Johansson
Spider-Man: Across the Spider-Verse|Shameik Moore, Hailee Steinfeld, Oscar Isaac
Spider-Man: Into the Spider-Verse|Shameik Moore, Jake Johnson, Hailee Steinfeld
The Intouchables|Francois Cluzet, Omar Sy, Anne Le Ny
Django Unchained|Jamie Foxx, Christoph Waltz, Leonardo DiCaprio
Alien|Sigourney Weaver, Tom Skerritt, John Hurt
Aliens|Sigourney Weaver, Michael Biehn, Carrie Henn
Alien 3|Sigourney Weaver, Charles S. Dutton, Charles Dance
Alien Resurrection|Sigourney Weaver, Winona Ryder, Ron Perlman
Prometheus|Noomi Rapace, Michael Fassbender, Charlize Theron
Alien: Covenant|Michael Fassbender, Katherine Waterston, Billy Crudup
Alien: Romulus|Cailee Spaeny, David Jonsson, Archie Renaux
WALL-E|Ben Burtt, Elissa Knight, Jeff Garlin
Memento|Guy Pearce, Carrie-Anne Moss, Joe Pantoliano
The Odyssey|Matt Damon, Tom Holland, Anne Hathaway
The Shining|Jack Nicholson, Shelley Duvall, Danny Lloyd
Inglourious Basterds|Brad Pitt, Christoph Waltz, Melanie Laurent
Good Will Hunting|Matt Damon, Robin Williams, Ben Affleck
Toy Story|Tom Hanks, Tim Allen, Don Rickles
Toy Story 2|Tom Hanks, Tim Allen, Joan Cusack
Toy Story 3|Tom Hanks, Tim Allen, Joan Cusack
Toy Story 4|Tom Hanks, Tim Allen, Annie Potts
Toy Story 5|Tom Hanks, Tim Allen, Annie Potts
The Dark Knight Rises|Christian Bale, Tom Hardy, Anne Hathaway
Joker|Joaquin Phoenix, Robert De Niro, Zazie Beetz
Reservoir Dogs|Harvey Keitel, Tim Roth, Michael Madsen
2001: A Space Odyssey|Keir Dullea, Gary Lockwood, William Sylvester
Up|Ed Asner, Jordan Nagai, Christopher Plummer
Full Metal Jacket|Matthew Modine, R. Lee Ermey, Vincent D'Onofrio
Die Hard|Bruce Willis, Alan Rickman, Bonnie Bedelia
Raiders of the Lost Ark|Harrison Ford, Karen Allen, Paul Freeman
Indiana Jones and the Temple of Doom|Harrison Ford, Kate Capshaw, Ke Huy Quan
Indiana Jones and the Last Crusade|Harrison Ford, Sean Connery, Denholm Elliott
Indiana Jones and the Kingdom of the Crystal Skull|Harrison Ford, Shia LaBeouf, Cate Blanchett
1917|George MacKay, Dean-Charles Chapman, Mark Strong
The Wolf of Wall Street|Leonardo DiCaprio, Jonah Hill, Margot Robbie
The Truman Show|Jim Carrey, Ed Harris, Laura Linney
Green Book|Viggo Mortensen, Mahershala Ali, Linda Cardellini
Jurassic Park|Sam Neill, Laura Dern, Jeff Goldblum
The Lost World: Jurassic Park|Jeff Goldblum, Julianne Moore, Pete Postlethwaite
Jurassic Park III|Sam Neill, William H. Macy, Tea Leoni
Jurassic World|Chris Pratt, Bryce Dallas Howard, Vincent D'Onofrio
Jurassic World: Fallen Kingdom|Chris Pratt, Bryce Dallas Howard, Rafe Spall
Jurassic World Dominion|Chris Pratt, Bryce Dallas Howard, Laura Dern
Batman Begins|Christian Bale, Michael Caine, Liam Neeson
Oppenheimer|Cillian Murphy, Robert Downey Jr., Emily Blunt
The Sixth Sense|Bruce Willis, Haley Joel Osment, Toni Collette
The Thing|Kurt Russell, Wilford Brimley, Keith David
No Country for Old Men|Josh Brolin, Javier Bardem, Tommy Lee Jones
Prisoners|Hugh Jackman, Jake Gyllenhaal, Viola Davis
A Beautiful Mind|Russell Crowe, Jennifer Connelly, Ed Harris
Project Hail Mary|Ryan Gosling, Sandra Huller, Ken Leung
Finding Nemo|Albert Brooks, Ellen DeGeneres, Alexander Gould
Catch Me If You Can|Leonardo DiCaprio, Tom Hanks, Christopher Walken
Inside Out|Amy Poehler, Phyllis Smith, Richard Kind
Inside Out 2|Amy Poehler, Maya Hawke, Kensington Tallman
Hacksaw Ridge|Andrew Garfield, Sam Worthington, Vince Vaughn
Mad Max: Fury Road|Tom Hardy, Charlize Theron, Nicholas Hoult
Furiosa: A Mad Max Saga|Anya Taylor-Joy, Chris Hemsworth, Tom Burke
Ratatouille|Patton Oswalt, Lou Romano, Ian Holm
How to Train Your Dragon|Jay Baruchel, Gerard Butler, America Ferrera
The Grand Budapest Hotel|Ralph Fiennes, Tony Revolori, Adrien Brody
Monsters, Inc.|John Goodman, Billy Crystal, Mary Gibbs
Ford v Ferrari|Matt Damon, Christian Bale, Jon Bernthal
Spider-Man|Tobey Maguire, Kirsten Dunst, Willem Dafoe
Spider-Man 2|Tobey Maguire, Kirsten Dunst, Alfred Molina
Spider-Man 3|Tobey Maguire, Kirsten Dunst, Topher Grace
The Amazing Spider-Man|Andrew Garfield, Emma Stone, Rhys Ifans
The Amazing Spider-Man 2|Andrew Garfield, Emma Stone, Jamie Foxx
Spider-Man: Homecoming|Tom Holland, Michael Keaton, Robert Downey Jr.
Spider-Man: Far From Home|Tom Holland, Jake Gyllenhaal, Zendaya
Spider-Man: No Way Home|Tom Holland, Zendaya, Benedict Cumberbatch
Spider-Man: Brand New Day|Tom Holland, Zendaya, Sadie Sink
Logan|Hugh Jackman, Patrick Stewart, Dafne Keen
Pirates of the Caribbean: The Curse of the Black Pearl|Johnny Depp, Orlando Bloom, Keira Knightley
The Big Lebowski|Jeff Bridges, John Goodman, Julianne Moore
The Incredibles|Craig T. Nelson, Holly Hunter, Samuel L. Jackson
Incredibles 2|Craig T. Nelson, Holly Hunter, Sarah Vowell
A Bug's Life|Dave Foley, Kevin Spacey, Julia Louis-Dreyfus
Cars|Owen Wilson, Paul Newman, Bonnie Hunt
Cars 2|Owen Wilson, Larry the Cable Guy, Michael Caine
Brave|Kelly Macdonald, Billy Connolly, Emma Thompson
Monsters University|Billy Crystal, John Goodman, Steve Buscemi
The Good Dinosaur|Raymond Ochoa, Jeffrey Wright, Frances McDormand
Finding Dory|Ellen DeGeneres, Albert Brooks, Ed O'Neill
Cars 3|Owen Wilson, Cristela Alonzo, Chris Cooper
Lightyear|Chris Evans, Keke Palmer, Peter Sohn
Robin Hood|Brian Bedford, Phil Harris, Peter Ustinov
The Little Mermaid|Jodi Benson, Samuel E. Wright, Pat Carroll
Beauty and the Beast|Paige O'Hara, Robby Benson, Richard White
Aladdin|Scott Weinger, Robin Williams, Linda Larkin
James and the Giant Peach|Paul Terry, Richard Dreyfuss, Susan Sarandon
Mulan|Ming-Na Wen, Eddie Murphy, BD Wong
Tarzan|Tony Goldwyn, Minnie Driver, Glenn Close
Dinosaur|D.B. Sweeney, Alfre Woodard, Ossie Davis
Treasure Planet|Joseph Gordon-Levitt, Brian Murray, Emma Thompson
The Jungle Book|Phil Harris, Sebastian Cabot, Bruce Reitherman
Chicken Little|Zach Braff, Joan Cusack, Garry Marshall
Bolt|John Travolta, Miley Cyrus, Susie Essman
Tangled|Mandy Moore, Zachary Levi, Donna Murphy
Frankenweenie|Charlie Tahan, Winona Ryder, Catherine O'Hara
Wreck-It Ralph|John C. Reilly, Sarah Silverman, Jack McBrayer
Planes|Dane Cook, Stacy Keach, Brad Garrett
Frozen|Kristen Bell, Idina Menzel, Jonathan Groff
Big Hero 6|Ryan Potter, Scott Adsit, Jamie Chung
Zootopia|Ginnifer Goodwin, Jason Bateman, Idris Elba
Zootopia 2|Ginnifer Goodwin, Jason Bateman, Ke Huy Quan
Moana|Auli'i Cravalho, Dwayne Johnson, Rachel House
Ralph Breaks the Internet|John C. Reilly, Sarah Silverman, Gal Gadot
Ice Age|Ray Romano, John Leguizamo, Denis Leary
Ice Age: The Meltdown|Ray Romano, John Leguizamo, Denis Leary
Ice Age: Dawn of the Dinosaurs|Ray Romano, John Leguizamo, Denis Leary
Ice Age: Continental Drift|Ray Romano, John Leguizamo, Denis Leary
Ice Age: Collision Course|Ray Romano, John Leguizamo, Denis Leary
Night at the Museum|Ben Stiller, Robin Williams, Owen Wilson
Night at the Museum: Battle of the Smithsonian|Ben Stiller, Amy Adams, Owen Wilson
X-Men|Patrick Stewart, Hugh Jackman, Ian McKellen
X2|Patrick Stewart, Hugh Jackman, Ian McKellen
Hulk|Eric Bana, Jennifer Connelly, Nick Nolte
Fantastic Four|Ioan Gruffudd, Jessica Alba, Chris Evans
X-Men: The Last Stand|Hugh Jackman, Halle Berry, Ian McKellen
Ghost Rider|Nicolas Cage, Eva Mendes, Wes Bentley
Fantastic Four: Rise of the Silver Surfer|Ioan Gruffudd, Jessica Alba, Chris Evans
Iron Man|Robert Downey Jr., Gwyneth Paltrow, Jeff Bridges
Iron Man 2|Robert Downey Jr., Gwyneth Paltrow, Mickey Rourke
Iron Man 3|Robert Downey Jr., Gwyneth Paltrow, Guy Pearce
The Incredible Hulk|Edward Norton, Liv Tyler, Tim Roth
X-Men Origins: Wolverine|Hugh Jackman, Liev Schreiber, Danny Huston
Thor|Chris Hemsworth, Natalie Portman, Tom Hiddleston
X-Men: First Class|James McAvoy, Michael Fassbender, Jennifer Lawrence
Captain America: The First Avenger|Chris Evans, Hayley Atwell, Sebastian Stan
The Avengers|Robert Downey Jr., Chris Evans, Scarlett Johansson
Avengers: Age of Ultron|Robert Downey Jr., Chris Evans, Mark Ruffalo
Avengers: Infinity War|Robert Downey Jr., Josh Brolin, Chris Hemsworth
Avengers: Endgame|Robert Downey Jr., Chris Evans, Scarlett Johansson
The Wolverine|Hugh Jackman, Tao Okamoto, Rila Fukushima
Thor: The Dark World|Chris Hemsworth, Natalie Portman, Tom Hiddleston
Captain America: The Winter Soldier|Chris Evans, Scarlett Johansson, Sebastian Stan
X-Men: Days of Future Past|Hugh Jackman, James McAvoy, Michael Fassbender
Guardians of the Galaxy|Chris Pratt, Zoe Saldana, Dave Bautista
Ant-Man|Paul Rudd, Evangeline Lilly, Michael Douglas
Fantastic Four (2015)|Miles Teller, Michael B. Jordan, Kate Mara
Deadpool|Ryan Reynolds, Morena Baccarin, T.J. Miller
Deadpool 2|Ryan Reynolds, Josh Brolin, Zazie Beetz
Deadpool & Wolverine|Ryan Reynolds, Hugh Jackman, Emma Corrin
Captain America: Civil War|Chris Evans, Robert Downey Jr., Sebastian Stan
X-Men: Apocalypse|James McAvoy, Michael Fassbender, Jennifer Lawrence
Doctor Strange|Benedict Cumberbatch, Chiwetel Ejiofor, Rachel McAdams
Guardians of the Galaxy Vol. 2|Chris Pratt, Zoe Saldana, Dave Bautista
Thor: Ragnarok|Chris Hemsworth, Tom Hiddleston, Cate Blanchett
Black Panther|Chadwick Boseman, Michael B. Jordan, Lupita Nyong'o
Ant-Man and the Wasp|Paul Rudd, Evangeline Lilly, Michael Douglas
Venom|Tom Hardy, Michelle Williams, Riz Ahmed
Captain Marvel|Brie Larson, Samuel L. Jackson, Jude Law
Dark Phoenix|Sophie Turner, James McAvoy, Michael Fassbender
Venom: Let There Be Carnage|Tom Hardy, Woody Harrelson, Michelle Williams
Black Widow|Scarlett Johansson, Florence Pugh, David Harbour
Eternals|Gemma Chan, Richard Madden, Angelina Jolie
Morbius|Jared Leto, Matt Smith, Adria Arjona
Shang-Chi and the Legend of the Ten Rings|Simu Liu, Awkwafina, Tony Leung
Doctor Strange in the Multiverse of Madness|Benedict Cumberbatch, Elizabeth Olsen, Xochitl Gomez
Thor: Love and Thunder|Chris Hemsworth, Natalie Portman, Christian Bale
Black Panther: Wakanda Forever|Letitia Wright, Lupita Nyong'o, Angela Bassett
Guardians of the Galaxy Vol. 3|Chris Pratt, Zoe Saldana, Dave Bautista
The Fantastic Four: First Steps|Pedro Pascal, Vanessa Kirby, Joseph Quinn
Ant-Man and the Wasp: Quantumania|Paul Rudd, Evangeline Lilly, Jonathan Majors
Over the Hedge|Bruce Willis, Garry Shandling, Steve Carell
The BFG|Mark Rylance, Ruby Barnhill, Penelope Wilton
Transformers|Shia LaBeouf, Megan Fox, Josh Duhamel
Transformers: Revenge of the Fallen|Shia LaBeouf, Megan Fox, Josh Duhamel
Transformers: Dark of the Moon|Shia LaBeouf, Rosie Huntington-Whiteley, Josh Duhamel
Transformers: Age of Extinction|Mark Wahlberg, Nicola Peltz, Jack Reynor
Transformers: The Last Knight|Mark Wahlberg, Anthony Hopkins, Laura Haddock
I Am Legend|Will Smith, Alice Braga, Charlie Tahan
Now You See Me|Jesse Eisenberg, Mark Ruffalo, Woody Harrelson
Borat|Sacha Baron Cohen, Ken Davitian, Luenell
Borat Subsequent Moviefilm|Sacha Baron Cohen, Maria Bakalova, Tom Hanks
Dallas Buyers Club|Matthew McConaughey, Jared Leto, Jennifer Garner
Grown Ups|Adam Sandler, Kevin James, Chris Rock
Grown Ups 2|Adam Sandler, Kevin James, Chris Rock
Shark Tale|Will Smith, Robert De Niro, Renee Zellweger
Kung Fu Panda|Jack Black, Dustin Hoffman, Angelina Jolie
Kung Fu Panda 2|Jack Black, Angelina Jolie, Gary Oldman
Kung Fu Panda 3|Jack Black, Bryan Cranston, Dustin Hoffman
Kung Fu Panda 4|Jack Black, Awkwafina, Viola Davis
Shrek|Mike Myers, Eddie Murphy, Cameron Diaz
Shrek 2|Mike Myers, Eddie Murphy, Cameron Diaz
Shrek the Third|Mike Myers, Eddie Murphy, Cameron Diaz
Shrek Forever After|Mike Myers, Eddie Murphy, Cameron Diaz
Kingsman: The Secret Service|Taron Egerton, Colin Firth, Samuel L. Jackson
Kingsman: The Golden Circle|Taron Egerton, Colin Firth, Julianne Moore
Deepwater Horizon|Mark Wahlberg, Kurt Russell, John Malkovich
Tron: Legacy|Garrett Hedlund, Jeff Bridges, Olivia Wilde
Tron: Ares|Jared Leto, Greta Lee, Evan Peters
Pacific Rim|Charlie Hunnam, Idris Elba, Rinko Kikuchi
The Hateful Eight|Samuel L. Jackson, Kurt Russell, Jennifer Jason Leigh
Once Upon a Time in Hollywood|Leonardo DiCaprio, Brad Pitt, Margot Robbie
Maleficent|Angelina Jolie, Elle Fanning, Sharlto Copley
Superbad|Jonah Hill, Michael Cera, Christopher Mintz-Plasse
Pineapple Express|Seth Rogen, James Franco, Danny McBride
This Is the End|James Franco, Jonah Hill, Seth Rogen
The Interview|Seth Rogen, James Franco, Randall Park
Cloverfield|Lizzy Caplan, Jessica Lucas, T.J. Miller
10 Cloverfield Lane|Mary Elizabeth Winstead, John Goodman, John Gallagher Jr.
Teenage Mutant Ninja Turtles|Megan Fox, Will Arnett, William Fichtner
Sausage Party|Seth Rogen, Kristen Wiig, Jonah Hill
Harold & Kumar Go to White Castle|John Cho, Kal Penn, Neil Patrick Harris
Harold & Kumar Escape from Guantanamo Bay|John Cho, Kal Penn, Neil Patrick Harris
American Pie|Jason Biggs, Chris Klein, Alyson Hannigan
American Pie 2|Jason Biggs, Seann William Scott, Alyson Hannigan
American Wedding|Jason Biggs, Seann William Scott, Alyson Hannigan
American Reunion|Jason Biggs, Seann William Scott, Alyson Hannigan
Bad Neighbours|Seth Rogen, Zac Efron, Rose Byrne
Bad Neighbours 2|Seth Rogen, Zac Efron, Rose Byrne
The Green Hornet|Seth Rogen, Jay Chou, Christoph Waltz
The 40-Year-Old Virgin|Steve Carell, Catherine Keener, Paul Rudd
Oblivion|Tom Cruise, Morgan Freeman, Olga Kurylenko
The Hitman's Wife's Bodyguard|Ryan Reynolds, Samuel L. Jackson, Salma Hayek
Going in Style|Morgan Freeman, Michael Caine, Alan Arkin
Now You See Me 2|Jesse Eisenberg, Mark Ruffalo, Woody Harrelson
Ted|Mark Wahlberg, Mila Kunis, Seth MacFarlane
Ted 2|Mark Wahlberg, Amanda Seyfried, Seth MacFarlane
Lucy|Scarlett Johansson, Morgan Freeman, Choi Min-sik
Transcendence|Johnny Depp, Rebecca Hall, Paul Bettany
The Lego Movie|Chris Pratt, Will Ferrell, Elizabeth Banks
Olympus Has Fallen|Gerard Butler, Aaron Eckhart, Morgan Freeman
The Bucket List|Jack Nicholson, Morgan Freeman, Sean Hayes
War of the Worlds|Tom Cruise, Dakota Fanning, Tim Robbins
Ender's Game|Asa Butterfield, Harrison Ford, Hailee Steinfeld
Real Steel|Hugh Jackman, Dakota Goyo, Evangeline Lilly
Rise of the Planet of the Apes|Andy Serkis, James Franco, Freida Pinto
Dawn of the Planet of the Apes|Andy Serkis, Jason Clarke, Gary Oldman
War for the Planet of the Apes|Andy Serkis, Woody Harrelson, Steve Zahn
Kingdom of the Planet of the Apes|Owen Teague, Freya Allan, Kevin Durand
Predator|Arnold Schwarzenegger, Carl Weathers, Jesse Ventura
Edge of Tomorrow|Tom Cruise, Emily Blunt, Bill Paxton
District 9|Sharlto Copley, Jason Cope, David James
Elysium|Matt Damon, Jodie Foster, Sharlto Copley
E.T. the Extra-Terrestrial|Henry Thomas, Drew Barrymore, Dee Wallace
Ex Machina|Domhnall Gleeson, Alicia Vikander, Oscar Isaac
The Martian|Matt Damon, Jessica Chastain, Jeff Daniels
Avatar|Sam Worthington, Zoe Saldana, Sigourney Weaver
Avatar: The Way of Water|Sam Worthington, Zoe Saldana, Sigourney Weaver
Close Encounters of the Third Kind|Richard Dreyfuss, Francois Truffaut, Teri Garr
Star Trek|Chris Pine, Zachary Quinto, Zoe Saldana
RoboCop|Peter Weller, Nancy Allen, Ronny Cox
Total Recall|Arnold Schwarzenegger, Rachel Ticotin, Sharon Stone
Sunshine|Cillian Murphy, Chris Evans, Rose Byrne
The Fly|Jeff Goldblum, Geena Davis, John Getz
Dredd|Karl Urban, Olivia Thirlby, Lena Headey
Godzilla|Aaron Taylor-Johnson, Bryan Cranston, Elizabeth Olsen
Independence Day|Will Smith, Bill Pullman, Jeff Goldblum
John Carter|Taylor Kitsch, Lynn Collins, Samantha Morton
Waterworld|Kevin Costner, Dennis Hopper, Jeanne Tripplehorn
The Day After Tomorrow|Dennis Quaid, Jake Gyllenhaal, Emmy Rossum
Zathura: A Space Adventure|Josh Hutcherson, Jonah Bobo, Dax Shepard
The Mummy Returns|Brendan Fraser, Rachel Weisz, John Hannah
Race to Witch Mountain|Dwayne Johnson, AnnaSophia Robb, Carla Gugino
Tooth Fairy|Dwayne Johnson, Ashley Judd, Julie Andrews
The Fast and the Furious|Vin Diesel, Paul Walker, Michelle Rodriguez
2 Fast 2 Furious|Paul Walker, Tyrese Gibson, Eva Mendes
The Fast and the Furious: Tokyo Drift|Lucas Black, Bow Wow, Sung Kang
Fast & Furious|Vin Diesel, Paul Walker, Michelle Rodriguez
Fast Five|Vin Diesel, Paul Walker, Dwayne Johnson
Fast & Furious 6|Vin Diesel, Paul Walker, Dwayne Johnson
Furious 7|Vin Diesel, Paul Walker, Jason Statham
The Fate of the Furious|Vin Diesel, Dwayne Johnson, Charlize Theron
F9|Vin Diesel, Michelle Rodriguez, John Cena
Journey 2: The Mysterious Island|Dwayne Johnson, Josh Hutcherson, Michael Caine
Journey to the Center of the Earth|Brendan Fraser, Josh Hutcherson, Anita Briem
Pain & Gain|Mark Wahlberg, Dwayne Johnson, Anthony Mackie
San Andreas|Dwayne Johnson, Carla Gugino, Alexandra Daddario
Central Intelligence|Dwayne Johnson, Kevin Hart, Amy Ryan
Jumanji: Welcome to the Jungle|Dwayne Johnson, Kevin Hart, Jack Black
Jumanji: The Next Level|Dwayne Johnson, Kevin Hart, Jack Black
Baywatch|Dwayne Johnson, Zac Efron, Alexandra Daddario
Rampage|Dwayne Johnson, Naomie Harris, Malin Akerman
Skyscraper|Dwayne Johnson, Neve Campbell, Chin Han
Fast & Furious Presents: Hobbs & Shaw|Dwayne Johnson, Jason Statham, Idris Elba
Red Notice|Dwayne Johnson, Ryan Reynolds, Gal Gadot
Black Adam|Dwayne Johnson, Aldis Hodge, Pierce Brosnan
The Secret Life of Pets|Louis C.K., Eric Stonestreet, Kevin Hart
Get Hard|Will Ferrell, Kevin Hart, Alison Brie
Ride Along|Ice Cube, Kevin Hart, John Leguizamo
Little Fockers|Robert De Niro, Ben Stiller, Owen Wilson
Failure to Launch|Matthew McConaughey, Sarah Jessica Parker, Zooey Deschanel
Tropic Thunder|Ben Stiller, Robert Downey Jr., Jack Black
Titanic|Leonardo DiCaprio, Kate Winslet, Billy Zane
Everest|Jason Clarke, Jason Sudeikis, Josh Brolin
Groundhog Day|Bill Murray, Andie MacDowell, Chris Elliott
The Social Network|Jesse Eisenberg, Andrew Garfield, Justin Timberlake
Rain Man|Dustin Hoffman, Tom Cruise, Valeria Golino
Cast Away|Tom Hanks, Helen Hunt, Nick Searcy
Zodiac|Jake Gyllenhaal, Mark Ruffalo, Robert Downey Jr.
127 Hours|James Franco, Kate Mara, Amber Tamblyn
The Pursuit of Happyness|Will Smith, Jaden Smith, Thandiwe Newton
The Terminal|Tom Hanks, Catherine Zeta-Jones, Stanley Tucci
Tomorrowland|George Clooney, Britt Robertson, Hugh Laurie
Moneyball|Brad Pitt, Jonah Hill, Philip Seymour Hoffman
Knives Out|Daniel Craig, Ana de Armas, Chris Evans
Glass Onion: A Knives Out Mystery|Daniel Craig, Edward Norton, Janelle Monae
Wake Up Dead Man: A Knives Out Mystery|Daniel Craig, Josh O'Connor, Glenn Close
Fury|Brad Pitt, Logan Lerman, Shia LaBeouf
Captain Phillips|Tom Hanks, Barkhad Abdi, Catherine Keener
Life|Jake Gyllenhaal, Rebecca Ferguson, Ryan Reynolds
Brokeback Mountain|Heath Ledger, Jake Gyllenhaal, Michelle Williams
Nightcrawler|Jake Gyllenhaal, Rene Russo, Riz Ahmed
The Guilty|Jake Gyllenhaal, Riley Keough, Peter Sarsgaard
Guy Ritchie's The Covenant|Jake Gyllenhaal, Dar Salim, Antony Starr
Bubble Boy|Jake Gyllenhaal, Swoosie Kurtz, Marley Shelton
Beautiful Boy|Steve Carell, Timothee Chalamet, Maura Tierney
Crazy, Stupid, Love|Steve Carell, Ryan Gosling, Julianne Moore
The Big Short|Christian Bale, Steve Carell, Ryan Gosling
Despicable Me|Steve Carell, Jason Segel, Russell Brand
Despicable Me 2|Steve Carell, Kristen Wiig, Benjamin Bratt
Despicable Me 3|Steve Carell, Kristen Wiig, Trey Parker
Despicable Me 4|Steve Carell, Kristen Wiig, Will Ferrell
Anchorman: The Legend of Ron Burgundy|Will Ferrell, Christina Applegate, Paul Rudd
Anchorman 2: The Legend Continues|Will Ferrell, Christina Applegate, Steve Carell
Minions|Sandra Bullock, Jon Hamm, Michael Keaton
Vice|Christian Bale, Amy Adams, Steve Carell
Horton Hears a Who!|Jim Carrey, Steve Carell, Carol Burnett
Jackass: The Movie|Johnny Knoxville, Bam Margera, Steve-O
Jackass Number Two|Johnny Knoxville, Bam Margera, Steve-O
Jackass 3D|Johnny Knoxville, Bam Margera, Steve-O
Jackass Forever|Johnny Knoxville, Steve-O, Chris Pontius
Jackass 4.5|Johnny Knoxville, Steve-O, Chris Pontius
The Lorax|Danny DeVito, Ed Helms, Zac Efron
Need for Speed|Aaron Paul, Dominic Cooper, Imogen Poots
Ad Astra|Brad Pitt, Tommy Lee Jones, Ruth Negga
The Maze Runner|Dylan O'Brien, Kaya Scodelario, Thomas Brodie-Sangster
Maze Runner: The Scorch Trials|Dylan O'Brien, Kaya Scodelario, Thomas Brodie-Sangster
Maze Runner: The Death Cure|Dylan O'Brien, Kaya Scodelario, Thomas Brodie-Sangster
The Hunger Games|Jennifer Lawrence, Josh Hutcherson, Liam Hemsworth
The Hunger Games: Catching Fire|Jennifer Lawrence, Josh Hutcherson, Liam Hemsworth
The Hunger Games: Mockingjay - Part 1|Jennifer Lawrence, Josh Hutcherson, Liam Hemsworth
The Hunger Games: Mockingjay - Part 2|Jennifer Lawrence, Josh Hutcherson, Liam Hemsworth
Divergent|Shailene Woodley, Theo James, Kate Winslet
Insurgent|Shailene Woodley, Theo James, Octavia Spencer
The Hobbit: An Unexpected Journey|Martin Freeman, Ian McKellen, Richard Armitage
The Hobbit: The Desolation of Smaug|Martin Freeman, Ian McKellen, Benedict Cumberbatch
The Hobbit: The Battle of the Five Armies|Martin Freeman, Ian McKellen, Richard Armitage
Annihilation|Natalie Portman, Jennifer Jason Leigh, Oscar Isaac
9|Elijah Wood, John C. Reilly, Jennifer Connelly
Gravity|Sandra Bullock, George Clooney, Ed Harris
Slumdog Millionaire|Dev Patel, Freida Pinto, Anil Kapoor
The Equalizer|Denzel Washington, Marton Csokas, Chloe Grace Moretz
The Equalizer 2|Denzel Washington, Pedro Pascal, Ashton Sanders
John Wick|Keanu Reeves, Michael Nyqvist, Alfie Allen
John Wick: Chapter 2|Keanu Reeves, Riccardo Scamarcio, Ian McShane
The Revenant|Leonardo DiCaprio, Tom Hardy, Domhnall Gleeson
Straight Outta Compton|O'Shea Jackson Jr., Corey Hawkins, Jason Mitchell
American Sniper|Bradley Cooper, Sienna Miller, Kyle Gallner
The Great Gatsby|Leonardo DiCaprio, Tobey Maguire, Carey Mulligan
Life of Pi|Suraj Sharma, Irrfan Khan, Rafe Spall
Civil War|Kirsten Dunst, Wagner Moura, Cailee Spaeny
Mickey 17|Robert Pattinson, Naomi Ackie, Steven Yeun
A Quiet Place|Emily Blunt, John Krasinski, Millicent Simmonds
A Quiet Place Part II|Emily Blunt, Cillian Murphy, Millicent Simmonds
A Quiet Place: Day One|Lupita Nyong'o, Joseph Quinn, Alex Wolff
Rocky|Sylvester Stallone, Talia Shire, Burt Young
Rocky II|Sylvester Stallone, Talia Shire, Carl Weathers
Rocky III|Sylvester Stallone, Mr. T, Carl Weathers
Logan Lucky|Channing Tatum, Adam Driver, Daniel Craig
Paul|Simon Pegg, Nick Frost, Seth Rogen
Tenet|John David Washington, Robert Pattinson, Elizabeth Debicki
Uncut Gems|Adam Sandler, Julia Fox, Idina Menzel
Bullet Train|Brad Pitt, Joey King, Aaron Taylor-Johnson
The Notebook|Ryan Gosling, Rachel McAdams, James Garner
Aquaman|Jason Momoa, Amber Heard, Patrick Wilson
Aquaman and the Lost Kingdom|Jason Momoa, Patrick Wilson, Yahya Abdul-Mateen II
Man of Steel|Henry Cavill, Amy Adams, Michael Shannon
Wonder Woman|Gal Gadot, Chris Pine, Robin Wright
Wonder Woman 1984|Gal Gadot, Chris Pine, Kristen Wiig
World War Z|Brad Pitt, Mireille Enos, Daniella Kertesz
Limitless|Bradley Cooper, Robert De Niro, Abbie Cornish
Notting Hill|Julia Roberts, Hugh Grant, Rhys Ifans
50 First Dates|Adam Sandler, Drew Barrymore, Rob Schneider
Wedding Crashers|Owen Wilson, Vince Vaughn, Rachel McAdams
About Time|Domhnall Gleeson, Rachel McAdams, Bill Nighy
The Invention of Lying|Ricky Gervais, Jennifer Garner, Rob Lowe
Midsommar|Florence Pugh, Jack Reynor, William Jackson Harper
Dracula Untold|Luke Evans, Sarah Gadon, Dominic Cooper
Frankenstein (2025)|Oscar Isaac, Jacob Elordi, Mia Goth
Bird Box|Sandra Bullock, Trevante Rhodes, John Malkovich
Us|Lupita Nyong'o, Winston Duke, Elisabeth Moss
Skyfall|Daniel Craig, Javier Bardem, Judi Dench
Spectre|Daniel Craig, Christoph Waltz, Lea Seydoux
No Time to Die|Daniel Craig, Rami Malek, Lea Seydoux
Zombieland|Jesse Eisenberg, Woody Harrelson, Emma Stone
The Conjuring|Patrick Wilson, Vera Farmiga, Lili Taylor
The Pyramid|Ashley Hinshaw, Denis O'Hare, James Buckley
The Blair Witch Project|Heather Donahue, Joshua Leonard, Michael C. Williams
Project X|Thomas Mann, Oliver Cooper, Jonathan Daniel Brown
It|Bill Skarsgard, Jaeden Martell, Finn Wolfhard
It Chapter Two|Bill Skarsgard, James McAvoy, Jessica Chastain
The Platform|Ivan Massague, Zorion Eguileor, Antonia San Juan
The Conjuring 2|Patrick Wilson, Vera Farmiga, Madison Wolfe
F1|Brad Pitt, Damson Idris, Kerry Condon
Ocean's Thirteen|George Clooney, Brad Pitt, Matt Damon
Ocean's Eleven|George Clooney, Brad Pitt, Matt Damon
Ocean's Twelve|George Clooney, Brad Pitt, Matt Damon
Meet Joe Black|Brad Pitt, Anthony Hopkins, Claire Forlani
The Da Vinci Code|Tom Hanks, Audrey Tautou, Ian McKellen
Mission: Impossible 2|Tom Cruise, Dougray Scott, Thandiwe Newton
Mission: Impossible III|Tom Cruise, Philip Seymour Hoffman, Michelle Monaghan
Mission: Impossible - Ghost Protocol|Tom Cruise, Jeremy Renner, Simon Pegg
Mission: Impossible - Rogue Nation|Tom Cruise, Rebecca Ferguson, Simon Pegg
Mission: Impossible - Fallout|Tom Cruise, Henry Cavill, Rebecca Ferguson
Mission: Impossible - Dead Reckoning Part One|Tom Cruise, Hayley Atwell, Ving Rhames
Mission: Impossible - The Final Reckoning|Tom Cruise, Hayley Atwell, Ving Rhames
Harry Potter and the Philosopher's Stone|Daniel Radcliffe, Rupert Grint, Emma Watson
Harry Potter and the Chamber of Secrets|Daniel Radcliffe, Rupert Grint, Emma Watson
Harry Potter and the Prisoner of Azkaban|Daniel Radcliffe, Rupert Grint, Emma Watson
Harry Potter and the Goblet of Fire|Daniel Radcliffe, Rupert Grint, Emma Watson
Harry Potter and the Order of the Phoenix|Daniel Radcliffe, Rupert Grint, Emma Watson
Harry Potter and the Half-Blood Prince|Daniel Radcliffe, Rupert Grint, Emma Watson
Harry Potter and the Deathly Hallows - Part 1|Daniel Radcliffe, Rupert Grint, Emma Watson
Harry Potter and the Deathly Hallows - Part 2|Daniel Radcliffe, Rupert Grint, Emma Watson
King Kong|Naomi Watts, Jack Black, Adrien Brody
Mortal Engines|Hera Hilmar, Robert Sheehan, Hugo Weaving
Bee Movie|Jerry Seinfeld, Renee Zellweger, Matthew Broderick
Cool Runnings|John Candy, Leon Robinson, Doug E. Doug
American Made|Tom Cruise, Domhnall Gleeson, Sarah Wright
Fantastic Mr. Fox|George Clooney, Meryl Streep, Jason Schwartzman
The Spiderwick Chronicles|Freddie Highmore, Sarah Bolger, Mary-Louise Parker
The Ant Bully|Zach Tyler Eisen, Julia Roberts, Nicolas Cage
Arthur and the Invisibles|Freddie Highmore, Mia Farrow, Madonna
Epic|Amanda Seyfried, Josh Hutcherson, Colin Farrell
The Blind Side|Sandra Bullock, Quinton Aaron, Tim McGraw
Megamind|Will Ferrell, Tina Fey, Brad Pitt
Rango|Johnny Depp, Isla Fisher, Abigail Breslin
Jason Bourne|Matt Damon, Tommy Lee Jones, Alicia Vikander
Herbie Fully Loaded|Lindsay Lohan, Michael Keaton, Matt Dillon
Space Chimps|Andy Samberg, Cheryl Hines, Jeff Daniels
Surf's Up|Shia LaBeouf, Jeff Bridges, Zooey Deschanel
Flushed Away|Hugh Jackman, Kate Winslet, Ian McKellen
Hellboy|Ron Perlman, Selma Blair, John Hurt
Hellboy II: The Golden Army|Ron Perlman, Selma Blair, Doug Jones
Alice in Wonderland|Mia Wasikowska, Johnny Depp, Helena Bonham Carter
Percy Jackson & the Olympians: The Lightning Thief|Logan Lerman, Brandon T. Jackson, Alexandra Daddario
Percy Jackson: Sea of Monsters|Logan Lerman, Alexandra Daddario, Douglas Smith
Clash of the Titans|Sam Worthington, Liam Neeson, Ralph Fiennes
Gods of Egypt|Nikolaj Coster-Waldau, Brenton Thwaites, Gerard Butler
I, Robot|Will Smith, Bridget Moynahan, Alan Tudyk
Alita: Battle Angel|Rosa Salazar, Christoph Waltz, Keean Johnson
Men in Black|Will Smith, Tommy Lee Jones, Linda Fiorentino
Men in Black II|Will Smith, Tommy Lee Jones, Rip Torn
Men in Black 3|Will Smith, Tommy Lee Jones, Josh Brolin
Men in Black: International|Chris Hemsworth, Tessa Thompson, Liam Neeson
Valerian and the City of a Thousand Planets|Dane DeHaan, Cara Delevingne, Clive Owen
Jupiter Ascending|Mila Kunis, Channing Tatum, Eddie Redmayne
The Lost City of Z|Charlie Hunnam, Robert Pattinson, Sienna Miller
The Hurt Locker|Jeremy Renner, Anthony Mackie, Brian Geraghty
Dunkirk|Fionn Whitehead, Tom Hardy, Mark Rylance
Charlotte's Web|Dakota Fanning, Julia Roberts, Steve Buscemi
Monster House|Mitchel Musso, Sam Lerner, Spencer Locke
Happy Feet|Elijah Wood, Robin Williams, Brittany Murphy
Ready Player One|Tye Sheridan, Olivia Cooke, Ben Mendelsohn
Predator: Badlands|Elle Fanning, Dimitrius Schuster-Koloamatangi, Rohinal Narayan
The Peanut Butter Falcon|Shia LaBeouf, Zack Gottsagen, Dakota Johnson
Paddington|Ben Whishaw, Hugh Bonneville, Sally Hawkins
Garfield: The Movie|Breckin Meyer, Jennifer Love Hewitt, Bill Murray
Garfield: A Tail of Two Kitties|Breckin Meyer, Jennifer Love Hewitt, Bill Murray
Apollo 13|Tom Hanks, Kevin Bacon, Bill Paxton
Robots|Ewan McGregor, Robin Williams, Halle Berry
Wallace & Gromit: The Curse of the Were-Rabbit|Peter Sallis, Ralph Fiennes, Helena Bonham Carter
Chicken Run|Julia Sawalha, Mel Gibson, Miranda Richardson
Chicken Run: Dawn of the Nugget|Thandiwe Newton, Zachary Levi, Bella Ramsey
Brother Bear|Joaquin Phoenix, Jeremy Suarez, Rick Moranis
The Polar Express|Tom Hanks, Daryl Sabara, Nona Gaye
Madagascar|Ben Stiller, Chris Rock, David Schwimmer
Madagascar: Escape 2 Africa|Ben Stiller, Chris Rock, David Schwimmer
Madagascar 3: Europe's Most Wanted|Ben Stiller, Chris Rock, David Schwimmer
Free Birds|Owen Wilson, Woody Harrelson, Amy Poehler
Open Season|Martin Lawrence, Ashton Kutcher, Gary Sinise
Open Season 2|Joel McHale, Mike Epps, Jane Krakowski
Open Season 3|Matthew W. Taylor, Melissa Sturm, Karley Scott Collins
The Housemaid|Sydney Sweeney, Amanda Seyfried, Brandon Sklenar
Diary of a Wimpy Kid|Zachary Gordon, Robert Capron, Rachael Harris
`;

/* title -> [actors], keyed the same way movies.js builds its ids */
const CAST = (() => {
  const bySlug = {};
  CAST_SOURCE.split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
    const i = line.indexOf('|');
    if (i === -1) return;
    const title = line.slice(0, i).trim();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const names = line.slice(i + 1).split(',').map(s => s.trim()).filter(Boolean);
    if (names.length) bySlug[slug] = names;
  });
  return bySlug;
})();

window.CAST = CAST;
