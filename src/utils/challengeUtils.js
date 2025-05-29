export const getTypeColor = (type) => {
  switch (type) {
    case "special":
      return "bg-gold-500/20 text-gold-300 border-gold-500/30";
    case "dynamic":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "curated":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "manual":
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    default:
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  }
};

export const getRandomInspiration = () => {
  const inspirations = [
    "A ethereal nebula with crystalline formations floating within",
    "Sleeping figures whose dreams manifest as glowing galaxies around them",
    "A cosmic library where knowledge takes the form of swirling stardust",
    "Dreamcatchers that capture actual pieces of the cosmos",
    "A surreal landscape where gravity flows like water through space",
    "Celestial beings painting aurora across the void of space",
    "A dream sequence where memories become constellations",
    "Floating islands connected by streams of liquid starlight",
    "A cosmic garden where flowers are made of compressed starlight",
    "Portals between dimensions opening in a dreamer's mind"
  ];

  return inspirations[Math.floor(Math.random() * inspirations.length)];
};
