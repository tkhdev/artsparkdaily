// Firebase Functions - functions/index.js
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Hybrid challenge system - curated templates + dynamic generation
const curatedChallenges = [
  // Original templates
  {
    title: "Quantum Entanglement",
    task: "Visualize particles that remain connected across vast distances",
    special: false
  },
  {
    title: "Solar Panel Flowers",
    task: "Create energy collection devices that mimic natural plant forms",
    special: false
  },
  {
    title: "Emotion Engine",
    task: "Create a machine that runs on human feelings and emotions",
    special: false
  },
  {
    title: "Backwards Day",
    task: "Show a world where everything happens in reverse order",
    special: false
  },
  {
    title: "Steampunk Adventure",
    task: "Create a Victorian-era scene powered by steam technology",
    special: false
  },
  {
    title: "Genetic Artist",
    task: "Create art using DNA manipulation and biological forms",
    special: false
  },
  {
    title: "Automated Artisan",
    task: "Show traditional crafts being performed by intelligent machines",
    special: false
  },
  {
    title: "Mushroom Megacity",
    task: "Design a civilization built entirely within and around giant fungi",
    special: false
  },
  {
    title: "Probability Pool",
    task: "Design a billiards game where outcomes are never certain",
    special: false
  },
  {
    title: "Tidal Energy Ballet",
    task: "Show the graceful dance of machines harvesting wave power",
    special: false
  },
  {
    title: "Memory Theater",
    task: "Show a physical space designed for storing and accessing knowledge",
    special: false
  },
  {
    title: "Vertical Neighborhood",
    task: "Design a community that exists in a single tall structure",
    special: false
  },
  {
    title: "Time Dilation Field",
    task: "Visualize areas where time moves at different speeds",
    special: false
  },
  {
    title: "Seasonal Shapeshifters",
    task: "Design creatures that completely change form with the seasons",
    special: false
  },
  {
    title: "Holographic Haute Couture",
    task: "Create fashion from projected light and energy fields",
    special: false
  },
  {
    title: "Crystal Caverns",
    task: "Illuminate the mysterious beauty of underground crystal formations",
    special: false
  },
  {
    title: "Nano-Scale Surgery",
    task: "Show medical procedures performed by microscopic robots",
    special: false
  },
  {
    title: "Coral Computers",
    task: "Show information processing systems grown from living coral",
    special: false
  },
  {
    title: "Metamorphosis Station",
    task: "Design a place where beings can completely change their form",
    special: false
  },
  {
    title: "Samurai Cyberpunk",
    task: "Blend traditional Japanese warriors with futuristic technology",
    special: false
  },
  {
    title: "Floating Villages",
    task: "Design communities that drift on ocean currents",
    special: false
  },
  {
    title: "Emotional Weather",
    task: "Show how feelings might manifest as atmospheric conditions",
    special: false
  },
  {
    title: "Rhythm of the City",
    task: "Visualize urban sounds as a coordinated musical composition",
    special: false
  },
  {
    title: "Career Time Machine",
    task: "Show someone exploring different professional paths simultaneously",
    special: false
  },
  {
    title: "Bacterial Dye Works",
    task: "Illustrate fabric coloring using living microorganisms",
    special: false
  },
  {
    title: "Gravity Storm",
    task: "Illustrate a phenomenon where gravity behaves unpredictably",
    special: false
  },
  {
    title: "Underground Sun",
    task: "Create a subterranean world lit by an artificial sun",
    special: false
  },
  {
    title: "Portal Network",
    task: "Create a transportation system using interdimensional gateways",
    special: false
  },
  {
    title: "Molecular Olympics",
    task: "Show sporting events at the microscopic level",
    special: false
  },
  {
    title: "Spell Library",
    task: "Create a magical library where books contain living spells",
    special: false
  },
  {
    title: "Edible Architecture",
    task: "Design buildings made entirely from food materials",
    special: false
  },
  {
    title: "Collective Consciousness",
    task: "Show individuals connected as parts of a larger mind",
    special: false
  },
  {
    title: "Digital Town Square",
    task: "Create virtual spaces that foster real community connections",
    special: false
  },
  {
    title: "Kinetic Art Gallery",
    task: "Design exhibitions where movement generates the power to view art",
    special: false
  },
  {
    title: "Tornado Tamer",
    task: "Show someone who can control and shape storm systems",
    special: false
  },
  {
    title: "Clockwork Symphony",
    task: "Design a musical performance powered entirely by mechanical instruments",
    special: false
  },
  {
    title: "Frozen Lightning",
    task: "Capture the moment when lightning becomes solid and permanent",
    special: false
  },
  {
    title: "Language Archaeology",
    task: "Show the excavation and restoration of lost languages",
    special: false
  },
  {
    title: "Upside Down Rain",
    task: "Depict a world where rain falls upward from the ground to the sky",
    special: false
  },
  {
    title: "Sixth Sense",
    task: "Visualize abilities beyond the traditional five senses",
    special: false
  },
  {
    title: "Ice Archipelago",
    task: "Design a chain of floating ice islands supporting life",
    special: false
  },
  {
    title: "Solar Surfer",
    task: "Design vehicles that ride on solar winds through space",
    special: false
  },
  {
    title: "Whale Song Archive",
    task: "Create a library preserving cetacean communications",
    special: false
  },
  {
    title: "Intergenerational Playground",
    task: "Design recreation spaces for all ages to enjoy together",
    special: false
  },
  {
    title: "Modular Housing",
    task: "Create homes that can be reconfigured like building blocks",
    special: false
  },
  {
    title: "Stained Glass Forest",
    task: "Create a woodland where trees are made of colored glass",
    special: false
  },
  {
    title: "Underwater Desert",
    task: "Show an arid landscape existing beneath the ocean surface",
    special: false
  },
  {
    title: "Prism City",
    task: "Show an urban environment built entirely from light-refracting materials",
    special: false
  },
  {
    title: "Accent Visualization",
    task: "Show how different speech patterns might appear visually",
    special: false
  },
  {
    title: "Seasonal Collision",
    task: "Show all four seasons existing simultaneously in one location",
    special: false
  },
  {
    title: "Bio-Electric Forest",
    task: "Create woodlands that generate power from living trees",
    special: false
  },
  {
    title: "Probability Garden",
    task: "Create a space where different potential outcomes grow like plants",
    special: false
  },
  {
    title: "Digital Glitch",
    task: "Explore the beauty in technological malfunction and digital corruption",
    special: false
  },
  {
    title: "Holographic History",
    task: "Show historical events preserved as interactive holograms",
    special: false
  },
  {
    title: "Self-Painting Portrait",
    task: "Show artwork that creates itself without human intervention",
    special: false
  },
  {
    title: "Enchanted Forest",
    task: "Illustrate a magical woodland filled with mystical creatures",
    special: false
  },
  {
    title: "Temporal Marketplace",
    task: "Show a bazaar where time itself is bought and sold",
    special: false
  },
  {
    title: "Emotional Palette",
    task: "Show an artist's color choices changing with their feelings",
    special: false
  },
  {
    title: "Smart Home Ecosystem",
    task: "Show a residence where every object is connected and intelligent",
    special: false
  },
  {
    title: "Wind-Powered Metropolis",
    task: "Design a city that moves and reconfigures with wind patterns",
    special: false
  },
  {
    title: "Underwater Metropolis",
    task: "Design an advanced civilization thriving beneath the ocean",
    special: false
  },
  {
    title: "Origami Vehicles",
    task: "Create transportation that folds and unfolds for different uses",
    special: false
  },
  {
    title: "Skill-Sharing Network",
    task: "Show people temporarily exchanging abilities for different jobs",
    special: false
  },
  {
    title: "Candlelit Cosmos",
    task: "Imagine the universe illuminated by countless candle flames",
    special: false
  },
  {
    title: "Reverse Aging",
    task: "Show a world where people grow younger instead of older",
    special: false
  },
  {
    title: "Cellular Renewal Spa",
    task: "Create a wellness center that operates at the molecular level",
    special: false
  },
  {
    title: "Color Migration",
    task: "Illustrate hues traveling from one artwork to another",
    special: false
  },
  {
    title: "Fermentation Forest",
    task: "Show a woodland where everything is in various stages of fermentation",
    special: false
  },
  {
    title: "Telepathic Network",
    task: "Show a world where thoughts are shared like internet connections",
    special: false
  },
  {
    title: "Asteroid Mining Operation",
    task: "Show the extraction of resources from space rocks",
    special: false
  },
  {
    title: "Bioluminescent World",
    task: "Imagine a planet where all life glows with natural light",
    special: false
  },
  {
    title: "Quantum Chess",
    task: "Design a game where pieces exist in multiple positions simultaneously",
    special: false
  },
  {
    title: "Consciousness Transfer",
    task: "Illustrate the movement of awareness between different vessels",
    special: false
  },
  {
    title: "Floating Islands",
    task: "Design a world where landmasses defy gravity",
    special: false
  },
  {
    title: "Symbiotic City",
    task: "Show a metropolis where humans and animals live in perfect harmony",
    special: false
  },
  {
    title: "Pirate Spaceship",
    task: "Show buccaneers raiding vessels among the stars",
    special: false
  },
  {
    title: "Holographic Mentors",
    task: "Create AI teachers that appear as historical figures",
    special: false
  },
  {
    title: "Musical Weather",
    task: "Create atmospheric conditions that produce natural melodies",
    special: false
  },
  {
    title: "Phoenix Nursery",
    task: "Create a place where phoenix eggs are carefully tended",
    special: false
  },
  {
    title: "Zero Gravity Dance",
    task: "Choreograph a performance in weightless conditions",
    special: false
  },
  {
    title: "Dimension Intersection",
    task: "Illustrate the meeting point of multiple realities",
    special: false
  },
  {
    title: "Neon Nights",
    task: "Capture the electric energy of a cyberpunk cityscape at night",
    special: false
  },
  {
    title: "Pneumatic Transit",
    task: "Design a city transportation system using air pressure tubes",
    special: false
  },
  {
    title: "Micro Garden",
    task: "Create a microscopic world maintained by tiny robots",
    special: false
  },
  {
    title: "Memory Restoration Clinic",
    task: "Show facilities that repair damaged or lost memories",
    special: false
  },
  {
    title: "Fairy Highway",
    task: "Design transportation routes used by tiny magical creatures",
    special: false
  },
  {
    title: "Urban Wildlife",
    task: "Illustrate how animals have adapted to city life",
    special: false
  },
  {
    title: "Elevator to Space",
    task: "Illustrate a tower that reaches from Earth to orbital stations",
    special: false
  },
  {
    title: "Curiosity Engine",
    task: "Design a machine that generates questions rather than answers",
    special: false
  },
  {
    title: "Gravity Games",
    task: "Design athletic competitions with adjustable gravitational fields",
    special: false
  },
  {
    title: "Conflict Resolution Chamber",
    task: "Create environments designed to help people find common ground",
    special: false
  },
  {
    title: "Infinite Library",
    task: "Design a repository containing every possible book",
    special: false
  },
  {
    title: "Time Traveler's Dilemma",
    task: "Show the intersection of different historical periods in one scene",
    special: false
  },
  {
    title: "Texture Symphony",
    task: "Show how different surface textures might sound if audible",
    special: false
  },
  {
    title: "Perfect Simulation",
    task: "Show a virtual world indistinguishable from reality",
    special: false
  },
  {
    title: "Living Murals",
    task: "Design wall paintings that grow and change like living organisms",
    special: false
  },
  {
    title: "Wormhole Navigation Station",
    task: "Show facilities for traveling through folded spacetime",
    special: false
  },
  {
    title: "Paper Reality",
    task: "Create a scene where everything is made of folded paper and origami",
    special: false
  },
  {
    title: "Aerial Commute",
    task: "Illustrate the daily migration patterns of flying creatures",
    special: false
  },
  {
    title: "Liquid Metal Forest",
    task: "Imagine trees made of flowing mercury and chrome",
    special: false
  },
  {
    title: "Stone Age Skyscrapers",
    task: "Design massive structures built with primitive tools",
    special: false
  },
  {
    title: "Mythical Creatures",
    task: "Bring to life a creature from ancient mythology in a modern setting",
    special: false
  },
  {
    title: "Color Thief",
    task: "Depict a world slowly losing its colors to a mysterious force",
    special: false
  },
  {
    title: "Edible Flowers Field",
    task: "Design a meadow where every flower is also a delicious ingredient",
    special: false
  },
  {
    title: "Desert Oasis",
    task: "Create a haven of life and color in an endless desert landscape",
    special: false
  },
  {
    title: "Nocturnal Neighborhood",
    task: "Reveal the hidden world of night-active urban animals",
    special: false
  },
  {
    title: "Empathy Engine",
    task: "Create technology that helps people understand each other better",
    special: false
  },
  {
    title: "Abstract Emotions",
    task: "Express a complex emotion through abstract shapes and colors",
    special: false
  },
  {
    title: "Probability Engine",
    task: "Show a device that can calculate and display possible futures",
    special: false
  },
  {
    title: "Medieval Internet",
    task: "Show how social networks might have worked in the Middle Ages",
    special: false
  },
  {
    title: "Robot Emotions",
    task: "Show androids experiencing and expressing human feelings",
    special: false
  },
  {
    title: "Celebration Factory",
    task: "Show a place where festivals and parties are planned and produced",
    special: false
  },
  {
    title: "Living Bridges",
    task: "Design spans that grow and adapt like living organisms",
    special: false
  },
  {
    title: "Ancient Technology",
    task: "Blend archaeological discoveries with advanced alien technology",
    special: false
  },
  {
    title: "Transparent Walls",
    task: "Create privacy through means other than visual barriers",
    special: false
  },
  {
    title: "Evolution Accelerator",
    task: "Show life forms developing at incredible speeds",
    special: false
  },
  {
    title: "Magnetic Field Visualizer",
    task: "Make invisible energy fields visible and beautiful",
    special: false
  },
  {
    title: "Underground Suburbs",
    task: "Design residential communities beneath the earth's surface",
    special: false
  },
  {
    title: "Emotional Archaeology",
    task: "Show the excavation of feelings from the past",
    special: false
  },
  {
    title: "Luminous Literature",
    task: "Create books that tell stories through patterns of light",
    special: false
  },
  {
    title: "Visible Music",
    task: "Show sound waves as tangible, interactive sculptures",
    special: false
  },
  {
    title: "Molecular Gastronomy Lab",
    task: "Show a kitchen where food is created at the atomic level",
    special: false
  },
  {
    title: "Egg Dreams",
    task: "Create art that blends cosmic elements with dreamlike imagery",
    special: false
  },
  {
    title: "Viking Space Program",
    task: "Imagine Norse explorers conquering the cosmos",
    special: false
  },
  {
    title: "Emotion Chess",
    task: "Create a strategy game based on feelings rather than logic",
    special: false
  },
  {
    title: "Spice Route Map",
    task: "Visualize the historical journey of spices around the world",
    special: false
  },
  {
    title: "Weather Painter",
    task: "Show an artist who creates weather patterns instead of traditional art",
    special: false
  },
  {
    title: "Community Memory Palace",
    task: "Design shared spaces for storing collective experiences",
    special: false
  },
  {
    title: "Retro Futurism",
    task: "Imagine the future as seen from the 1980s perspective",
    special: false
  },
  {
    title: "Dragon Architect",
    task: "Show a dragon designing and building fantastical structures",
    special: false
  },
  {
    title: "Infinite Moment",
    task: "Create a single instant stretched into infinity",
    special: false
  },
  {
    title: "Collaborative Canvas",
    task: "Design artwork that requires multiple artists working simultaneously",
    special: false
  },
  {
    title: "Wind Sculpture Park",
    task: "Design artworks that also function as wind power generators",
    special: false
  },
  {
    title: "Seasons in Minutes",
    task: "Show a place where seasons change every few minutes",
    special: false
  },
  {
    title: "Paradox Portal",
    task: "Create a doorway that leads to logical impossibilities",
    special: false
  },
  {
    title: "Extreme Parkour",
    task: "Show urban acrobatics in impossible architectural environments",
    special: false
  },
  {
    title: "Butterfly Migration Map",
    task: "Chart the epic journey of migrating butterflies across continents",
    special: false
  },
  {
    title: "Telepathic Secretary",
    task: "Design a workplace assistant who responds to thoughts",
    special: false
  },
  {
    title: "Lightning Farm",
    task: "Show facilities designed to capture and store electrical storms",
    special: false
  },
  {
    title: "Frozen Dimension",
    task: "Create a world where everything exists in reflection and reverse",
    special: false
  },
  {
    title: "Time-Lapse Gallery",
    task: "Show an art museum where pieces age and evolve over time",
    special: false
  },
  {
    title: "Cellular Assembly Line",
    task: "Design a magical factory producing wonderous items",
    special: false
  },
  {
    title: "Diving Bell City",
    task: "Show an underwater settlement protected by air-filled chambers",
    special: false
  },
  {
    title: "Communication Breakdown",
    task: "Show what happens when language systems fail",
    special: false
  },
  {
    title: "Mechanical Hearts",
    task: "Blend organic and mechanical elements to explore humanity and technology",
    special: false
  },
  {
    title: "Moonbeam Harvest",
    task: "Show the collection and use of lunar light as an energy source",
    special: false
  },
  {
    title: "Floating Neighborhoods",
    task: "Show housing developments that drift on water or air",
    special: false
  },
  {
    title: "Experiential Textbooks",
    task: "Create learning materials that provide hands-on experiences",
    special: false
  },
  {
    title: "Dyson Sphere Construction",
    task: "Illustrate the building of structures around entire stars",
    special: false
  },
  {
    title: "Petal Storm",
    task: "Illustrate a weather phenomenon where flower petals rain from the sky",
    special: false
  },
  {
    title: "Sky Pirates",
    task: "Design airborne adventurers and their flying vessels",
    special: false
  },
  {
    title: "Emotion Pharmacy",
    task: "Design a place where feelings are prescribed like medicine",
    special: false
  },
  {
    title: "Elemental Chef",
    task: "Show a cook who uses fire, water, earth, and air as ingredients",
    special: false
  },
  {
    title: "Solar-Powered Kitchen",
    task: "Design cooking facilities that run entirely on renewable energy",
    special: false
  },
  {
    title: "Holographic Meetings",
    task: "Design conference rooms where participants appear as projections",
    special: false
  },
  {
    title: "Deep Sea Council",
    task: "Show an underwater meeting of the ocean's most mysterious creatures",
    special: false
  },
  {
    title: "Memory Download",
    task: "Illustrate the process of transferring consciousness to a machine",
    special: false
  },
  {
    title: "Synthetic Organ Farm",
    task: "Design a place where replacement body parts are cultivated",
    special: false
  },
  {
    title: "Time-Travel Classroom",
    task: "Show students learning history by visiting the actual events",
    special: false
  },
  {
    title: "Twilight Path Theater",
    task: "Create a performance space where shadows are the main actors",
    special: false
  },
  {
    title: "Sculpture Garden Maze",
    task: "Design a labyrinth where the walls are living artworks",
    special: false
  },
  {
    title: "Galactic Postal Service",
    task: "Design communication systems spanning multiple star systems",
    special: false
  },
  {
    title: "Cloud Cities",
    task: "Show civilizations built on and within cloud formations",
    special: false
  },
  {
    title: "Career Counselor AI",
    task: "Show artificial intelligence helping people find their calling",
    special: false
  },
  {
    title: "Musical Colors",
    task: "Visualize how different sounds might appear as visible colors and shapes",
    special: false
  },
  {
    title: "Laser Light Garden",
    task: "Design a botanical space using only projected light beams",
    special: false
  },
  {
    title: "Time Crystals",
    task: "Visualize crystals that contain frozen moments in time",
    special: false
  },
  {
    title: "Post-Apocalyptic Nature",
    task: "Show how nature might reclaim the world after human civilization",
    special: false
  },
  {
    title: "Metamorphic Materials",
    task: "Show clothing that transforms for different occasions",
    special: false
  },
  {
    title: "Reality Editor",
    task: "Create tools for modifying the fundamental nature of existence",
    special: false
  },
  {
    title: "Frequency Forest",
    task: "Show trees that grow according to different audio frequencies",
    special: false
  },
  {
    title: "Dream Marketplace",
    task: "Design a bazaar where dreams and nightmares are bought and sold",
    special: false
  },
  {
    title: "Potion Weather",
    task: "Imagine a world where weather consists of magical potions",
    special: false
  },
  {
    title: "Nomadic Architecture",
    task: "Create buildings that can pack up and move to new locations",
    special: false
  },
  {
    title: "Synesthesia Symphony",
    task: "Show music as a visual, tactile, and aromatic experience",
    special: false
  },
  {
    title: "Color Mathematics",
    task: "Visualize complex equations using only color and form",
    special: false
  },
  {
    title: "Extinct Species Reunion",
    task: "Bring together creatures from different extinction events",
    special: false
  },
  {
    title: "Healing Circle Garden",
    task: "Create spaces specifically designed for community emotional recovery",
    special: false
  },
  {
    title: "Robotic Apprentice",
    task: "Illustrate machines learning traditional trades from human masters",
    special: false
  },
  {
    title: "Ice Age Tropics",
    task: "Imagine tropical life thriving in a frozen world",
    special: false
  },
  {
    title: "Magic Pollution",
    task: "Illustrate the environmental impact of overused magic",
    special: false
  },
  {
    title: "Sunrise Factory",
    task: "Design a facility that manufactures and distributes daylight",
    special: false
  },
  {
    title: "Universal Translator",
    task: "Create communication between entirely different forms of existence",
    special: false
  },
  {
    title: "Renaissance Robots",
    task: "Create mechanical beings designed by Leonardo da Vinci",
    special: false
  },
  {
    title: "Invisible City",
    task: "Design an urban environment that can only be seen under special conditions",
    special: false
  },
  {
    title: "Coral Skyscrapers",
    task: "Design towering structures grown from living coral",
    special: false
  },
  {
    title: "Urban Jungle",
    task: "Design a cityscape where nature has reclaimed urban spaces",
    special: false
  },
  {
    title: "Crystallized Cuisine",
    task: "Turn favorite dishes into beautiful crystal formations",
    special: false
  },
  {
    title: "Echo Chamber World",
    task: "Show a place where every sound creates infinite reverberations",
    special: false
  },
  {
    title: "Knowledge Trees",
    task: "Design plants that grow information instead of fruit",
    special: false
  },
  {
    title: "Memory Palace",
    task: "Illustrate a physical building constructed from someone's memories",
    special: false
  },
  {
    title: "Quantum Realms",
    task: "Visualize the strange world of quantum physics and parallel universes",
    special: false
  },
  {
    title: "Harmonic Architecture",
    task: "Build structures that resonate with specific musical notes",
    special: false
  },
  {
    title: "Sound Sculpture",
    task: "Build three-dimensional forms from solidified music",
    special: false
  },
  {
    title: "Magnetic Levitation Highway",
    task: "Show vehicles floating above magnetized roadways",
    special: false
  },
  {
    title: "Human-Powered City",
    task: "Design urban infrastructure that runs on human kinetic energy",
    special: false
  },
  {
    title: "Holographic History",
    task: "Display historical events as interactive light projections",
    special: false
  },
  {
    title: "Wizard's Retirement",
    task: "Show what happens when powerful mages grow old",
    special: false
  },
  {
    title: "AI Dreams",
    task: "Visualize what an artificial intelligence might dream about",
    special: false
  },
  {
    title: "Seasonal Homes",
    task: "Design residences that change completely with the weather",
    special: false
  },
  {
    title: "Flavor Painter",
    task: "Create art where taste is the primary medium",
    special: false
  },
  {
    title: "Fusion Reaction Garden",
    task: "Show clean nuclear energy production in beautiful settings",
    special: false
  },
  {
    title: "Abstract Architecture",
    task: "Design buildings based on mathematical concepts and theories",
    special: false
  },
  {
    title: "Tidal Power Plant",
    task: "Create a facility that harnesses wave energy in beautiful ways",
    special: false
  },
  {
    title: "Syrup Waterfall",
    task: "Create a landscape where sweet syrups flow like water",
    special: false
  },
  {
    title: "Silent Conversation",
    task: "Design a rich dialogue using only visual and gestural elements",
    special: false
  },
  {
    title: "Skill Download Station",
    task: "Design a facility where abilities can be instantly transferred",
    special: false
  },
  {
    title: "Invisible Familiar",
    task: "Depict the relationship between a mage and their unseen companion",
    special: false
  },
  {
    title: "Zero-G Olympics",
    task: "Design sporting events that take place in weightless conditions",
    special: false
  },
  {
    title: "Egyptian Space Station",
    task: "Design orbital facilities inspired by ancient Egyptian architecture",
    special: false
  },
  {
    title: "Living Room Forest",
    task: "Show interior spaces that are also thriving ecosystems",
    special: false
  },
  {
    title: "Telepathic Sports",
    task: "Show competitive events based on mental rather than physical ability",
    special: false
  },
  {
    title: "Genetic Garden Center",
    task: "Create a nursery where DNA modifications are grown like plants",
    special: false
  },
  {
    title: "Black Hole Observatory",
    task: "Show scientific stations studying the universe's most mysterious objects",
    special: false
  },
  {
    title: "Geothermal Gardens",
    task: "Create beautiful spaces heated by the earth's core",
    special: false
  },
  {
    title: "Living Architecture",
    task: "Show buildings that grow, breathe, and evolve like living organisms",
    special: false
  },
  {
    title: "Volcanic Paradise",
    task: "Design a beautiful oasis surrounding an active volcano",
    special: false
  },
  {
    title: "Multilingual Mind",
    task: "Illustrate the brain of someone fluent in dozens of languages",
    special: false
  },
  {
    title: "Emotional Labor Exchange",
    task: "Create a marketplace where feelings are professional services",
    special: false
  },
  {
    title: "Pearl Cultivation",
    task: "Design a farm where various types of pearls are grown",
    special: false
  },
  {
    title: "Emoji Evolution",
    task: "Illustrate how pictographic communication might develop",
    special: false
  },
  {
    title: "Sidewalk Streams",
    task: "Design pedestrian paths that flow like rivers through cities",
    special: false
  },
  {
    title: "Shadow Puppets",
    task: "Bring shadow play to life in a three-dimensional world",
    special: false
  },
  {
    title: "Perspective Playground",
    task: "Create art that looks completely different from each viewpoint",
    special: false
  },
  {
    title: "Aztec Computers",
    task: "Imagine advanced computing built with Mesoamerican aesthetics",
    special: false
  },
  {
    title: "Sonic Boom Garden",
    task: "Design a space where sound barriers create beautiful displays",
    special: false
  },
  {
    title: "Micro Safari",
    task: "Create an adventure through the world of tiny organisms",
    special: false
  },
  {
    title: "Digital Dialect",
    task: "Create new forms of expression unique to artificial intelligence",
    special: false
  },
  {
    title: "Weather-Responsive Wear",
    task: "Show garments that automatically adjust to climate conditions",
    special: false
  },
  {
    title: "Submarine Forest",
    task: "Illustrate an underwater woodland of kelp and sea plants",
    special: false
  },
  {
    title: "Underground Rapids",
    task: "Show a subterranean river system used for rapid transit",
    special: false
  },
  {
    title: "Emotional Textiles",
    task: "Show fabrics that change based on the wearer's feelings",
    special: false
  },
  {
    title: "Meditation Dimension",
    task: "Create a separate reality accessible only through deep meditation",
    special: false
  },
  {
    title: "Celtic Circuitry",
    task: "Blend intricate Celtic knots with electronic patterns",
    special: false
  },
  {
    title: "Thought Bubbles",
    task: "Make thinking visible as floating, interactive bubbles",
    special: false
  },
  {
    title: "Camouflage Couture",
    task: "Design fashion that blends with different environments",
    special: false
  },
  {
    title: "Living Fabric",
    task: "Design clothing materials that grow, heal, and adapt",
    special: false
  },
  {
    title: "Collaborative Dreams",
    task: "Show multiple people sharing the same educational dream",
    special: false
  },
  {
    title: "Stereo Separation",
    task: "Illustrate left and right audio channels as separate physical spaces",
    special: false
  },
  {
    title: "Empathy Simulator",
    task: "Create a device that allows people to experience others' perspectives",
    special: false
  },
  {
    title: "Sign Language Symphony",
    task: "Create a musical performance using only hand movements",
    special: false
  },
  {
    title: "Armor Evolution",
    task: "Track the development of protective gear from medieval to futuristic",
    special: false
  },
  {
    title: "Infinity Mirror",
    task: "Design reflections that reveal infinite parallel selves",
    special: false
  },
  {
    title: "Virtual Reality Arena",
    task: "Create a space where digital and physical sports merge",
    special: false
  },
  {
    title: "Roman Social Media",
    task: "Illustrate how ancient Romans might have used modern communication",
    special: false
  },
  {
    title: "Animal Architects",
    task: "Show different species collaborating to build structures",
    special: false
  },
  {
    title: "Gravity Painting",
    task: "Create art using gravitational forces as the brush",
    special: false
  },
  {
    title: "Herb Symphony",
    task: "Arrange cooking herbs to create a visual musical composition",
    special: false
  },
  {
    title: "Time-Release Flavors",
    task: "Design meals that reveal new tastes over time",
    special: false
  },
  {
    title: "Stellar Cartographer",
    task: "Illustrate the mapping of undiscovered regions of space",
    special: false
  },
  {
    title: "Translator's Paradox",
    task: "Illustrate the challenges of converting between incompatible concepts",
    special: false
  },
  {
    title: "Memory Foam Fashion",
    task: "Design garments that remember and return to perfect fit",
    special: false
  },
  {
    title: "Immune System Army",
    task: "Visualize the body's defense mechanisms as tiny warriors",
    special: false
  },
  {
    title: "Diagnostic Dreams",
    task: "Design a system where health issues are revealed through dreams",
    special: false
  },
  {
    title: "Cultural Exchange Hub",
    task: "Show a place where different traditions blend and merge",
    special: false
  },
  {
    title: "Exoplanet Garden",
    task: "Design plant life for worlds orbiting distant stars",
    special: false
  },
  {
    title: "Aurora Workshop",
    task: "Show artisans crafting northern lights by hand",
    special: false
  },
  {
    title: "Time-Shift Commute",
    task: "Show people traveling by moving through different time periods",
    special: false
  },
  {
    title: "Zero-Point Energy Harvester",
    task: "Create devices that tap into the quantum vacuum",
    special: false
  },
  {
    title: "Orchestra Pit Orchestra",
    task: "Create a musical performance within another musical performance",
    special: false
  },
  {
    title: "Aurora Garden",
    task: "Create a botanical garden where northern lights grow like plants",
    special: false
  },
  {
    title: "Pocket Universe",
    task: "Create a tiny cosmos contained within an everyday object",
    special: false
  },
  {
    title: "Fractal Fashion Show",
    task: "Create clothing designs based on mathematical patterns",
    special: false
  },
  {
    title: "Language Ecosystem",
    task: "Show different languages as living, interacting environments",
    special: false
  },
  {
    title: "Social Skills Laboratory",
    task: "Show a place where interpersonal abilities are practiced and refined",
    special: false
  },
  {
    title: "Volunteer Coordination Center",
    task: "Design systems that match helpers with those in need",
    special: false
  },
  {
    title: "Vertical Farm Office",
    task: "Create a workspace integrated with agricultural production",
    special: false
  },
  {
    title: "Solar Panel Suit",
    task: "Create fashionable clothing that generates clean energy",
    special: false
  },
  {
    title: "Pain Color Therapy",
    task: "Show treatment where discomfort is visualized and adjusted as colors",
    special: false
  },
  {
    title: "Tsunami Surfing",
    task: "Illustrate the extreme sport of riding massive waves",
    special: false
  },
  {
    title: "Time-Dilated Racing",
    task: "Create a sport where competitors race through different time speeds",
    special: false
  },
  {
    title: "Flexible Workspace",
    task: "Design an office that physically reconfigures for different tasks",
    special: false
  },
  {
    title: "Cosmic Garden",
    task: "Create life forms that exist in the vacuum of space",
    special: false
  },
  {
    title: "Planetary Terraforming",
    task: "Show the process of making hostile worlds habitable",
    special: false
  },
  {
    title: "Time Collage",
    task: "Layer different moments in time into a single image",
    special: false
  },
  {
    title: "Silent Symphony",
    task: "Design a concert experienced through other senses besides hearing",
    special: false
  },

  // Additional curated challenges
  {
    title: "Mirror Dimension",
    task: "Create a world where everything exists in reflection and reverse",
    special: false
  },
  {
    title: "Clockwork Symphony",
    task: "Design a musical performance powered entirely by mechanical instruments",
    special: false
  },
  {
    title: "Gravity Storm",
    task: "Illustrate a phenomenon where gravity behaves unpredictably",
    special: false
  },
  {
    title: "Living Architecture",
    task: "Show buildings that grow, breathe, and evolve like living organisms",
    special: false
  },
  {
    title: "Color Thief",
    task: "Depict a world slowly losing its colors to a mysterious force",
    special: false
  },
  {
    title: "Paper Reality",
    task: "Create a scene where everything is made of folded paper and origami",
    special: false
  },
  {
    title: "Shadow Puppets",
    task: "Bring shadow play to life in a three-dimensional world",
    special: false
  },
  {
    title: "Frozen Lightning",
    task: "Capture the moment when lightning becomes solid and permanent",
    special: false
  },
  {
    title: "Dream Marketplace",
    task: "Design a bazaar where dreams and nightmares are bought and sold",
    special: false
  },
  {
    title: "Reverse Aging",
    task: "Show a world where people grow younger instead of older",
    special: false
  },
  {
    title: "Musical Colors",
    task: "Visualize how different sounds might appear as visible colors and shapes",
    special: false
  },
  {
    title: "Pocket Universe",
    task: "Create a tiny cosmos contained within an everyday object",
    special: false
  },
  {
    title: "Memory Palace",
    task: "Illustrate a physical building constructed from someone's memories",
    special: false
  },
  {
    title: "Seasonal Collision",
    task: "Show all four seasons existing simultaneously in one location",
    special: false
  },
  {
    title: "Invisible City",
    task: "Design an urban environment that can only be seen under special conditions",
    special: false
  },
  {
    title: "Emotion Engine",
    task: "Create a machine that runs on human feelings and emotions",
    special: false
  },
  {
    title: "Liquid Metal Forest",
    task: "Imagine trees made of flowing mercury and chrome",
    special: false
  },
  {
    title: "Time Crystals",
    task: "Visualize crystals that contain frozen moments in time",
    special: false
  },
  {
    title: "Weather Painter",
    task: "Show an artist who creates weather patterns instead of traditional art",
    special: false
  },
  {
    title: "Upside Down Rain",
    task: "Depict a world where rain falls upward from the ground to the sky",
    special: false
  },

  // Special occasion challenges
  {
    title: "New Year's Resolution Machine",
    task: "Design a fantastical device that helps people achieve their goals for the new year",
    special: true,
    occasions: ["01-01"]
  },
  {
    title: "Groundhog Day Loop",
    task: "Create art showing the same moment repeating with subtle variations",
    special: true,
    occasions: ["02-02"]
  },
  {
    title: "Valentine's Dimension",
    task: "Create a realm where love takes physical form and shapes reality",
    special: true,
    occasions: ["02-14"]
  },
  {
    title: "Leap Year Anomaly",
    task: "Show what happens to time during the extra day that occurs every four years",
    special: true,
    occasions: ["02-29"]
  },
  {
    title: "Spring Awakening",
    task: "Illustrate the moment when winter transforms into spring",
    special: true,
    occasions: ["03-20"]
  },
  {
    title: "April Fool's Reality",
    task: "Design a world where physics and logic work in reverse",
    special: true,
    occasions: ["04-01"]
  },
  {
    title: "Earth Day Renaissance",
    task: "Show the planet healing and regenerating itself",
    special: true,
    occasions: ["04-22"]
  },
  {
    title: "Summer Solstice Power",
    task: "Capture the peak energy of the longest day of the year",
    special: true,
    occasions: ["06-21"]
  },
  {
    title: "Independence Celebration",
    task: "Create a cosmic-scale fireworks display among the stars",
    special: true,
    occasions: ["07-04"]
  },
  {
    title: "Autumn Equinox Balance",
    task: "Show the perfect equilibrium between light and darkness",
    special: true,
    occasions: ["09-22"]
  },
  {
    title: "Halloween Metamorphosis",
    task: "Show the transformation between mundane objects and their spooky alternatives",
    special: true,
    occasions: ["10-31"]
  },
  {
    title: "Thanksgiving Abundance",
    task: "Visualize gratitude as a tangible, overflowing force",
    special: true,
    occasions: ["11-28"]
  },
  {
    title: "Winter Solstice Return",
    task: "Capture the return of light during the darkest day of the year",
    special: true,
    occasions: ["12-21"]
  },
  {
    title: "Christmas Magic Workshop",
    task: "Design the ultimate creative space where holiday magic is crafted",
    special: true,
    occasions: ["12-25"]
  },
  {
    title: "New Year's Eve Countdown",
    task: "Show time itself preparing to reset and begin anew",
    special: true,
    occasions: ["12-31"]
  }
];

