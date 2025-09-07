export const ollCases = [
  { triple: "---", ollCase: "SUNE", orientation: "B" },
  { triple: "--0", ollCase: "SUNE", orientation: "L" },
  { triple: "-0-", ollCase: "SUNE", orientation: "F" },
  { triple: "0--", ollCase: "SUNE", orientation: "R" },

  { triple: "++0", ollCase: "ANTISUNE", orientation: "B" },
  { triple: "+0+", ollCase: "ANTISUNE", orientation: "L" },
  { triple: "0++", ollCase: "ANTISUNE", orientation: "F" },
  { triple: "+++", ollCase: "ANTISUNE", orientation: "R" },

  { triple: "0-0", ollCase: "L", orientation: "B" },
  { triple: "-0+", ollCase: "L", orientation: "L" },
  { triple: "0+0", ollCase: "L", orientation: "F" },
  { triple: "+0-", ollCase: "L", orientation: "L" },
  
  { triple: "-00", ollCase: "T", orientation: "R" },
  { triple: "00+", ollCase: "T", orientation: "B" },
  { triple: "0+-", ollCase: "T", orientation: "L" },
  { triple: "+-0", ollCase: "T", orientation: "F" },
  
  { triple: "00-", ollCase: "U", orientation: "B" },
  { triple: "0-+", ollCase: "U", orientation: "L" },
  { triple: "-+0", ollCase: "U", orientation: "F" },
  { triple: "+00", ollCase: "U", orientation: "R" },
  
  { triple: "++-", ollCase: "PI", orientation: "R" },
  { triple: "+--", ollCase: "PI", orientation: "B" },
  { triple: "--+", ollCase: "PI", orientation: "L" },
  { triple: "-++", ollCase: "PI", orientation: "F" },
  
  { triple: "+-+", ollCase: "H", orientation: "L" },
  { triple: "-+-", ollCase: "H", orientation: "F" },
  { triple: "+-+", ollCase: "H", orientation: "R" },
  { triple: "-+-", ollCase: "H", orientation: "B" },
];