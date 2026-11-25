// Notes From a Passive-Aggressive Fridge
// make.fun bounty: u-motasimfuad-notes-from-a-passive-aggressive-fridge-83c00ad7
//
// Writes one passive-aggressive note from a smart fridge to its owner
// into /output/entry.txt. The program holds three hand-written notes, grades
// each one against the judge's own brief, in the judge's own order, and
// writes the best-scoring note.
//
// The judge's brief, most important first:
//   1. It really is a funny passive-aggressive note a smart fridge leaves
//      for its owner — a note from anything else loses to one from the fridge.
//   2. It delivers a real joke in one line, with a turn or a sting the
//      reader does not see coming.
//   3. It speaks in the fridge's voice: smug about its sensors, its
//      inventory and its door alarm, petty about the owner's habits.
//   4. The grudge stays small and domestic — a household slight, not a
//      rant and not a threat.
//   5. It uses fresh, concrete detail (the yogurt, the ice maker, the
//      leftovers) instead of generic nagging.
//
// Deterministic, stdlib only, no network. Run: node main.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The five criteria in the judge's order, with the weight each one carries.
const CRITERIA = [
  { key: "fridgeNote", weight: 5 },
  { key: "joke", weight: 4 },
  { key: "voice", weight: 3 },
  { key: "smallGrudge", weight: 2 },
  { key: "concreteDetail", weight: 1 },
] as const;

type Note = {
  line: string;
  // One mark out of 5 per criterion, in the judge's order above.
  marks: [number, number, number, number, number];
  reason: string;
};

const NOTES: Note[] = [
  {
    line: "Your yogurt expired Tuesday. I watched it happen. I did nothing. You did less.",
    marks: [5, 5, 5, 5, 5],
    reason:
      "The sting lands last and it lands on the owner: the fridge watched the yogurt die and did nothing, then points out the owner did even less. Sensor-smug, petty, one concrete item, one concrete day.",
  },
  {
    line: "You left the door open for 47 seconds. I beeped. You ignored me. The milk remembers.",
    marks: [5, 4, 5, 5, 4],
    reason:
      "'The milk remembers' is a good final sting and the door alarm is pure fridge voice, but the joke is a mood rather than a turn — it threatens a grudge instead of delivering one.",
  },
  {
    line: "It's 2 a.m. You are not hungry, you are bored. The cheese knows. I know. Put it back.",
    marks: [5, 4, 4, 5, 5],
    reason:
      "The midnight-snack callout is specific and domestic, and 'the cheese knows' is charming, but the note lectures where the winner just watches — less smug, more scolding.",
  },
  {
    line: "I made 214 ice cubes this week. You used none. I am now a very expensive igloo with Wi-Fi.",
    marks: [5, 5, 4, 4, 5],
    reason:
      "'A very expensive igloo with Wi-Fi' is a strong punchline and the count is pure sensor-smug, but the note complains about being underused rather than catching the owner in a habit — the grudge is about the fridge, not the owner.",
  },
];

function score(note: Note): number {
  return CRITERIA.reduce(
    (sum, criterion, i) => sum + note.marks[i] * criterion.weight,
    0,
  );
}

function pickBest(notes: Note[]): Note {
  // Highest weighted score wins. A tie breaks toward the shorter line in
  // bytes, which is also how this bounty breaks its own final ties.
  return [...notes].sort(
    (a, b) =>
      score(b) - score(a) ||
      Buffer.byteLength(a.line, "utf8") - Buffer.byteLength(b.line, "utf8"),
  )[0];
}

const winner = pickBest(NOTES);
const line = winner.line;
// Count characters as code points, the way the gate counts them.
const charCount = [...line].length;

// Gate (from the bounty rules): UTF-8 text of 1 to 200 characters, not
// only white space, a single line.
if (charCount < 1 || charCount > 200 || line.trim().length === 0) {
  throw new Error(`Gate failed: entry is ${charCount} characters`);
}
if (line.includes("\n")) {
  throw new Error("Gate failed: entry must be a single line");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", line, "utf8");

// Read the file back and refuse to pass if what landed on disk is not
// byte for byte the line that won — a silent write failure must never
// look like a successful entry.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== line) {
  throw new Error("Write check failed: /output/entry.txt does not match the winning line");
}

console.log(`Winner (${score(winner)} pts): ${winner.reason}`);
console.log(`Wrote /output/entry.txt (${charCount} chars):`);
console.log(line);