// Dynamic generation elements
const challengeElements = {
  themes: [
    "cosmic",
    "urban",
    "underwater",
    "steampunk",
    "cyberpunk",
    "medieval",
    "futuristic",
    "post-apocalyptic",
    "magical",
    "mechanical",
    "organic",
    "crystalline",
    "ethereal",
    "industrial",
    "pastoral",
    "arctic",
    "desert",
    "volcanic",
    "microscopic",
    "quantum"
  ],

  subjects: [
    "city",
    "forest",
    "creature",
    "machine",
    "portal",
    "temple",
    "laboratory",
    "garden",
    "workshop",
    "arena",
    "marketplace",
    "library",
    "theater",
    "sanctuary",
    "fortress",
    "bridge",
    "tower",
    "vessel",
    "realm",
    "nexus"
  ],

  styles: [
    "abstract",
    "realistic",
    "surreal",
    "minimalist",
    "detailed",
    "geometric",
    "organic",
    "symmetrical",
    "chaotic",
    "elegant",
    "brutal",
    "delicate",
    "bold",
    "subtle",
    "monochromatic",
    "vibrant",
    "dark",
    "luminous",
    "textured",
    "smooth"
  ],

  actions: [
    "emerging",
    "dissolving",
    "transforming",
    "floating",
    "growing",
    "awakening",
    "colliding",
    "merging",
    "separating",
    "rotating",
    "pulsing",
    "flowing",
    "fracturing",
    "healing",
    "expanding",
    "contracting",
    "illuminating",
    "shadowing",
    "reflecting",
    "refracting"
  ],

  elements: [
    "light",
    "shadow",
    "water",
    "fire",
    "earth",
    "air",
    "metal",
    "wood",
    "crystal",
    "energy",
    "time",
    "space",
    "sound",
    "color",
    "texture",
    "movement",
    "stillness",
    "chaos",
    "order",
    "memory",
    "dreams",
    "thoughts",
    "emotions",
    "life",
    "death"
  ],

  modifiers: [
    "ancient",
    "futuristic",
    "hidden",
    "forbidden",
    "lost",
    "discovered",
    "sacred",
    "cursed",
    "blessed",
    "forgotten",
    "remembered",
    "infinite",
    "microscopic",
    "colossal",
    "transparent",
    "opaque",
    "living",
    "mechanical",
    "hybrid",
    "pure",
    "corrupted"
  ]
};

