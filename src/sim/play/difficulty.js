// FRONTLINE - difficulty (M6.39): how hard the other side is on you. Recruit for learning the game (or playing on a
// phone's glass), Operative as it was made, Veteran for those who know it. Only what they do to YOU changes: their
// rounds into each other, the Yellows' fights with the reds, are untouched.
//   hit: how likely a round of theirs is to find you; damage: how much one does; notice: how quickly they make you
//   out; react: how long they take to bring a gun to bear once they have.
export const DIFFICULTY = {
  recruit:   { name: 'Recruit', hit: 0.65, damage: 0.6, notice: 0.7, react: 1.35, about: 'They miss more, hurt less, and are slower to see you and to fire.' },
  operative: { name: 'Operative', hit: 1, damage: 1, notice: 1, react: 1, about: 'As it was made.' },
  veteran:   { name: 'Veteran', hit: 1.25, damage: 1.35, notice: 1.25, react: 0.8, about: 'Sharper eyes, quicker hands, harder rounds.' },
};
export const diffOf = (id) => DIFFICULTY[id] || DIFFICULTY.operative;