// Challenge generator
function generateHybridChallenge(date) {
  const dateStr = date.toISOString().split("T")[0];
  const monthDay = dateStr.substring(5);
  const special = curatedChallenges.find(c => c.special && c.occasions.includes(monthDay));
  if (special) return special;

  const seed = dateStr.split("-").reduce((acc, part) => acc + parseInt(part), 0);
  const useCurated = seed % 10 < 3;

  if (useCurated) {
    const regular = curatedChallenges.filter(c => !c.special);
    return regular[seed % regular.length];
  }

  const getRandom = (arr, offset = 0) => arr[(seed + offset * 7) % arr.length];
  const theme = getRandom(challengeElements.themes, 1);
  const subject = getRandom(challengeElements.subjects, 2);
  const style = getRandom(challengeElements.styles, 3);
  const action = getRandom(challengeElements.actions, 5);
  const element = getRandom(challengeElements.elements, 6);

  return {
    title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} ${subject.charAt(0).toUpperCase() + subject.slice(1)}`,
    task: `Create a ${style} ${theme} ${subject} that is ${action} with ${element}`,
    generated: true
  };
}

// Scheduled function (midnight UTC)
exports.createDailyChallenge = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "UTC",
  },
  async (context) => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    const docRef = db.collection("dailyChallenges").doc(dateStr);
    const existing = await docRef.get();
    if (existing.exists) {
      logger.info(`Challenge already exists for ${dateStr}`);
      return;
    }

    const challenge = generateHybridChallenge(today);
    const data = {
      id: dateStr,
      title: challenge.title,
      task: challenge.task,
      date: admin.firestore.Timestamp.fromDate(today),
      createdAt: admin.firestore.Timestamp.now(),
      type: challenge.special ? "special" : challenge.generated ? "dynamic" : "curated"
    };

    await docRef.set(data);
    logger.info(`Created ${data.type} daily challenge: ${data.title}`);
  }
);

// Callable: manually add challenge
exports.addChallenge = onCall(async (data, context) => {
  try {
    const { title, task, date } = data;
    const challengeDate = date ? new Date(date) : new Date();
    const dateStr = challengeDate.toISOString().split("T")[0];

    const challengeData = {
      id: dateStr,
      title,
      task,
      date: admin.firestore.Timestamp.fromDate(challengeDate),
      createdAt: admin.firestore.Timestamp.now(),
      type: "manual"
    };

    await db.collection("dailyChallenges").doc(dateStr).set(challengeData);
    return { success: true, challenge: challengeData };
  } catch (error) {
    logger.error("Error creating challenge", error);
    throw new HttpsError("internal", "Failed to create challenge");
  }
});

// Callable: get today's challenge
exports.getTodaysChallenge = onCall(async (data, context) => {
  try {
    const dateStr = new Date().toISOString().split("T")[0];
    const doc = await db.collection("dailyChallenges").doc(dateStr).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    logger.error("Error retrieving today's challenge", error);
    throw new HttpsError("internal", "Failed to get challenge");
  }
});